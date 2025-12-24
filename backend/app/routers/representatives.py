from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models.representative import Representative, ContactInfo, State, Lga, Chamber, ContactType

router = APIRouter()


# Pydantic schemas
class ContactInfoResponse(BaseModel):
    id: int
    contact_type: ContactType
    value: str
    is_primary: bool

    class Config:
        from_attributes = True


class RepresentativeListItem(BaseModel):
    id: int
    name: str
    title: Optional[str]
    chamber: Chamber
    party: Optional[str]
    state: str
    lga: Optional[str]
    constituency: Optional[str]
    senatorial_district: Optional[str]
    photo_url: Optional[str]

    class Config:
        from_attributes = True


class RepresentativeDetail(BaseModel):
    id: int
    name: str
    title: Optional[str]
    chamber: Chamber
    party: Optional[str]
    state: str
    lga: Optional[str]
    constituency: Optional[str]
    senatorial_district: Optional[str]
    ward: Optional[str]
    bio: Optional[str]
    photo_url: Optional[str]
    is_active: bool
    term_start: Optional[datetime]
    term_end: Optional[datetime]
    contact_info: List[ContactInfoResponse]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total: int
    senators: int
    house_reps: int
    lga_chairmen: int
    lga_councillors: int
    state_assembly: int
    governors: int


class PaginatedResponse(BaseModel):
    representatives: List[RepresentativeListItem]
    stats: StatsResponse
    pagination: dict


# Chamber-specific duties
CHAMBER_DUTIES = {
    Chamber.SENATE: {
        "duties": [
            "Make laws for the peace, order and good governance of Nigeria",
            "Approve presidential appointments and nominations",
            "Confirm appointments of judges, ambassadors, and federal commissions",
            "Approve national budget and monitor implementation",
            "Conduct investigations into matters of public interest",
            "Ratify international treaties and agreements"
        ],
        "obligations": [
            "Represent the interests of their senatorial district",
            "Attend Senate sessions and committee meetings",
            "Declare assets before and after tenure",
            "Maintain transparency and accountability",
            "Respond to constituent concerns and petitions"
        ],
        "citizen_rights": [
            "Right to contact your Senator directly via official channels",
            "Right to attend public legislative sessions",
            "Right to submit petitions on matters of public interest",
            "Right to access information on bills and Senate proceedings",
            "Right to recall your Senator through constitutional process"
        ]
    },
    Chamber.HOUSE_OF_REPS: {
        "duties": [
            "Initiate money bills and appropriation bills",
            "Make laws for the peace, order and good governance of Nigeria",
            "Approve the national budget",
            "Investigate activities of government ministries and agencies",
            "Represent the interests of federal constituencies"
        ],
        "obligations": [
            "Represent all constituents regardless of political affiliation",
            "Maintain regular contact with constituency through town halls",
            "Declare assets before and after tenure",
            "Facilitate constituency projects and development"
        ],
        "citizen_rights": [
            "Right to attend public sittings of the House",
            "Right to submit petitions through your representative",
            "Right to be informed about bills affecting your constituency",
            "Right to recall your representative through due process"
        ]
    },
    Chamber.LGA_CHAIRMAN: {
        "duties": [
            "Administer the Local Government Area",
            "Implement policies and programs at the grassroots level",
            "Manage local government revenue and expenditure",
            "Provide basic amenities: roads, water, healthcare, education",
            "Coordinate community development projects"
        ],
        "obligations": [
            "Be accessible to local residents",
            "Hold regular community meetings",
            "Publish quarterly financial statements",
            "Respond to community complaints within reasonable time"
        ],
        "citizen_rights": [
            "Right to access basic services: water, roads, sanitation",
            "Right to report issues directly to the LGA office",
            "Right to information on LGA budget and spending",
            "Right to participate in community development meetings"
        ]
    },
    Chamber.LGA_COUNCILLOR: {
        "duties": [
            "Represent the interests of their ward at the Local Government Council",
            "Participate in council meetings and decision-making",
            "Oversee ward-level development projects and initiatives",
            "Liaise between ward residents and the LGA administration",
            "Monitor and report on community needs and concerns",
            "Facilitate grassroots participation in governance"
        ],
        "obligations": [
            "Be accessible to all ward residents",
            "Hold regular ward meetings and consultations",
            "Report back to constituents on council decisions",
            "Respond promptly to ward-level complaints and requests",
            "Maintain transparency in ward development activities",
            "Work collaboratively with other councillors and the LGA Chairman"
        ],
        "citizen_rights": [
            "Right to direct access to your ward councillor",
            "Right to attend ward meetings and consultations",
            "Right to report local issues (roads, water, sanitation) to your councillor",
            "Right to information on ward development projects and budget",
            "Right to petition your councillor on community matters",
            "Right to hold your councillor accountable for ward representation"
        ]
    },
    Chamber.GOVERNOR: {
        "duties": [
            "Serve as the Chief Executive Officer of the state",
            "Approve or veto bills passed by the State House of Assembly",
            "Appoint commissioners, special advisers, and heads of state agencies",
            "Manage state resources and budget allocation",
            "Ensure security and welfare of all citizens in the state",
            "Implement federal and state policies at the state level",
            "Coordinate development projects across local government areas"
        ],
        "obligations": [
            "Be accountable to the people of the state",
            "Declare assets before and after tenure",
            "Hold regular town hall meetings with citizens",
            "Publish annual state budget and financial reports",
            "Respond to public petitions and concerns",
            "Ensure transparency in governance and procurement",
            "Maintain regular communication with constituents"
        ],
        "citizen_rights": [
            "Right to access state government services and information",
            "Right to attend public state government events and town halls",
            "Right to petition the Governor on matters of public interest",
            "Right to information on state budget, contracts, and projects",
            "Right to hold the Governor accountable through democratic processes",
            "Right to access state healthcare, education, and infrastructure"
        ]
    }
}


