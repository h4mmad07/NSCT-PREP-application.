from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import BaseDBModel

class Subject(BaseDBModel):
    __tablename__ = "subjects"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    weight_percentage = Column(Integer, nullable=False, default=10)
    icon = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan", order_by="Topic.display_order")
    questions = relationship("Question", back_populates="subject", cascade="all, delete-orphan")


class Topic(BaseDBModel):
    __tablename__ = "topics"

    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
