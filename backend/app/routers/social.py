from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

from ..database import get_db
from ..models.social import SocialPost, SocialDigest, Platform, Sentiment
from ..models.user import User
from ..routers.auth import get_current_user

router = APIRouter()


# Pydantic schemas
class SocialPostResponse(BaseModel):
    id: int
    platform: Platform
    author_handle: str
    author_name: Optional[str]
    content: str
    url: Optional[str]
    likes: int
    shares: int
    comments: int
    sentiment: Optional[Sentiment]
    posted_at: datetime

    class Config:
        from_attributes = True


class DigestResponse(BaseModel):
    id: int
    representative_id: int
    title: str
    summary: str
    period_start: datetime
    period_end: datetime
    is_sent: bool
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Routes
@router.get("/posts")
async def list_social_posts(
    platform: Optional[Platform] = None,
    sentiment: Optional[Sentiment] = None,
    representative_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """List collected social media posts"""
    
    query = db.query(SocialPost).filter(SocialPost.is_moderated == True)
    
    if platform:
        query = query.filter(SocialPost.platform == platform)
    
    if sentiment:
        query = query.filter(SocialPost.sentiment == sentiment)
    
    if representative_id:
        query = query.filter(SocialPost.representative_id == representative_id)
    
    total = query.count()
    
    offset = (page - 1) * limit
    posts = query.order_by(SocialPost.posted_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "posts": [
            {
                "id": p.id,
                "platform": p.platform,
                "authorHandle": p.author_handle,
                "authorName": p.author_name,
                "content": p.content,
                "url": p.url,
                "likes": p.likes,
                "shares": p.shares,
                "comments": p.comments,
                "sentiment": p.sentiment,
                "postedAt": p.posted_at
            }
            for p in posts
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/digests")
async def list_digests(
    representative_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """List social media digests"""
    
    query = db.query(SocialDigest)
    
    if representative_id:
        query = query.filter(SocialDigest.representative_id == representative_id)
    
    total = query.count()
    
    offset = (page - 1) * limit
    digests = query.order_by(SocialDigest.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "digests": [
            {
                "id": d.id,
                "representativeId": d.representative_id,
                "title": d.title,
                "summary": d.summary,
                "periodStart": d.period_start,
                "periodEnd": d.period_end,
                "isSent": d.is_sent,
                "sentAt": d.sent_at,
                "createdAt": d.created_at
            }
            for d in digests
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/digests/{digest_id}")
async def get_digest(digest_id: int, db: Session = Depends(get_db)):
    """Get a specific digest with included posts"""
    
    digest = db.query(SocialDigest).filter(SocialDigest.id == digest_id).first()
    
    if not digest:
        raise HTTPException(status_code=404, detail="Digest not found")
    
    # Get included posts
    posts = db.query(SocialPost).filter(
        SocialPost.is_included_in_digest == True,
        SocialPost.posted_at >= digest.period_start,
        SocialPost.posted_at <= digest.period_end,
        SocialPost.representative_id == digest.representative_id
    ).all()
    
    return {
        "id": digest.id,
        "representativeId": digest.representative_id,
        "title": digest.title,
        "summary": digest.summary,
        "periodStart": digest.period_start,
        "periodEnd": digest.period_end,
        "isSent": digest.is_sent,
        "sentAt": digest.sent_at,
        "createdAt": digest.created_at,
        "posts": [
            {
                "id": p.id,
                "platform": p.platform,
                "authorHandle": p.author_handle,
                "content": p.content,
                "sentiment": p.sentiment,
                "postedAt": p.posted_at
            }
            for p in posts
        ]
    }


@router.get("/stats")
async def get_social_stats(
    representative_id: Optional[int] = None,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get social media statistics"""
    
    since = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(SocialPost).filter(SocialPost.posted_at >= since)
    
    if representative_id:
        query = query.filter(SocialPost.representative_id == representative_id)
    
    total_posts = query.count()
    
    positive = query.filter(SocialPost.sentiment == Sentiment.POSITIVE).count()
    negative = query.filter(SocialPost.sentiment == Sentiment.NEGATIVE).count()
    neutral = query.filter(SocialPost.sentiment == Sentiment.NEUTRAL).count()
    constructive = query.filter(SocialPost.sentiment == Sentiment.CONSTRUCTIVE).count()
    
    twitter = query.filter(SocialPost.platform == Platform.TWITTER).count()
    facebook = query.filter(SocialPost.platform == Platform.FACEBOOK).count()
    instagram = query.filter(SocialPost.platform == Platform.INSTAGRAM).count()
    
    return {
        "period": {
            "days": days,
            "start": since,
            "end": datetime.utcnow()
        },
        "totalPosts": total_posts,
        "bySentiment": {
            "positive": positive,
            "negative": negative,
            "neutral": neutral,
            "constructive": constructive
        },
        "byPlatform": {
            "twitter": twitter,
            "facebook": facebook,
            "instagram": instagram
        }
    }

