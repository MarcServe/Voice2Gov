from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class Platform(str, enum.Enum):
    TWITTER = "TWITTER"
    FACEBOOK = "FACEBOOK"
    INSTAGRAM = "INSTAGRAM"


class Sentiment(str, enum.Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"
    CONSTRUCTIVE = "CONSTRUCTIVE"


class SocialPost(Base):
    __tablename__ = "social_posts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Platform info
    platform = Column(SQLEnum(Platform), nullable=False)
    platform_id = Column(String(100), unique=True, nullable=False)  # Post ID from platform
    
    # Author
    author_handle = Column(String(100), nullable=False)
    author_name = Column(String(255), nullable=True)
    
    # Content
    content = Column(Text, nullable=False)
    url = Column(String(500), nullable=True)
    
    # Engagement
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    
    # Analysis
    sentiment = Column(SQLEnum(Sentiment), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    topics = Column(Text, nullable=True)  # JSON array of topics
    
    # Related representative (if identified)
    representative_id = Column(Integer, ForeignKey("representatives.id"), nullable=True)
    
    # Status
    is_included_in_digest = Column(Boolean, default=False)
    is_moderated = Column(Boolean, default=False)
    
    # Timestamps
    posted_at = Column(DateTime(timezone=True), nullable=False)
    collected_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SocialPost {self.platform.value} {self.platform_id}>"


class SocialDigest(Base):
    __tablename__ = "social_digests"

    id = Column(Integer, primary_key=True, index=True)
    
    # Target
    representative_id = Column(Integer, ForeignKey("representatives.id"), nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    post_ids = Column(Text, nullable=True)  # JSON array of included post IDs
    
    # Period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SocialDigest rep={self.representative_id} {self.period_start.date()}>"


