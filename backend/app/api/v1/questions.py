from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.question import Question, QuestionOption, QuestionReport
from app.models.taxonomy import Subject, Topic
from app.schemas.question import QuestionReportCreate, QuestionReportResponse

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.post("/{question_id}/report", response_model=QuestionReportResponse)
def report_question(
    question_id: str,
    payload: QuestionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a user report for an issue in a question (e.g. incorrect key, ambiguity, typo).
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    report = QuestionReport(
        user_id=current_user.id,
        question_id=question_id,
        reason=payload.reason,
        description=payload.description,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