# Routes
@router.get("/", response_model=PaginatedResponse)
async def list_representatives(
    state: Optional[str] = Query(None, description="Filter by state name"),
    lga: Optional[str] = Query(None, description="Filter by LGA name"),
    chamber: Optional[Chamber] = Query(None, description="Filter by chamber"),
    party: Optional[str] = Query(None, description="Filter by party"),
    search: Optional[str] = Query(None, description="Search by name or constituency"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List representatives with filtering and pagination"""
    
    query = db.query(Representative).filter(Representative.is_active == True)
    query = query.options(joinedload(Representative.state), joinedload(Representative.lga))
    
    # Apply filters
    if state:
        query = query.join(State).filter(State.name.ilike(f"%{state}%"))
    
    if lga:
        query = query.join(Lga).filter(Lga.name.ilike(f"%{lga}%"))
    
    if chamber:
        query = query.filter(Representative.chamber == chamber)
    
    if party:
        query = query.filter(Representative.party.ilike(f"%{party}%"))
    
    if search:
        query = query.filter(
            or_(
                Representative.name.ilike(f"%{search}%"),
                Representative.constituency.ilike(f"%{search}%"),
                Representative.senatorial_district.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    total = query.count()
    
    # Get stats
    all_reps = db.query(Representative).filter(Representative.is_active == True)
    stats = StatsResponse(
        total=all_reps.count(),
        senators=all_reps.filter(Representative.chamber == Chamber.SENATE).count(),
        house_reps=all_reps.filter(Representative.chamber == Chamber.HOUSE_OF_REPS).count(),
        lga_chairmen=all_reps.filter(Representative.chamber == Chamber.LGA_CHAIRMAN).count(),
        lga_councillors=all_reps.filter(Representative.chamber == Chamber.LGA_COUNCILLOR).count(),
        state_assembly=all_reps.filter(Representative.chamber == Chamber.STATE_ASSEMBLY).count(),
        governors=all_reps.filter(Representative.chamber == Chamber.GOVERNOR).count()
    )
    
    # Paginate
    offset = (page - 1) * limit
    reps = query.offset(offset).limit(limit).all()
    
    # Transform to response format
    rep_list = []
    for rep in reps:
        rep_list.append(RepresentativeListItem(
            id=rep.id,
            name=rep.name,
            title=rep.title,
            chamber=rep.chamber,
            party=rep.party,
            state=rep.state.name if rep.state else "",
            lga=rep.lga.name if rep.lga else None,
            constituency=rep.constituency,
            senatorial_district=rep.senatorial_district,
            photo_url=rep.photo_url
        ))
    
    return PaginatedResponse(
        representatives=rep_list,
        stats=stats,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    )


@router.get("/{rep_id}")
async def get_representative(rep_id: int, db: Session = Depends(get_db)):
    """Get representative details by ID"""
    
    rep = db.query(Representative).options(
        joinedload(Representative.state),
        joinedload(Representative.lga),
        joinedload(Representative.contact_info)
    ).filter(Representative.id == rep_id).first()
    
    if not rep:
        raise HTTPException(status_code=404, detail="Representative not found")
    
    # Get chamber-specific duties
    duties_data = CHAMBER_DUTIES.get(rep.chamber, {
        "duties": [],
        "obligations": [],
        "citizen_rights": []
    })
    
    return {
        "id": rep.id,
        "name": rep.name,
        "title": rep.title,
        "chamber": rep.chamber,
        "party": rep.party,
        "state": rep.state.name if rep.state else "",
        "lga": rep.lga.name if rep.lga else None,
        "constituency": rep.constituency,
        "senatorialDistrict": rep.senatorial_district,
        "ward": rep.ward,
        "bio": rep.bio,
        "photoUrl": rep.photo_url,
        "isActive": rep.is_active,
        "termStart": rep.term_start,
        "termEnd": rep.term_end,
        "contactInfo": [
            {
                "id": str(c.id),
                "contactType": c.contact_type.value.lower(),
                "value": c.value,
                "isPrimary": c.is_primary
            }
            for c in rep.contact_info
        ],
        "duties": duties_data["duties"],
        "obligations": duties_data["obligations"],
        "citizenRights": duties_data["citizen_rights"]
    }


@router.get("/states/list")
async def list_states(db: Session = Depends(get_db)):
    """Get list of all Nigerian states"""
    states = db.query(State).order_by(State.name).all()
    return [{"id": s.id, "name": s.name, "code": s.code} for s in states]


@router.get("/states/{state_id}/lgas")
async def list_lgas_by_state(state_id: int, db: Session = Depends(get_db)):
    """Get list of LGAs for a specific state"""
    lgas = db.query(Lga).filter(Lga.state_id == state_id).order_by(Lga.name).all()
    return [{"id": l.id, "name": l.name} for l in lgas]


