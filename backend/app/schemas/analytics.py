from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

class WeakAreaItem(BaseModel):
    topic_id: str
    topic_name: str
    subject_id: str
    subject_name: str
    questions_attempted: int
    questions_correct: int
    accuracy: float
    weakness_score: float
    priority_level: str  # Critical, High, Moderate

class SubjectAnalyticsItem(BaseModel):
    subject_id: str
    subject_name: str
    slug: str
    weight_percentage: int
    icon: Optional[str] = None
    questions_attempted: int
    questions_correct: int
    accuracy: float
    average_time_seconds: float

class OverviewAnalyticsResponse(BaseModel):
    total_tests_taken: int
    total_questions_attempted: int
    total_questions_correct: int
    overall_accuracy: float
    current_streak_days: int
    best_streak_days: int
    total_study_minutes: int
    target_score: int
    weak_areas_count: int
    subjects: List[SubjectAnalyticsItem]
    top_weak_areas: List[WeakAreaItem]

class TestHistoryItem(BaseModel):
    id: str
    title: str
    mode: str
    question_count: int
    score: float
    accuracy: float
    time_spent_seconds: int
    created_at: datetime
    status: str

class BookmarkItem(BaseModel):
    id: str
    question_id: str
    question_text: str
    subject_name: str
    topic_name: str
    difficulty: str
    created_at: datetime
    notes: Optional[str] = None
