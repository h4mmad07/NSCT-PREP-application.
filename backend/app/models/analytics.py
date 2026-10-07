from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.database import BaseDBModel

class UserTopicStats(BaseDBModel):
    __tablename__ = "user_topic_stats"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="unique_user_topic_stats"),)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    
    questions_attempted = Column(Integer, default=0, nullable=False)
    questions_correct = Column(Integer, default=0, nullable=False)
    questions_wrong = Column(Integer, default=0, nullable=False)
    
    accuracy = Column(Float, default=0.0, nullable=False)
    average_time_seconds = Column(Float, default=0.0, nullable=False)
    last_attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="topic_stats")
    topic = relationship("Topic")


class UserSubjectStats(BaseDBModel):
    __tablename__ = "user_subject_stats"
    __table_args__ = (UniqueConstraint("user_id", "subject_id", name="unique_user_subject_stats"),)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    questions_attempted = Column(Integer, default=0, nullable=False)
    questions_correct = Column(Integer, default=0, nullable=False)
    questions_wrong = Column(Integer, default=0, nullable=False)
    
    accuracy = Column(Float, default=0.0, nullable=False)
    average_time_seconds = Column(Float, default=0.0, nullable=False)
    last_attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="subject_stats")
    subject = relationship("Subject")


class UserDailyActivity(BaseDBModel):
    __tablename__ = "user_daily_activity"
    __table_args__ = (UniqueConstraint("user_id", "activity_date", name="unique_user_activity_date"),)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_date = Column(Date, default=date.today, nullable=False, index=True)
    
    questions_answered = Column(Integer, default=0, nullable=False)
    tests_completed = Column(Integer, default=0, nullable=False)
    study_minutes = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="daily_activities")


class Achievement(BaseDBModel):
    __tablename__ = "achievements"

    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), default="trophy", nullable=False)
    criteria_type = Column(String(100), nullable=False)  # questions_count, streak_days, test_accuracy, topic_mastery
    criteria_value = Column(Integer, default=1, nullable=False)


class UserAchievement(BaseDBModel):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="unique_user_achievement"),)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(String(36), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")


class AdminAuditLog(BaseDBModel):
    __tablename__ = "admin_audit_logs"

    admin_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # create_question, update_question, bulk_import, delete_question
    entity_type = Column(String(100), nullable=False)  # question, subject, topic, user
    entity_id = Column(String(36), nullable=True)
    
    details = Column(Text, nullable=True)
