from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class UserProfileBase(BaseModel):
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    graduation_year: Optional[int] = None
    target_score: int = 80
    preparation_goal: Optional[str] = "pass_nsct"
    daily_study_target_minutes: int = 30
    timezone: str = "UTC"

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    graduation_year: Optional[int] = None
    target_score: Optional[int] = None
    preparation_goal: Optional[str] = None
    daily_study_target_minutes: Optional[int] = None
    timezone: Optional[str] = None

class UserProfileResponse(UserProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str = "student"

class UserCreate(UserBase):
    google_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    status: str
    last_login_at: datetime
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None
