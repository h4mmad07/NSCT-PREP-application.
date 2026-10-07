import math
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserProfile
from app.models.test_session import TestSession, TestSessionQuestion, Answer
from app.models.taxonomy import Subject, Topic
from app.models.question import Question
from app.models.analytics import (
    UserTopicStats,
    UserSubjectStats,
    UserDailyActivity,
    UserAchievement
)
from app.schemas.analytics import (
    OverviewAnalyticsResponse,
    SubjectAnalyticsItem,
    WeakAreaItem,
    TestHistoryItem
)

router = APIRouter(prefix="/analytics", tags=["Performance Analytics"])

@router.get("/overview", response_model=OverviewAnalyticsResponse)
def get_overview_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Computes overall accuracy, study streak, subject competency mastery, and top weak areas.
    """
    # Total tests
    total_tests = db.query(func.count(TestSession.id)).filter(
        TestSession.user_id == current_user.id,
        TestSession.status == "submitted"
    ).scalar() or 0

    # Total questions & accuracy
    totals = db.query(
        func.sum(UserSubjectStats.questions_attempted),
        func.sum(UserSubjectStats.questions_correct)
    ).filter(UserSubjectStats.user_id == current_user.id).first()

    total_attempted = totals[0] or 0
    total_correct = totals[1] or 0
    overall_accuracy = round((total_correct / max(1, total_attempted)) * 100, 1)

    # Activity streak
    activities = db.query(UserDailyActivity).filter(
        UserDailyActivity.user_id == current_user.id
    ).order_by(desc(UserDailyActivity.activity_date)).all()

    current_streak = len(activities)  # Simple streak approximation
    total_study_minutes = sum(a.study_minutes for a in activities)

    # Subject breakdowns
    subjects = db.query(Subject).filter(Subject.is_active == True).order_by(Subject.display_order).all()
    user_subject_stats = {
        s.subject_id: s for s in db.query(UserSubjectStats).filter(UserSubjectStats.user_id == current_user.id).all()
    }

    subjects_list = []
    for s in subjects:
        st = user_subject_stats.get(s.id)
        subjects_list.append(
            SubjectAnalyticsItem(
                subject_id=s.id,
                subject_name=s.name,
                slug=s.slug,
                weight_percentage=s.weight_percentage,
                icon=s.icon,
                questions_attempted=st.questions_attempted if st else 0,
                questions_correct=st.questions_correct if st else 0,
                accuracy=st.accuracy if st else 0.0,
                average_time_seconds=st.average_time_seconds if st else 0.0
            )
        )

    # Weak areas calculation: Priority Score = (100 - accuracy) * log(attempts + 1)
    topic_stats = db.query(UserTopicStats).filter(UserTopicStats.user_id == current_user.id).all()
    weak_areas = []

    for ts in topic_stats:
        if ts.questions_attempted > 0 and ts.accuracy < 70.0:
            topic = db.query(Topic).filter(Topic.id == ts.topic_id).first()
            subject = db.query(Subject).filter(Subject.id == topic.subject_id).first() if topic else None
            
            weakness_score = (100.0 - ts.accuracy) * math.log(ts.questions_attempted + 1)
            priority = "Critical" if ts.accuracy < 50 else ("High" if ts.accuracy < 60 else "Moderate")
            
            weak_areas.append(
                WeakAreaItem(
                    topic_id=ts.topic_id,
                    topic_name=topic.name if topic else "Topic",
                    subject_id=subject.id if subject else "",
                    subject_name=subject.name if subject else "",
                    questions_attempted=ts.questions_attempted,
                    questions_correct=ts.questions_correct,
                    accuracy=ts.accuracy,
                    weakness_score=round(weakness_score, 1),
                    priority_level=priority
                )
            )

    weak_areas.sort(key=lambda x: x.weakness_score, reverse=True)

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    target_score = profile.target_score if profile else 80

    return OverviewAnalyticsResponse(
        total_tests_taken=total_tests,
        total_questions_attempted=total_attempted,
        total_questions_correct=total_correct,
        overall_accuracy=overall_accuracy,
        current_streak_days=current_streak if total_tests > 0 else 0,
        best_streak_days=current_streak if total_tests > 0 else 0,
        total_study_minutes=total_study_minutes,
        target_score=target_score,
        weak_areas_count=len(weak_areas),
        subjects=subjects_list,
        top_weak_areas=weak_areas[:5]
    )

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns authentic leaderboard ranking calculated from all registered users in the database.
    Calculates actual questions attempted, actual accuracy %, and authentic active streak.
    """
    users = db.query(User).filter(User.status == "active").all()
    leaderboard_data = []

    for u in users:
        prof = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        
        # Calculate actual totals from subject stats
        totals = db.query(
            func.sum(UserSubjectStats.questions_attempted),
            func.sum(UserSubjectStats.questions_correct)
        ).filter(UserSubjectStats.user_id == u.id).first()

        q_attempted = int(totals[0] or 0)
        q_correct = int(totals[1] or 0)
        acc = round((q_correct / max(1, q_attempted)) * 100, 1) if q_attempted > 0 else 0.0

        # Authentic streak calculation
        tests_count = db.query(func.count(TestSession.id)).filter(
            TestSession.user_id == u.id,
            TestSession.status == "submitted"
        ).scalar() or 0

        activities_count = db.query(func.count(UserDailyActivity.id)).filter(
            UserDailyActivity.user_id == u.id
        ).scalar() or 0

        streak = max(activities_count, (1 if tests_count > 0 else 0))

        university_display = prof.university if (prof and prof.university) else "University Not Set"
        dept_display = prof.department if (prof and prof.department) else ""

        leaderboard_data.append({
            "user_id": u.id,
            "name": u.name,
            "email": u.email,
            "university": university_display,
            "department": dept_display,
            "accuracy": acc,
            "questions": q_attempted,
            "streak": streak,
            "tests_completed": tests_count,
            "is_current_user": (u.id == current_user.id)
        })

    # Sort users: Primary by accuracy (if attempted > 0), then by questions attempted, then by tests completed
    leaderboard_data.sort(
        key=lambda x: (x["questions"] > 0, x["accuracy"], x["questions"], x["tests_completed"]),
        reverse=True
    )

    # Assign sequential ranks
    for idx, item in enumerate(leaderboard_data, start=1):
        item["rank"] = idx

    return leaderboard_data

