from typing import List, Optional
import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from pydantic import BaseModel
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_admin_user, get_current_user
from app.models.user import User, UserProfile
from app.models.question import Question, QuestionOption, Tag, QuestionReport
from app.models.taxonomy import Subject, Topic
from app.models.test_session import TestSession
from app.models.analytics import AdminAuditLog, UserSubjectStats
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionOptionResponse,
    QuestionReportResponse
)

class UserRoleUpdate(BaseModel):
    role: str

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Returns platform-wide metrics for administrators.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_questions = db.query(func.count(Question.id)).scalar() or 0
    published_questions = db.query(func.count(Question.id)).filter(Question.status == "published").scalar() or 0
    total_tests = db.query(func.count(TestSession.id)).scalar() or 0
    pending_reports = db.query(func.count(QuestionReport.id)).filter(QuestionReport.status == "pending").scalar() or 0

    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "published_questions": published_questions,
        "total_tests_completed": total_tests,
        "pending_reports_count": pending_reports
    }

@router.get("/questions", response_model=List[QuestionResponse])
def list_questions_admin(
    subject_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Lists questions with admin filters, search, and options.
    """
    query = db.query(Question)
    if subject_id:
        query = query.filter(Question.subject_id == subject_id)
    if topic_id:
        query = query.filter(Question.topic_id == topic_id)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if status:
        query = query.filter(Question.status == status)
    if search:
        query = query.filter(Question.question_text.ilike(f"%{search}%"))

    questions = query.order_by(desc(Question.created_at)).limit(200).all()
    
    res = []
    for q in questions:
        subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
        opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.display_order).all()
        
        res.append(
            QuestionResponse(
                id=q.id,
                subject_id=q.subject_id,
                topic_id=q.topic_id,
                question_text=q.question_text,
                question_type=q.question_type,
                difficulty=q.difficulty,
                code_snippet=q.code_snippet,
                explanation=q.explanation,
                hint=q.hint,
                estimated_seconds=q.estimated_seconds,
                source_type=q.source_type,
                status=q.status,
                created_at=q.created_at,
                subject_name=subj.name if subj else "",
                topic_name=topic.name if topic else "",
                options=[QuestionOptionResponse.model_validate(o) for o in opts],
                tags=[]
            )
        )
    return res

@router.post("/questions", response_model=QuestionResponse)
def create_question_admin(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Creates a new question with multiple choices in the question bank.
    """
    q = Question(
        subject_id=payload.subject_id,
        topic_id=payload.topic_id,
        question_text=payload.question_text,
        question_type=payload.question_type,
        difficulty=payload.difficulty,
        code_snippet=payload.code_snippet,
        explanation=payload.explanation,
        hint=payload.hint,
        estimated_seconds=payload.estimated_seconds,
        source_type=payload.source_type,
        status=payload.status,
        created_by=admin.id
    )
    db.add(q)
    db.flush()

    for idx, opt in enumerate(payload.options, start=1):
        db.add(QuestionOption(
            question_id=q.id,
            option_text=opt.option_text,
            is_correct=opt.is_correct,
            display_order=idx
        ))

    db.add(AdminAuditLog(
        admin_id=admin.id,
        action="create_question",
        entity_type="question",
        entity_id=q.id,
        details=f"Created question: {q.question_text[:50]}"
    ))

    db.commit()
    db.refresh(q)
    
    subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
    topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
    opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.display_order).all()

    return QuestionResponse(
        id=q.id,
        subject_id=q.subject_id,
        topic_id=q.topic_id,
        question_text=q.question_text,
        question_type=q.question_type,
        difficulty=q.difficulty,
        code_snippet=q.code_snippet,
        explanation=q.explanation,
        hint=q.hint,
        estimated_seconds=q.estimated_seconds,
        source_type=q.source_type,
        status=q.status,
        created_at=q.created_at,
        subject_name=subj.name if subj else "",
        topic_name=topic.name if topic else "",
        options=[QuestionOptionResponse.model_validate(o) for o in opts],
        tags=[]
    )

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question_admin(
    question_id: str,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Updates an existing question and its options.
    """
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    if payload.subject_id is not None:
        q.subject_id = payload.subject_id
    if payload.topic_id is not None:
        q.topic_id = payload.topic_id
    if payload.question_text is not None:
        q.question_text = payload.question_text
    if payload.question_type is not None:
        q.question_type = payload.question_type
    if payload.difficulty is not None:
        q.difficulty = payload.difficulty
    if payload.code_snippet is not None:
        q.code_snippet = payload.code_snippet
    if payload.explanation is not None:
        q.explanation = payload.explanation
    if payload.hint is not None:
        q.hint = payload.hint
    if payload.status is not None:
        q.status = payload.status

    if payload.options is not None:
        # Clear existing options and add new ones
        db.query(QuestionOption).filter(QuestionOption.question_id == q.id).delete()
        for idx, opt in enumerate(payload.options, start=1):
            db.add(QuestionOption(
                question_id=q.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                display_order=idx
            ))

    q.updated_by = admin.id
    db.commit()
    db.refresh(q)

    subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
    topic = db.query(Topic).filter(Topic.id == q.topic_id).first()
    opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.display_order).all()

    return QuestionResponse(
        id=q.id,
        subject_id=q.subject_id,
        topic_id=q.topic_id,
        question_text=q.question_text,
        question_type=q.question_type,
        difficulty=q.difficulty,
        code_snippet=q.code_snippet,
        explanation=q.explanation,
        hint=q.hint,
        estimated_seconds=q.estimated_seconds,
        source_type=q.source_type,
        status=q.status,
        created_at=q.created_at,
        subject_name=subj.name if subj else "",
        topic_name=topic.name if topic else "",
        options=[QuestionOptionResponse.model_validate(o) for o in opts],
        tags=[]
    )

@router.delete("/questions/{question_id}")
def delete_question_admin(
    question_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Deletes a question from the question bank.
    """
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    db.delete(q)
    db.add(AdminAuditLog(
        admin_id=admin.id,
        action="delete_question",
        entity_type="question",
        entity_id=question_id,
        details=f"Deleted question {question_id}"
    ))
    db.commit()
    return {"message": "Question deleted successfully"}

@router.patch("/questions/{question_id}/status")
def toggle_question_status(
    question_id: str,
    status: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Quick status toggle (published, draft, archived).
    """
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = status
    db.commit()
    return {"message": f"Question status updated to {status}"}

# --- Reports Moderation Endpoints ---
@router.get("/reports")
def list_question_reports(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Lists student reported questions for investigation.
    """
    query = db.query(QuestionReport)
    if status:
        query = query.filter(QuestionReport.status == status)

    reports = query.order_by(desc(QuestionReport.created_at)).all()
    res = []
    for r in reports:
        q = db.query(Question).filter(Question.id == r.question_id).first()
        u = db.query(User).filter(User.id == r.user_id).first()
        res.append({
            "id": r.id,
            "question_id": r.question_id,
            "question_text": q.question_text if q else "Deleted Question",
            "reporter_name": u.name if u else "Anonymous",
            "reason": r.reason,
            "description": r.description,
            "status": r.status,
            "created_at": r.created_at
        })
    return res

@router.patch("/reports/{report_id}")
def update_report_status(
    report_id: str,
    status: str,  # resolved, rejected
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Resolves or rejects a student question report.
    """
    r = db.query(QuestionReport).filter(QuestionReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    r.status = status
    r.reviewed_by = admin.id
    r.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": f"Report marked as {status}"}

# --- User Management Endpoints ---
@router.get("/users")
def list_users_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Lists platform users with university, department, semester, attempts, and role.
    """
    users = db.query(User).order_by(desc(User.created_at)).all()
    admin_emails = {e.strip().lower() for e in settings.get_admin_emails()}
    admin_emails.add("mh9456605@gmail.com")

    res = []
    for u in users:
        prof = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        tests_count = db.query(func.count(TestSession.id)).filter(TestSession.user_id == u.id).scalar() or 0
        is_owner = u.email.strip().lower() == "mh9456605@gmail.com"
        
        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "university": prof.university if (prof and prof.university) else "Not Set",
            "department": prof.department if (prof and prof.department) else "Not Set",
            "semester": prof.semester if (prof and prof.semester) else None,
            "tests_completed": tests_count,
            "is_primary_owner": is_owner,
            "created_at": u.created_at
        })
    return res

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Grants or revokes administrator privileges.
    Strictly protects mh9456605@gmail.com from having admin access removed.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_email = target_user.email.strip().lower()

    # Immutable protection for primary owner
    if target_email == "mh9456605@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The primary owner account (mh9456605@gmail.com) has permanent admin access and cannot be modified or demoted."
        )

    if payload.role not in ["admin", "student"]:
        raise HTTPException(status_code=400, detail="Role must be either 'admin' or 'student'")

    old_role = target_user.role
    target_user.role = payload.role
    
    db.add(AdminAuditLog(
        admin_id=admin.id,
        action="update_user_role",
        entity_type="user",
        entity_id=target_user.id,
        details=f"Admin {admin.email} changed {target_user.email} role from {old_role} to {payload.role}"
    ))
    db.commit()
    db.refresh(target_user)

    return {
        "message": f"Successfully updated {target_user.name}'s role to {payload.role}",
        "user_id": target_user.id,
        "new_role": target_user.role
    }

@router.delete("/users/{user_id}")
def delete_user_admin(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Permanently deletes a student or user account.
    Strictly prevents deletion of mh9456605@gmail.com.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_email = target_user.email.strip().lower()

    # Immutable protection for primary owner
    if target_email == "mh9456605@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The primary owner account (mh9456605@gmail.com) cannot be deleted."
        )

    user_name = target_user.name
    user_email = target_user.email

    db.delete(target_user)
    db.add(AdminAuditLog(
        admin_id=admin.id,
        action="delete_user",
        entity_type="user",
        entity_id=user_id,
        details=f"Admin {admin.email} deleted user {user_name} ({user_email})"
    ))
    db.commit()

    return {"message": f"User {user_name} ({user_email}) was deleted successfully"}

