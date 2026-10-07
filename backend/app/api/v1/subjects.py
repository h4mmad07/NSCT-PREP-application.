from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.taxonomy import Subject, Topic
from app.models.question import Question
from app.models.analytics import UserSubjectStats, UserTopicStats
from app.schemas.taxonomy import SubjectResponse, TopicResponse

router = APIRouter(prefix="/subjects", tags=["Subjects & Taxonomy"])

@router.get("", response_model=List[dict])
def list_subjects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns all 10 official NSCT subjects with their weightages, question counts, and user's mastery accuracy.
    """
    subjects = db.query(Subject).filter(Subject.is_active == True).order_by(Subject.display_order).all()
    
    # Pre-fetch user stats
    user_stats = {
        s.subject_id: s for s in db.query(UserSubjectStats).filter(UserSubjectStats.user_id == current_user.id).all()
    }

    result = []
    for s in subjects:
        q_count = db.query(func.count(Question.id)).filter(
            Question.subject_id == s.id,
            Question.status == "published"
        ).scalar() or 0
        
        stat = user_stats.get(s.id)
        result.append({
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "description": s.description,
            "weight_percentage": s.weight_percentage,
            "icon": s.icon,
            "display_order": s.display_order,
            "questions_count": q_count,
            "accuracy": stat.accuracy if stat else 0.0,
            "questions_attempted": stat.questions_attempted if stat else 0
        })
    return result

@router.get("/{slug}", response_model=dict)
def get_subject_by_slug(slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns subject detail along with all subtopics and student topic-level progress.
    """
    subject = db.query(Subject).filter(Subject.slug == slug, Subject.is_active == True).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    topics = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.is_active == True).order_by(Topic.display_order).all()
    user_topic_stats = {
        t.topic_id: t for t in db.query(UserTopicStats).filter(UserTopicStats.user_id == current_user.id).all()
    }

    topics_data = []
    for t in topics:
        q_count = db.query(func.count(Question.id)).filter(
            Question.topic_id == t.id,
            Question.status == "published"
        ).scalar() or 0
        
        t_stat = user_topic_stats.get(t.id)
        topics_data.append({
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "description": t.description,
            "display_order": t.display_order,
            "questions_count": q_count,
            "accuracy": t_stat.accuracy if t_stat else 0.0,
            "questions_attempted": t_stat.questions_attempted if t_stat else 0
        })

    subj_stat = db.query(UserSubjectStats).filter(
        UserSubjectStats.user_id == current_user.id,
        UserSubjectStats.subject_id == subject.id
    ).first()

    return {
        "id": subject.id,
        "name": subject.name,
        "slug": subject.slug,
        "description": subject.description,
        "weight_percentage": subject.weight_percentage,
        "icon": subject.icon,
        "topics": topics_data,
        "accuracy": subj_stat.accuracy if subj_stat else 0.0,
        "questions_attempted": subj_stat.questions_attempted if subj_stat else 0
    }
