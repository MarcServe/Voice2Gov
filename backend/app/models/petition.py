from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class PetitionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    THRESHOLD_REACHED = "THRESHOLD_REACHED"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"
    RESPONDED = "RESPONDED"
    CLOSED = "CLOSED"


class PetitionCategory(str, enum.Enum):
    INFRASTRUCTURE = "INFRASTRUCTURE"
    EDUCATION = "EDUCATION"
    HEALTHCARE = "HEALTHCARE"
    SECURITY = "SECURITY"
    ECONOMY = "ECONOMY"
    ENVIRONMENT = "ENVIRONMENT"
    GOVERNANCE = "GOVERNANCE"
    HUMAN_RIGHTS = "HUMAN_RIGHTS"
    OTHER = "OTHER"


class TimelineEventType(str, enum.Enum):
    CREATED = "CREATED"
    SIGNATURE_MILESTONE = "SIGNATURE_MILESTONE"
    THRESHOLD_REACHED = "THRESHOLD_REACHED"
    EMAIL_SENT = "EMAIL_SENT"
    EMAIL_DELIVERED = "EMAIL_DELIVERED"
    EMAIL_OPENED = "EMAIL_OPENED"
    RESPONSE_RECEIVED = "RESPONSE_RECEIVED"
    CLOSED = "CLOSED"


class Petition(Base):
    __tablename__ = "petitions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(PetitionCategory), nullable=False)
    
    # Target
    target_representative_id = Column(Integer, ForeignKey("representatives.id"), nullable=False)
    
    # Creator
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status & Progress
    status = Column(SQLEnum(PetitionStatus), default=PetitionStatus.ACTIVE)
    signature_count = Column(Integer, default=0)
    signature_goal = Column(Integer, default=1000)
    
    # Tracking timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="petitions")
    target_representative = relationship("Representative", back_populates="petitions")
    signatures = relationship("Signature", back_populates="petition", cascade="all, delete-orphan")
    timeline = relationship("PetitionTimeline", back_populates="petition", cascade="all, delete-orphan")
    responses = relationship("PetitionResponse", back_populates="petition", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Petition {self.title[:50]}...>"


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    comment = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="signatures")
    user = relationship("User", back_populates="signatures")

    def __repr__(self):
        return f"<Signature petition={self.petition_id} user={self.user_id}>"


class PetitionTimeline(Base):
    __tablename__ = "petition_timeline"

    id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.id"), nullable=False)
    
    event_type = Column(SQLEnum(TimelineEventType), nullable=False)
    description = Column(Text, nullable=True)
    meta_data = Column("metadata", Text, nullable=True)  # keep column name even if attribute change
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="timeline")

    def __repr__(self):
        return f"<PetitionTimeline {self.event_type.value}>"


class PetitionResponse(Base):
    __tablename__ = "petition_responses"

    id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.id"), nullable=False)
    
    responder_name = Column(String(255), nullable=True)
    responder_title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    is_official = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="responses")

    def __repr__(self):
        return f"<PetitionResponse petition={self.petition_id}>"

