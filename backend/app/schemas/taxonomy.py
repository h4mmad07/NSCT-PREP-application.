from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class TopicBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class TopicCreate(TopicBase):
    subject_id: str

class TopicResponse(TopicBase):
    id: str
    subject_id: str
    created_at: datetime
    questions_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    weight_percentage: int = 10
    icon: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: str
    created_at: datetime
    topics: List[TopicResponse] = []
    questions_count: Optional[int] = 0

    class Config:
        from_attributes = True
