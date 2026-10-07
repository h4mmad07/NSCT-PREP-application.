from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base, BaseDBModel

# Association table for Question <-> Tag
question_tags = Table(
    "question_tags",
    Base.metadata,
    Column("question_id", String(36), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Tag(BaseDBModel):
    __tablename__ = "tags"

    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)

    questions = relationship("Question", secondary=question_tags, back_populates="tags")


class Question(BaseDBModel):
    __tablename__ = "questions"

    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)

    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="single_choice", nullable=False)  # single_choice, multiple_choice, true_false, code_output
    difficulty = Column(String(50), default="medium", nullable=False, index=True)  # easy, medium, hard
    
    code_snippet = Column(Text, nullable=True)  # For code output / programming questions
    explanation = Column(Text, nullable=True)
    hint = Column(Text, nullable=True)
    
    estimated_seconds = Column(Integer, default=60, nullable=False)
    source_type = Column(String(100), default="official_bank", nullable=False)
    status = Column(String(50), default="published", nullable=False, index=True)  # draft, published, archived, reported

    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    subject = relationship("Subject", back_populates="questions")
    topic = relationship("Topic", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.display_order")
    tags = relationship("Tag", secondary=question_tags, back_populates="questions")
    reports = relationship("QuestionReport", back_populates="question", cascade="all, delete-orphan")
    session_questions = relationship("TestSessionQuestion", back_populates="question", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(BaseDBModel):
    __tablename__ = "question_options"

    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    question = relationship("Question", back_populates="options")


class QuestionReport(BaseDBModel):
    __tablename__ = "question_reports"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reason = Column(String(100), nullable=False)  # incorrect_answer, ambiguous, grammar, wrong_topic, wrong_difficulty, technical_error, other
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, reviewed, resolved, rejected

    reviewed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="reports")
    question = relationship("Question", back_populates="reports")