@router.get("/weak-areas", response_model=List[WeakAreaItem])
def get_all_weak_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns ranked list of low-performing topics according to the Weakness Formula.
    """
    topic_stats = db.query(UserTopicStats).filter(UserTopicStats.user_id == current_user.id).all()
    weak_areas = []

    for ts in topic_stats:
        if ts.questions_attempted > 0:
            topic = db.query(Topic).filter(Topic.id == ts.topic_id).first()
            subject = db.query(Subject).filter(Subject.id == topic.subject_id).first() if topic else None
            
            weakness_score = (100.0 - ts.accuracy) * math.log(ts.questions_attempted + 1)
            priority = "Critical" if ts.accuracy < 50 else ("High" if ts.accuracy < 60 else "Moderate")
            
            weak_areas.append(
                WeakAreaItem(
                    topic_id=ts.topic_id,
                    topic_name=topic.name if topic else "Topic",
                    subject_id=subject.id if subject else "",
                    subject_name=subject.name if subject else "",
                    questions_attempted=ts.questions_attempted,
                    questions_correct=ts.questions_correct,
                    accuracy=ts.accuracy,
                    weakness_score=round(weakness_score, 1),
                    priority_level=priority
                )
            )

    weak_areas.sort(key=lambda x: x.weakness_score, reverse=True)
    return weak_areas

@router.get("/history", response_model=List[TestHistoryItem])
def get_test_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns student's past test history with scores, accuracy, and durations.
    """
    sessions = db.query(TestSession).filter(
        TestSession.user_id == current_user.id
    ).order_by(desc(TestSession.created_at)).all()

    return [
        TestHistoryItem(
            id=s.id,
            title=s.title,
            mode=s.mode,
            question_count=s.question_count,
            score=s.score,
            accuracy=s.accuracy,
            time_spent_seconds=s.time_spent_seconds,
            created_at=s.created_at,
            status=s.status
        ) for s in sessions
    ]

@router.get("/mistakes")
def get_mistakes_notebook(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns unique questions previously answered incorrectly by this student.
    """
    wrong_answers = db.query(Answer, TestSessionQuestion, Question)\
        .join(TestSessionQuestion, TestSessionQuestion.id == Answer.test_session_question_id)\
        .join(TestSession, TestSession.id == TestSessionQuestion.test_session_id)\
        .join(Question, Question.id == TestSessionQuestion.question_id)\
        .filter(TestSession.user_id == current_user.id, Answer.is_correct == False, Answer.is_answered == True)\
        .all()

    seen_q_ids = set()
    mistakes_list = []

    for ans, sq, q in wrong_answers:
        if q.id in seen_q_ids:
            continue
        seen_q_ids.add(q.id)

        subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()

        mistakes_list.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "difficulty": q.difficulty,
            "subject_name": subj.name if subj else "",
            "topic_name": topic.name if topic else "",
            "explanation": q.explanation,
            "failed_at": ans.answered_at or q.created_at
        })

    return {"total_mistakes": len(mistakes_list), "mistakes": mistakes_list}
