from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models.petition import Petition, Signature, PetitionTimeline, PetitionResponse, PetitionStatus, PetitionCategory, TimelineEventType
from ..models.user import User
from ..routers.auth import get_current_user

router = APIRouter()


# Pydantic schemas
class PetitionCreate(BaseModel):
    title: str
    description: str
    category: PetitionCategory
    target_representative_id: int
    signature_goal: Optional[int] = 1000


class PetitionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[PetitionStatus] = None


class SignatureCreate(BaseModel):
    comment: Optional[str] = None
    is_anonymous: bool = False


class TimelineItem(BaseModel):
    id: int
    event_type: TimelineEventType
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ResponseItem(BaseModel):
    id: int
    responder_name: Optional[str]
    responder_title: Optional[str]
    content: str
    is_official: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PetitionListItem(BaseModel):
    id: int
    title: str
    category: PetitionCategory
    status: PetitionStatus
    signature_count: int
    signature_goal: int
    target_representative_name: str
    creator_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class PetitionDetail(BaseModel):
    id: int
    title: str
    description: str
    category: PetitionCategory
    status: PetitionStatus
    signature_count: int
    signature_goal: int
    target_representative_id: int
    target_representative_name: str
    creator_id: int
    creator_name: str
    created_at: datetime
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    responded_at: Optional[datetime]
    closed_at: Optional[datetime]
    timeline: List[TimelineItem]
    responses: List[ResponseItem]

    class Config:
        from_attributes = True


# Routes
@router.post("/", response_model=dict)
async def create_petition(
    petition_data: PetitionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new petition"""
    
    petition = Petition(
        title=petition_data.title,
        description=petition_data.description,
        category=petition_data.category,
        target_representative_id=petition_data.target_representative_id,
        creator_id=current_user.id,
        signature_goal=petition_data.signature_goal
    )
    
    db.add(petition)
    db.commit()
    db.refresh(petition)
    
    # Add creation event to timeline
    timeline_event = PetitionTimeline(
        petition_id=petition.id,
        event_type=TimelineEventType.CREATED,
        description="Petition created"
    )
    db.add(timeline_event)
    db.commit()
    
    return {"id": petition.id, "message": "Petition created successfully"}


@router.get("/", response_model=dict)
async def list_petitions(
    category: Optional[PetitionCategory] = None,
    status: Optional[PetitionStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """List petitions with filtering and pagination"""
    
    query = db.query(Petition).options(
        joinedload(Petition.target_representative),
        joinedload(Petition.creator)
    )
    
    # Apply filters
    if category:
        query = query.filter(Petition.category == category)
    
    if status:
        query = query.filter(Petition.status == status)
    
    if search:
        query = query.filter(Petition.title.ilike(f"%{search}%"))
    
    # Get total
    total = query.count()
    
    # Paginate
    offset = (page - 1) * limit
    petitions = query.order_by(Petition.created_at.desc()).offset(offset).limit(limit).all()
    
    petition_list = []
    for p in petitions:
        petition_list.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "status": p.status,
            "signatureCount": p.signature_count,
            "signatureGoal": p.signature_goal,
            "targetRepresentativeName": p.target_representative.name if p.target_representative else "Unknown",
            "creatorName": p.creator.name if p.creator else "Anonymous",
            "createdAt": p.created_at
        })
    
    return {
        "petitions": petition_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/{petition_id}")
async def get_petition(petition_id: int, db: Session = Depends(get_db)):
    """Get petition details"""
    
    petition = db.query(Petition).options(
        joinedload(Petition.target_representative),
        joinedload(Petition.creator),
        joinedload(Petition.timeline),
        joinedload(Petition.responses)
    ).filter(Petition.id == petition_id).first()
    
    if not petition:
        raise HTTPException(status_code=404, detail="Petition not found")
    
    return {
        "id": petition.id,
        "title": petition.title,
        "description": petition.description,
        "category": petition.category,
        "status": petition.status,
        "signatureCount": petition.signature_count,
        "signatureGoal": petition.signature_goal,
        "targetRepresentativeId": petition.target_representative_id,
        "targetRepresentativeName": petition.target_representative.name if petition.target_representative else "Unknown",
        "creatorId": petition.creator_id,
        "creatorName": petition.creator.name if petition.creator else "Anonymous",
        "createdAt": petition.created_at,
        "sentAt": petition.sent_at,
        "deliveredAt": petition.delivered_at,
        "readAt": petition.read_at,
        "respondedAt": petition.responded_at,
        "closedAt": petition.closed_at,
        "timeline": [
            {
                "id": t.id,
                "eventType": t.event_type,
                "description": t.description,
                "createdAt": t.created_at
            }
            for t in sorted(petition.timeline, key=lambda x: x.created_at)
        ],
        "responses": [
            {
                "id": r.id,
                "responderName": r.responder_name,
                "responderTitle": r.responder_title,
                "content": r.content,
                "isOfficial": r.is_official,
                "createdAt": r.created_at
            }
            for r in petition.responses
        ]
    }


@router.post("/{petition_id}/sign")
async def sign_petition(
    petition_id: int,
    signature_data: SignatureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sign a petition"""
    
    petition = db.query(Petition).filter(Petition.id == petition_id).first()
    if not petition:
        raise HTTPException(status_code=404, detail="Petition not found")
    
    # Check if already signed
    existing = db.query(Signature).filter(
        Signature.petition_id == petition_id,
        Signature.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already signed this petition")
    
    # Create signature
    signature = Signature(
        petition_id=petition_id,
        user_id=current_user.id,
        comment=signature_data.comment,
        is_anonymous=signature_data.is_anonymous
    )
    
    db.add(signature)
    
    # Update signature count
    petition.signature_count += 1
    
    # Check milestones
    milestones = [100, 500, 1000, 5000, 10000]
    for milestone in milestones:
        if petition.signature_count == milestone:
            timeline_event = PetitionTimeline(
                petition_id=petition_id,
                event_type=TimelineEventType.SIGNATURE_MILESTONE,
                description=f"Petition reached {milestone} signatures!"
            )
            db.add(timeline_event)
    
    # Check if threshold reached
    if petition.signature_count >= petition.signature_goal and petition.status == PetitionStatus.ACTIVE:
        petition.status = PetitionStatus.THRESHOLD_REACHED
        timeline_event = PetitionTimeline(
            petition_id=petition_id,
            event_type=TimelineEventType.THRESHOLD_REACHED,
            description=f"Petition reached {petition.signature_goal} signatures! Ready to be sent."
        )
        db.add(timeline_event)
    
    db.commit()
    
    return {"message": "Petition signed successfully", "signatureCount": petition.signature_count}


