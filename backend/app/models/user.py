from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import BaseDBModel

class User(BaseDBModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(50), default="student", nullable=False)  # student, admin, super_admin
    status = Column(String(50), default="active", nullable=False)  # active, suspended, deleted
    last_login_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    test_sessions = relationship("TestSession", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("QuestionReport", foreign_keys="[QuestionReport.user_id]", back_populates="user", cascade="all, delete-orphan")
    topic_stats = relationship("UserTopicStats", back_populates="user", cascade="all, delete-orphan")
    subject_stats = relationship("UserSubjectStats", back_populates="user", cascade="all, delete-orphan")
    daily_activities = relationship("UserDailyActivity", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class UserProfile(BaseDBModel):
    __tablename__ = "user_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    semester = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    target_score = Column(Integer, default=80, nullable=False)
    preparation_goal = Column(String(255), nullable=True)  # pass_nsct, improve_cs, mock_test, improve_weak
    daily_study_target_minutes = Column(Integer, default=30, nullable=False)
    timezone = Column(String(100), default="UTC", nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")
