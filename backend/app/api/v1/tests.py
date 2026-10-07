from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.test_session import TestSession, TestSessionQuestion, Answer, Bookmark
from app.models.question import Question, QuestionOption
from app.models.taxonomy import Subject, Topic
from app.schemas.test import (
    TestConfig,
    ActiveTestSessionResponse,
    ActiveQuestionItem,
    SaveAnswerRequest,
    TestResultResponse,
    TestReviewResponse
)
from app.schemas.question import QuestionOptionResponse
from app.services.test_engine import TestEngineService
from app.services.scoring import ScoringService

router = APIRouter(prefix="/tests", tags=["Test Engine"])

@router.post("", response_model=ActiveTestSessionResponse)
def create_test(
    config: TestConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unified Test Generation Engine endpoint.
    Creates a persistent test session snapshot with anti-repetition and largest-remainder proportional distribution.
    """
    session = TestEngineService.generate_test_session(db, current_user.id, config)
    return get_active_test_session(session.id, db, current_user)

@router.get("/active/current", response_model=Optional[ActiveTestSessionResponse])
def get_current_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the most recent in-progress test session if available, or None.
    Used by the Dashboard to display 'Continue Preparation / Resume Test'.
    """
    session = db.query(TestSession).filter(
        TestSession.user_id == current_user.id,
        TestSession.status == "in_progress"
    ).order_by(TestSession.created_at.desc()).first()

    if not session:
        return None

    # Check if timer expired
    if session.time_limit_seconds > 0:
        elapsed = (datetime.utcnow() - session.started_at).total_seconds()
        if elapsed >= session.time_limit_seconds:
            ScoringService.submit_test_session(db, session.id, current_user.id)
            return None

    return get_active_test_session(session.id, db, current_user)

@router.get("/{session_id}", response_model=ActiveTestSessionResponse)
def get_active_test_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the active test session questions.
    SECURITY: Strips is_correct and explanation from the payload to prevent browser inspection cheating.
    """
    session = db.query(TestSession).filter(
        TestSession.id == session_id,
        TestSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    # Authoritative server timer calculation
    remaining_seconds = None
    if session.time_limit_seconds > 0:
        elapsed = (datetime.utcnow() - session.started_at).total_seconds()
        remaining_seconds = max(0, int(session.time_limit_seconds - elapsed))
        
        # Auto-submit if time expired and status still in_progress
        if remaining_seconds <= 0 and session.status == "in_progress":
            ScoringService.submit_test_session(db, session.id, current_user.id)
            session.status = "submitted"

    session_questions = db.query(TestSessionQuestion).filter(
        TestSessionQuestion.test_session_id == session.id
    ).order_by(TestSessionQuestion.question_order).all()

    user_bookmarks = {
        b.question_id for b in db.query(Bookmark.question_id).filter(Bookmark.user_id == current_user.id).all()
    }

    questions_list = []
    for sq in session_questions:
        q = db.query(Question).filter(Question.id == sq.question_id).first()
        if not q:
            continue
        
        ans = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
        options = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.display_order).all()

        # Sanitize options (hide is_correct)
        sanitized_options = [
            QuestionOptionResponse(
                id=opt.id,
                option_text=opt.option_text,
                display_order=opt.display_order,
                is_correct=None  # Stripped for exam integrity
            ) for opt in options
        ]

        subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()

        questions_list.append(
            ActiveQuestionItem(
                session_question_id=sq.id,
                question_order=sq.question_order,
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                difficulty=q.difficulty,
                code_snippet=q.code_snippet,
                subject_id=q.subject_id,
                subject_name=subj.name if subj else "Subject",
                topic_id=q.topic_id,
                topic_name=topic.name if topic else "Topic",
                options=sanitized_options,
                selected_option_id=ans.selected_option_id if ans else None,
                is_marked_for_review=ans.is_marked_for_review if ans else False,
                is_answered=ans.is_answered if ans else False,
                time_spent_seconds=ans.time_spent_seconds if ans else 0,
                is_bookmarked=(q.id in user_bookmarks)
            )
        )

    return ActiveTestSessionResponse(
        id=session.id,
        title=session.title,
        mode=session.mode,
        question_count=session.question_count,
        time_limit_seconds=session.time_limit_seconds,
        started_at=session.started_at,
        status=session.status,
        remaining_seconds=remaining_seconds,
        questions=questions_list
    )

@router.post("/{session_id}/answer")
def save_answer(
    session_id: str,
    payload: SaveAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autosaves answer selection, marked for review status, and time spent.
    """
    session = db.query(TestSession).filter(
        TestSession.id == session_id,
        TestSession.user_id == current_user.id
    ).first()

    if not session or session.status == "submitted":
        raise HTTPException(status_code=400, detail="Test session closed or not found")

    sq = db.query(TestSessionQuestion).filter(
        TestSessionQuestion.id == payload.session_question_id,
        TestSessionQuestion.test_session_id == session.id
    ).first()

    if not sq:
        raise HTTPException(status_code=404, detail="Session question not found")

    answer = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
    if not answer:
        answer = Answer(test_session_question_id=sq.id)
        db.add(answer)

    answer.selected_option_id = payload.selected_option_id
    answer.is_answered = bool(payload.selected_option_id)
    answer.is_marked_for_review = bool(payload.is_marked_for_review)
    if payload.time_spent_seconds:
        answer.time_spent_seconds = payload.time_spent_seconds
    answer.answered_at = datetime.utcnow()

    db.commit()
    return {"status": "saved", "is_answered": answer.is_answered}

@router.post("/{session_id}/submit", response_model=TestResultResponse)
def submit_test(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Authoritative test submission and result calculation.
    """
    ScoringService.submit_test_session(db, session_id, current_user.id)
    return ScoringService.get_test_result_summary(db, session_id, current_user.id)

@router.get("/{session_id}/result", response_model=TestResultResponse)
def get_test_result(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns calculated test results, score accuracy, and competency breakdowns.
    """
    return ScoringService.get_test_result_summary(db, session_id, current_user.id)

@router.get("/{session_id}/review", response_model=TestReviewResponse)
def get_test_review(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns question-by-question review with all explanations, correct answers, and hints.
    """
    return ScoringService.get_test_review(db, session_id, current_user.id)
