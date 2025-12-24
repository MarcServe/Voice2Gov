from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from ..database import get_db
from ..models.legal_document import LegalDocument
from ..services.openai_service import openai_service

router = APIRouter(tags=["Constitution"])


class ConstitutionQuery(BaseModel):
    question: str


@router.post("/constitution")
async def constitution_lookup(payload: ConstitutionQuery, db: Session = Depends(get_db)):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    ts_query = func.plainto_tsquery("english", question)
    docs = (
        db.query(LegalDocument)
        .filter(
            func.to_tsvector("english", LegalDocument.content).match(ts_query)
            | func.to_tsvector("english", LegalDocument.heading).match(ts_query)
        )
        .limit(5)
        .all()
    )

    if not docs:
        # fallback to retrieving some chapters
        docs = db.query(LegalDocument).limit(3).all()

    sections = [
        {
            "id": doc.id,
            "title": doc.title,
            "chapter": doc.chapter,
            "section": doc.section,
            "heading": doc.heading,
            "content": doc.content,
            "tags": doc.tags or [],
        }
        for doc in docs
    ]

    answer = await openai_service.summarize_constitution(question, sections)

    return {
        "question": question,
        "answer": answer,
        "sections": sections,
    }


