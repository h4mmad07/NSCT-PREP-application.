from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class QuestionOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False
    display_order: int = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionResponse(BaseModel):
    id: str
    option_text: str
    display_order: int
    is_correct: Optional[bool] = None  # Hidden during exam session

    class Config:
        from_attributes = True

class TagBase(BaseModel):
    name: str
    slug: str

class TagResponse(TagBase):
    id: str

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    subject_id: str
    topic_id: str
    question_text: str
    question_type: str = "single_choice"
    difficulty: str = "medium"
    code_snippet: Optional[str] = None
    explanation: Optional[str] = None
    hint: Optional[str] = None
    estimated_seconds: int = 60
    source_type: str = "official_bank"
    status: str = "published"

class QuestionCreate(QuestionBase):
    options: List[QuestionOptionCreate]
    tags: Optional[List[str]] = []

class QuestionUpdate(BaseModel):
    subject_id: Optional[str] = None
    topic_id: Optional[str] = None
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    difficulty: Optional[str] = None
    code_snippet: Optional[str] = None
    explanation: Optional[str] = None
    hint: Optional[str] = None
    estimated_seconds: Optional[int] = None
    status: Optional[str] = None
    options: Optional[List[QuestionOptionCreate]] = None
    tags: Optional[List[str]] = None

class QuestionResponse(QuestionBase):
    id: str
    created_at: datetime
    options: List[QuestionOptionResponse] = []
    tags: List[TagResponse] = []
    subject_name: Optional[str] = None
    topic_name: Optional[str] = None
    is_bookmarked: Optional[bool] = False

    class Config:
        from_attributes = True

class QuestionReportCreate(BaseModel):
    question_id: str
    reason: str
    description: Optional[str] = None

class QuestionReportResponse(BaseModel):
    id: str
    user_id: str
    question_id: str
    reason: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
