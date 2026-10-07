from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import BaseDBModel

class TestSession(BaseDBModel):
    __tablename__ = "test_sessions"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Practice Test", nullable=False)
    mode = Column(String(50), default="custom", nullable=False)  # quick, subject, topic, mixed, weak_areas, mistakes, revision, challenge, full_mock, custom
    
    question_count = Column(Integer, default=10, nullable=False)
    time_limit_seconds = Column(Integer, default=0, nullable=False)  # 0 = no time limit
    
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="in_progress", nullable=False, index=True)  # created, in_progress, submitted, expired, abandoned
    
    total_correct = Column(Integer, default=0, nullable=False)
    total_wrong = Column(Integer, default=0, nullable=False)
    total_unanswered = Column(Integer, default=0, nullable=False)
    
    score = Column(Float, default=0.0, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    
    # Configuration metadata snapshot
    config_snapshot = Column(Text, nullable=True)  # Stored as JSON string

    # Relationships
    user = relationship("User", back_populates="test_sessions")
    session_questions = relationship("TestSessionQuestion", back_populates="test_session", cascade="all, delete-orphan", order_by="TestSessionQuestion.question_order")


class TestSessionQuestion(BaseDBModel):
    __tablename__ = "test_session_questions"

    test_session_id = Column(String(36), ForeignKey("test_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, default=0, nullable=False)

    # Relationships
    test_session = relationship("TestSession", back_populates="session_questions")
    question = relationship("Question", back_populates="session_questions")
    answer = relationship("Answer", back_populates="session_question", uselist=False, cascade="all, delete-orphan")


class Answer(BaseDBModel):
    __tablename__ = "answers"

    test_session_question_id = Column(String(36), ForeignKey("test_session_questions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    selected_option_id = Column(String(36), ForeignKey("question_options.id", ondelete="SET NULL"), nullable=True)
    
    is_correct = Column(Boolean, default=False, nullable=False)
    is_answered = Column(Boolean, default=False, nullable=False)
    is_marked_for_review = Column(Boolean, default=False, nullable=False)
    
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    answered_at = Column(DateTime, nullable=True)

    # Relationships
    session_question = relationship("TestSessionQuestion", back_populates="answer")
    selected_option = relationship("QuestionOption")


class Bookmark(BaseDBModel):
    __tablename__ = "bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="unique_user_question_bookmark"),)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="bookmarks")
    question = relationship("Question", back_populates="bookmarks")
