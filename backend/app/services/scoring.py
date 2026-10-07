import json
from datetime import datetime, date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.test_session import TestSession, TestSessionQuestion, Answer, Bookmark
from app.models.question import Question, QuestionOption
from app.models.taxonomy import Subject, Topic
from app.models.analytics import (
    UserTopicStats,
    UserSubjectStats,
    UserDailyActivity,
    Achievement,
    UserAchievement,
)
from app.schemas.test import (
    TestResultResponse,
    SubjectBreakdown,
    TopicBreakdown,
    TestReviewResponse,
    ReviewQuestionItem,
)

class ScoringService:

    @classmethod
    def submit_test_session(cls, db: Session, session_id: str, user_id: str) -> TestSession:
        """
        Finalizes a test session, computes authoritative scores, and updates student statistics.
        """
        test_session = db.query(TestSession).filter(
            TestSession.id == session_id,
            TestSession.user_id == user_id
        ).first()

        if not test_session:
            raise ValueError("Test session not found")

        if test_session.status == "submitted":
            return test_session

        now = datetime.utcnow()
        test_session.submitted_at = now
        test_session.status = "submitted"

        # Calculate time spent
        elapsed_seconds = int((now - test_session.started_at).total_seconds())
        test_session.time_spent_seconds = elapsed_seconds

        # Evaluate all answers
        session_questions = db.query(TestSessionQuestion).filter(
            TestSessionQuestion.test_session_id == session_id
        ).all()

        total_correct = 0
        total_wrong = 0
        total_unanswered = 0

        # Topic and Subject aggregators for statistics updates
        topic_updates: Dict[str, Dict[str, Any]] = {}
        subject_updates: Dict[str, Dict[str, Any]] = {}

        for sq in session_questions:
            answer = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
            question = db.query(Question).filter(Question.id == sq.question_id).first()
            
            if not question:
                continue

            # Initialize counters for stats
            if question.topic_id not in topic_updates:
                topic_updates[question.topic_id] = {"attempted": 0, "correct": 0, "wrong": 0, "time": 0}
            if question.subject_id not in subject_updates:
                subject_updates[question.subject_id] = {"attempted": 0, "correct": 0, "wrong": 0, "time": 0}

            if answer and answer.is_answered and answer.selected_option_id:
                # Check option correctness in DB
                selected_opt = db.query(QuestionOption).filter(QuestionOption.id == answer.selected_option_id).first()
                if selected_opt and selected_opt.is_correct:
                    answer.is_correct = True
                    total_correct += 1
                    topic_updates[question.topic_id]["correct"] += 1
                    subject_updates[question.subject_id]["correct"] += 1
                else:
                    answer.is_correct = False
                    total_wrong += 1
                    topic_updates[question.topic_id]["wrong"] += 1
                    subject_updates[question.subject_id]["wrong"] += 1
                
                topic_updates[question.topic_id]["attempted"] += 1
                subject_updates[question.subject_id]["attempted"] += 1
                topic_updates[question.topic_id]["time"] += answer.time_spent_seconds
                subject_updates[question.subject_id]["time"] += answer.time_spent_seconds
            else:
                total_unanswered += 1
                if answer:
                    answer.is_correct = False

        test_session.total_correct = total_correct
        test_session.total_wrong = total_wrong
        test_session.total_unanswered = total_unanswered

        total_q = len(session_questions) or 1
        accuracy = round((total_correct / total_q) * 100.0, 1)

        # Check negative marking configuration
        negative_marking = False
        if test_session.config_snapshot:
            try:
                cfg = json.loads(test_session.config_snapshot)
                negative_marking = cfg.get("negative_marking", False)
            except Exception:
                pass

        if negative_marking:
            test_session.score = max(0.0, round(float(total_correct) - (0.25 * float(total_wrong)), 2))
        else:
            test_session.score = float(total_correct)

        test_session.accuracy = accuracy

        # 1. Update UserTopicStats
        for topic_id, stats in topic_updates.items():
            if stats["attempted"] == 0:
                continue
            topic_stat = db.query(UserTopicStats).filter(
                UserTopicStats.user_id == user_id,
                UserTopicStats.topic_id == topic_id
            ).first()
            if not topic_stat:
                topic_stat = UserTopicStats(
                    user_id=user_id,
                    topic_id=topic_id,
                    questions_attempted=stats["attempted"],
                    questions_correct=stats["correct"],
                    questions_wrong=stats["wrong"],
                    accuracy=round((stats["correct"] / stats["attempted"]) * 100, 1),
                    average_time_seconds=round(stats["time"] / stats["attempted"], 1),
                    last_attempted_at=now
                )
                db.add(topic_stat)
            else:
                topic_stat.questions_attempted += stats["attempted"]
                topic_stat.questions_correct += stats["correct"]
                topic_stat.questions_wrong += stats["wrong"]
                topic_stat.accuracy = round((topic_stat.questions_correct / topic_stat.questions_attempted) * 100, 1)
                topic_stat.last_attempted_at = now

        # 2. Update UserSubjectStats
        for subject_id, stats in subject_updates.items():
            if stats["attempted"] == 0:
                continue
            subject_stat = db.query(UserSubjectStats).filter(
                UserSubjectStats.user_id == user_id,
                UserSubjectStats.subject_id == subject_id
            ).first()
            if not subject_stat:
                subject_stat = UserSubjectStats(
                    user_id=user_id,
                    subject_id=subject_id,
                    questions_attempted=stats["attempted"],
                    questions_correct=stats["correct"],
                    questions_wrong=stats["wrong"],
                    accuracy=round((stats["correct"] / stats["attempted"]) * 100, 1),
                    average_time_seconds=round(stats["time"] / stats["attempted"], 1),
                    last_attempted_at=now
                )
                db.add(subject_stat)
            else:
                subject_stat.questions_attempted += stats["attempted"]
                subject_stat.questions_correct += stats["correct"]
                subject_stat.questions_wrong += stats["wrong"]
                subject_stat.accuracy = round((subject_stat.questions_correct / subject_stat.questions_attempted) * 100, 1)
                subject_stat.last_attempted_at = now

        # 3. Update UserDailyActivity
        today = date.today()
        activity = db.query(UserDailyActivity).filter(
            UserDailyActivity.user_id == user_id,
            UserDailyActivity.activity_date == today
        ).first()
        
        attempted_today = total_correct + total_wrong
        study_minutes_session = max(1, elapsed_seconds // 60)
        
        if not activity:
            activity = UserDailyActivity(
                user_id=user_id,
                activity_date=today,
                questions_answered=attempted_today,
                tests_completed=1,
                study_minutes=study_minutes_session
            )
            db.add(activity)
        else:
            activity.questions_answered += attempted_today
            activity.tests_completed += 1
            activity.study_minutes += study_minutes_session

        db.commit()
        db.refresh(test_session)
        return test_session

    @classmethod
    def get_test_result_summary(cls, db: Session, session_id: str, user_id: str) -> TestResultResponse:
        """
        Builds the complete post-submission test result breakdown.
        """
        test_session = db.query(TestSession).filter(
            TestSession.id == session_id,
            TestSession.user_id == user_id
        ).first()

        if not test_session:
            raise ValueError("Test session not found")

        # Subject & Topic breakdowns
        session_questions = db.query(TestSessionQuestion).filter(
            TestSessionQuestion.test_session_id == session_id
        ).all()

        subject_map: Dict[str, Dict[str, Any]] = {}
        topic_map: Dict[str, Dict[str, Any]] = {}

        for sq in session_questions:
            q = db.query(Question).filter(Question.id == sq.question_id).first()
            if not q:
                continue
            
            ans = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
            is_c = ans.is_correct if ans else False
            is_ans = ans.is_answered if ans else False

            # Subject
            if q.subject_id not in subject_map:
                s_obj = db.query(Subject).filter(Subject.id == q.subject_id).first()
                subject_map[q.subject_id] = {
                    "id": q.subject_id,
                    "name": s_obj.name if s_obj else "Subject",
                    "total": 0,
                    "correct": 0,
                    "wrong": 0,
                    "unanswered": 0
                }
            subject_map[q.subject_id]["total"] += 1
            if is_ans:
                if is_c:
                    subject_map[q.subject_id]["correct"] += 1
                else:
                    subject_map[q.subject_id]["wrong"] += 1
            else:
                subject_map[q.subject_id]["unanswered"] += 1

            # Topic
            if q.topic_id not in topic_map:
                t_obj = db.query(Topic).filter(Topic.id == q.topic_id).first()
                s_obj = db.query(Subject).filter(Subject.id == q.subject_id).first()
                topic_map[q.topic_id] = {
                    "id": q.topic_id,
                    "name": t_obj.name if t_obj else "Topic",
                    "subject_name": s_obj.name if s_obj else "",
                    "total": 0,
                    "correct": 0,
                    "wrong": 0
                }
            topic_map[q.topic_id]["total"] += 1
            if is_c:
                topic_map[q.topic_id]["correct"] += 1
            else:
                topic_map[q.topic_id]["wrong"] += 1

        subject_breakdown = [
            SubjectBreakdown(
                subject_id=v["id"],
                subject_name=v["name"],
                total_questions=v["total"],
                correct=v["correct"],
                wrong=v["wrong"],
                unanswered=v["unanswered"],
                accuracy=round((v["correct"] / max(1, v["total"])) * 100, 1)
            ) for v in subject_map.values()
        ]

        topic_breakdown = [
            TopicBreakdown(
                topic_id=v["id"],
                topic_name=v["name"],
                subject_name=v["subject_name"],
                total_questions=v["total"],
                correct=v["correct"],
                wrong=v["wrong"],
                accuracy=round((v["correct"] / max(1, v["total"])) * 100, 1)
            ) for v in topic_map.values()
        ]

        # Recommendation logic based on performance
        if test_session.accuracy >= 80:
            recommendation = "Outstanding performance! You are well prepared for these topics. Try Challenge mode to master advanced nuances."
        elif test_session.accuracy >= 60:
            recommendation = "Good progress! Focus on your weaker topics highlighted below using Topic Practice to reach the 80%+ threshold."
        else:
            recommendation = "Keep going! We recommend reviewing the detailed explanations and practicing targeted Weak Area modules."

        return TestResultResponse(
            id=test_session.id,
            title=test_session.title,
            mode=test_session.mode,
            question_count=test_session.question_count,
            total_correct=test_session.total_correct,
            total_wrong=test_session.total_wrong,
            total_unanswered=test_session.total_unanswered,
            score=test_session.score,
            accuracy=test_session.accuracy,
            time_spent_seconds=test_session.time_spent_seconds,
            started_at=test_session.started_at,
            submitted_at=test_session.submitted_at,
            subject_breakdown=subject_breakdown,
            topic_breakdown=topic_breakdown,
            recommendation=recommendation
        )

    @classmethod
    def get_test_review(cls, db: Session, session_id: str, user_id: str) -> TestReviewResponse:
        """
        Returns question-by-question review with all options, correct answers, explanations, and hints.
        """
        result_summary = cls.get_test_result_summary(db, session_id, user_id)
        
        session_questions = db.query(TestSessionQuestion).filter(
            TestSessionQuestion.test_session_id == session_id
        ).order_by(TestSessionQuestion.question_order).all()

        user_bookmarks = {
            b.question_id for b in db.query(Bookmark.question_id).filter(Bookmark.user_id == user_id).all()
        }

        review_questions: List[ReviewQuestionItem] = []

        for sq in session_questions:
            q = db.query(Question).filter(Question.id == sq.question_id).first()
            if not q:
                continue
            
            ans = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
            options = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).order_by(QuestionOption.display_order).all()

            options_data = [
                {
                    "id": opt.id,
                    "option_text": opt.option_text,
                    "is_correct": opt.is_correct,
                    "display_order": opt.display_order
                } for opt in options
            ]

            subject = db.query(Subject).filter(Subject.id == q.subject_id).first()
            topic = db.query(Topic).filter(Topic.id == q.topic_id).first()

            review_questions.append(
                ReviewQuestionItem(
                    session_question_id=sq.id,
                    question_order=sq.question_order,
                    question_id=q.id,
                    question_text=q.question_text,
                    code_snippet=q.code_snippet,
                    difficulty=q.difficulty,
                    subject_name=subject.name if subject else "General",
                    topic_name=topic.name if topic else "General",
                    explanation=q.explanation,
                    hint=q.hint,
                    options=options_data,
                    selected_option_id=ans.selected_option_id if ans else None,
                    is_correct=ans.is_correct if ans else False,
                    is_answered=ans.is_answered if ans else False,
                    is_marked_for_review=ans.is_marked_for_review if ans else False,
                    time_spent_seconds=ans.time_spent_seconds if ans else 0,
                    is_bookmarked=(q.id in user_bookmarks)
                )
            )

        return TestReviewResponse(
            result=result_summary,
            questions=review_questions
        )
