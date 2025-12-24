from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from ..database import Base


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    chapter = Column(String(255), nullable=True)
    section = Column(String(255), nullable=True)
    heading = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    tags = Column(ARRAY(String(50)), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<LegalDocument {self.title} - {self.chapter} {self.section}>"


