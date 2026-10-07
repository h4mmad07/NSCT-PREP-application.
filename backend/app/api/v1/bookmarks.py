from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.test_session import Bookmark
from app.models.question import Question
from app.models.taxonomy import Subject, Topic
from app.schemas.analytics import BookmarkItem

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])

@router.get("", response_model=List[BookmarkItem])
def get_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all questions bookmarked by the student.
    """
    bookmarks = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).order_by(desc(Bookmark.created_at)).all()

    items = []
    for b in bookmarks:
        q = db.query(Question).filter(Question.id == b.question_id).first()
        if not q:
            continue
        subj = db.query(Subject).filter(Subject.id == q.subject_id).first()
        topic = db.query(Topic).filter(Topic.id == q.topic_id).first()

        items.append(
            BookmarkItem(
                id=b.id,
                question_id=q.id,
                question_text=q.question_text,
                subject_name=subj.name if subj else "",
                topic_name=topic.name if topic else "",
                difficulty=q.difficulty,
                created_at=b.created_at,
                notes=b.notes
            )
        )
    return items

@router.post("/{question_id}")
def toggle_bookmark(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggles bookmark status on a question.
    """
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.question_id == question_id
    ).first()

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {"bookmarked": False, "message": "Bookmark removed"}
    else:
        new_b = Bookmark(user_id=current_user.id, question_id=question_id)
        db.add(new_b)
        db.commit()
        return {"bookmarked": True, "message": "Question bookmarked successfully"}
