from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.question import QuestionOptionResponse

class TestConfig(BaseModel):
    mode: str = "custom"  # quick, subject, topic, mixed, weak_areas, mistakes, revision, challenge, full_mock, custom
    title: Optional[str] = None
    subjects: Optional[List[str]] = []
    topics: Optional[List[str]] = []
    difficulty: str = "mixed"  # easy, medium, hard, mixed
    question_count: int = Field(default=10, ge=5, le=100)
    time_limit_minutes: int = 0  # 0 = no time limit, or 10, 30, 60, etc.
    question_types: Optional[List[str]] = ["single_choice", "multiple_choice", "true_false", "code_output"]
    instant_feedback: bool = False
    show_explanations: bool = True
    negative_marking: bool = False
    randomize_questions: bool = True
    randomize_options: bool = True

class SaveAnswerRequest(BaseModel):
    session_question_id: str
    selected_option_id: Optional[str] = None
    is_marked_for_review: Optional[bool] = False
    time_spent_seconds: Optional[int] = 0

class ActiveQuestionItem(BaseModel):
    session_question_id: str
    question_order: int
    id: str  # question id
    question_text: str
    question_type: str
    difficulty: str
    code_snippet: Optional[str] = None
    subject_id: str
    subject_name: str
    topic_id: str
    topic_name: str
    options: List[QuestionOptionResponse]
    
    # State in current session
    selected_option_id: Optional[str] = None
    is_marked_for_review: bool = False
    is_answered: bool = False
    time_spent_seconds: int = 0
    is_bookmarked: bool = False

class ActiveTestSessionResponse(BaseModel):
    id: str
    title: str
    mode: str
    question_count: int
    time_limit_seconds: int
    started_at: datetime
    status: str
    remaining_seconds: Optional[int] = None
    instant_feedback: bool = False
    questions: List[ActiveQuestionItem]

class SubjectBreakdown(BaseModel):
    subject_id: str
    subject_name: str
    total_questions: int
    correct: int
    wrong: int
    unanswered: int
    accuracy: float

class TopicBreakdown(BaseModel):
    topic_id: str
    topic_name: str
    subject_name: str
    total_questions: int
    correct: int
    wrong: int
    accuracy: float

class ReviewQuestionItem(BaseModel):
    session_question_id: str
    question_order: int
    question_id: str
    question_text: str
    code_snippet: Optional[str] = None
    difficulty: str
    subject_name: str
    topic_name: str
    explanation: Optional[str] = None
    hint: Optional[str] = None
    options: List[dict]  # Includes is_correct, text, etc.
    selected_option_id: Optional[str] = None
    is_correct: bool
    is_answered: bool
    is_marked_for_review: bool
    time_spent_seconds: int
    is_bookmarked: bool

class TestResultResponse(BaseModel):
    id: str
    title: str
    mode: str
    question_count: int
    total_correct: int
    total_wrong: int
    total_unanswered: int
    score: float
    accuracy: float
    time_spent_seconds: int
    started_at: datetime
    submitted_at: Optional[datetime] = None
    subject_breakdown: List[SubjectBreakdown] = []
    topic_breakdown: List[TopicBreakdown] = []
    recommendation: Optional[str] = None

class TestReviewResponse(BaseModel):
    result: TestResultResponse
    questions: List[ReviewQuestionItem]
