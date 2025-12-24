from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class Chamber(str, enum.Enum):
    SENATE = "SENATE"
    HOUSE_OF_REPS = "HOUSE_OF_REPS"
    STATE_ASSEMBLY = "STATE_ASSEMBLY"
    LGA_CHAIRMAN = "LGA_CHAIRMAN"
    LGA_COUNCILLOR = "LGA_COUNCILLOR"
    GOVERNOR = "GOVERNOR"


class ContactType(str, enum.Enum):
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    TWITTER = "TWITTER"
    FACEBOOK = "FACEBOOK"
    INSTAGRAM = "INSTAGRAM"
    WEBSITE = "WEBSITE"


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    region = Column(String(50), nullable=True)
    capital = Column(String(100), nullable=True)
    
    # Relationships
    lgas = relationship("Lga", back_populates="state")
    representatives = relationship("Representative", back_populates="state")

    def __repr__(self):
        return f"<State {self.name}>"


class Lga(Base):
    __tablename__ = "lgas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    
    # Relationships
    state = relationship("State", back_populates="lgas")
    representatives = relationship("Representative", back_populates="lga")

    def __repr__(self):
        return f"<Lga {self.name}>"


class Representative(Base):
    __tablename__ = "representatives"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    name = Column(String(255), nullable=False)
    title = Column(String(50), nullable=True)  # Senator, Hon., Rt. Hon., etc.
    chamber = Column(SQLEnum(Chamber), nullable=False)
    party = Column(String(50), nullable=True)
    
    # Location
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    lga_id = Column(Integer, ForeignKey("lgas.id"), nullable=True)
    constituency = Column(String(255), nullable=True)
    senatorial_district = Column(String(255), nullable=True)
    ward = Column(String(255), nullable=True)
    
    # Profile
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    term_start = Column(DateTime(timezone=True), nullable=True)
    term_end = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    state = relationship("State", back_populates="representatives")
    lga = relationship("Lga", back_populates="representatives")
    contact_info = relationship("ContactInfo", back_populates="representative", cascade="all, delete-orphan")
    petitions = relationship("Petition", back_populates="target_representative")

    def __repr__(self):
        return f"<Representative {self.name} ({self.chamber.value})>"


class ContactInfo(Base):
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True, index=True)
    representative_id = Column(Integer, ForeignKey("representatives.id"), nullable=False)
    
    contact_type = Column(SQLEnum(ContactType), nullable=False)
    value = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    representative = relationship("Representative", back_populates="contact_info")

    def __repr__(self):
        return f"<ContactInfo {self.contact_type.value}: {self.value}>"


