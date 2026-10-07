import math
import random
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.taxonomy import Subject, Topic
from app.models.question import Question, QuestionOption
from app.models.test_session import TestSession, TestSessionQuestion, Answer, Bookmark
from app.models.analytics import UserTopicStats
from app.schemas.test import TestConfig

class TestEngineService:

    @staticmethod
    def calculate_largest_remainder_distribution(weights: Dict[str, int], total_count: int) -> Dict[str, int]:
        """
        Largest-remainder algorithm (Hare-Niemeyer method) to allocate integer question counts
        fairly according to official NSCT subject percentage weights.
        """
        if not weights or total_count <= 0:
            return {}
        
        sum_weights = sum(weights.values())
        if sum_weights == 0:
            return {k: 0 for k in weights}

        exact_allocations = {k: (w * total_count) / sum_weights for k, w in weights.items()}
        int_allocations = {k: math.floor(val) for k, val in exact_allocations.items()}
        remainders = {k: exact_allocations[k] - int_allocations[k] for k in weights}
        
        remainder_to_distribute = total_count - sum(int_allocations.values())
        
        # Sort subjects by remainder descending
        sorted_by_remainder = sorted(remainders.items(), key=lambda item: item[1], reverse=True)
        
        for i in range(remainder_to_distribute):
            subj_id = sorted_by_remainder[i % len(sorted_by_remainder)][0]
            int_allocations[subj_id] += 1
            
        return int_allocations

    @staticmethod
    def get_recently_used_question_ids(db: Session, user_id: str, limit_tests: int = 3) -> List[str]:
        """
        Fetches question IDs from user's most recent tests to prevent repetition in standard practice.
        """
        recent_sessions = db.query(TestSession.id)\
            .filter(TestSession.user_id == user_id)\
            .order_by(desc(TestSession.created_at))\
            .limit(limit_tests)\
            .all()
        
        recent_session_ids = [s[0] for s in recent_sessions]
        if not recent_session_ids:
            return []
            
        recent_q_ids = db.query(TestSessionQuestion.question_id)\
            .filter(TestSessionQuestion.test_session_id.in_(recent_session_ids))\
            .distinct()\
            .all()
            
        return [q[0] for q in recent_q_ids]

    @classmethod
    def generate_test_session(cls, db: Session, user_id: str, config: TestConfig) -> TestSession:
        """
        Main unified Test Engine generating dynamic tests according to any preparation mode.
        """
        selected_questions: List[Question] = []
        recent_ids = set(cls.get_recently_used_question_ids(db, user_id, limit_tests=3))

        # Mode 1: Full NSCT Simulation (100 or requested count weighted proportionally by official weights)
        if config.mode == "full_mock":
            subjects = db.query(Subject).filter(Subject.is_active == True).all()
            weights = {s.id: s.weight_percentage for s in subjects}
            distribution = cls.calculate_largest_remainder_distribution(weights, config.question_count)
            
            for subject_id, target_count in distribution.items():
                if target_count <= 0:
                    continue
                q_query = db.query(Question).filter(
                    Question.subject_id == subject_id,
                    Question.status == "published"
                )
                if config.difficulty and config.difficulty != "mixed":
                    q_query = q_query.filter(Question.difficulty == config.difficulty)
                    
                candidate_questions = q_query.all()
                if not candidate_questions:
                    continue
                
                # Separate into fresh questions and recently used
                fresh = [q for q in candidate_questions if q.id not in recent_ids]
                used = [q for q in candidate_questions if q.id in recent_ids]
                
                random.shuffle(fresh)
                random.shuffle(used)
                
                pool = fresh + used
                selected_questions.extend(pool[:target_count])

        # Mode 2: Weak Area Practice
        elif config.mode == "weak_areas":
            # Fetch user's lowest accuracy topics
            topic_stats = db.query(UserTopicStats)\
                .filter(UserTopicStats.user_id == user_id)\
                .order_by(UserTopicStats.accuracy.asc(), desc(UserTopicStats.questions_attempted))\
                .all()
                
            weak_topic_ids = [ts.topic_id for ts in topic_stats if ts.accuracy < 65.0]
            
            q_query = db.query(Question).filter(Question.status == "published")
            if weak_topic_ids:
                q_query = q_query.filter(Question.topic_id.in_(weak_topic_ids))
            elif config.subjects:
                q_query = q_query.filter(Question.subject_id.in_(config.subjects))
                
            candidates = q_query.all()
            random.shuffle(candidates)
            selected_questions = candidates[:config.question_count]

        # Mode 3: Mistake Practice
        elif config.mode == "mistakes":
            mistake_q_ids = db.query(TestSessionQuestion.question_id)\
                .join(Answer, Answer.test_session_question_id == TestSessionQuestion.id)\
                .join(TestSession, TestSession.id == TestSessionQuestion.test_session_id)\
                .filter(TestSession.user_id == user_id, Answer.is_correct == False, Answer.is_answered == True)\
                .distinct()\
                .all()
                
            m_ids = [m[0] for m in mistake_q_ids]
            if m_ids:
                candidates = db.query(Question).filter(Question.id.in_(m_ids), Question.status == "published").all()
                random.shuffle(candidates)
                selected_questions = candidates[:config.question_count]
            else:
                # Fallback to random if no mistakes recorded yet
                candidates = db.query(Question).filter(Question.status == "published").all()
                random.shuffle(candidates)
                selected_questions = candidates[:config.question_count]

        # Mode 4: Revision Mode (Bookmarks + Mistakes)
        elif config.mode == "revision":
            bookmark_q_ids = [b.question_id for b in db.query(Bookmark.question_id).filter(Bookmark.user_id == user_id).all()]
            candidates = db.query(Question).filter(Question.id.in_(bookmark_q_ids), Question.status == "published").all()
            if len(candidates) < config.question_count:
                extra = db.query(Question).filter(Question.status == "published").all()
                random.shuffle(extra)
                candidates.extend([q for q in extra if q.id not in bookmark_q_ids])
            random.shuffle(candidates)
            selected_questions = candidates[:config.question_count]

        # Mode 5: Custom / Subject / Topic / Quick / Challenge
        else:
            q_query = db.query(Question).filter(Question.status == "published")
            
            if config.subjects and len(config.subjects) > 0:
                q_query = q_query.filter(Question.subject_id.in_(config.subjects))
            if config.topics and len(config.topics) > 0:
                q_query = q_query.filter(Question.topic_id.in_(config.topics))
            if config.difficulty and config.difficulty != "mixed":
                q_query = q_query.filter(Question.difficulty == config.difficulty)
            elif config.mode == "challenge":
                q_query = q_query.filter(Question.difficulty == "hard")
                
            candidates = q_query.all()
            fresh = [q for q in candidates if q.id not in recent_ids]
            used = [q for q in candidates if q.id in recent_ids]
            random.shuffle(fresh)
            random.shuffle(used)
            pool = fresh + used
            selected_questions = pool[:config.question_count]

        # Safety guarantee: if not enough questions found matching strict criteria, fill with available questions
        if len(selected_questions) < min(5, config.question_count):
            fallback = db.query(Question).filter(Question.status == "published").all()
            random.shuffle(fallback)
            for q in fallback:
                if q not in selected_questions:
                    selected_questions.append(q)
                if len(selected_questions) >= config.question_count:
                    break

        if config.randomize_questions:
            random.shuffle(selected_questions)

        # Determine time limit
        time_limit_sec = config.time_limit_minutes * 60 if config.time_limit_minutes > 0 else 0
        if config.mode == "full_mock" and time_limit_sec == 0:
            time_limit_sec = 60 * 60  # Default 60 minutes for mock if not specified

        # Create session record
        title = config.title or f"{config.mode.replace('_', ' ').title()} Test"
        test_session = TestSession(
            user_id=user_id,
            title=title,
            mode=config.mode,
            question_count=len(selected_questions),
            time_limit_seconds=time_limit_sec,
            started_at=datetime.utcnow(),
            status="in_progress",
            config_snapshot=config.model_dump_json()
        )
        db.add(test_session)
        db.flush()

        # Create session questions snapshot and initialize empty answers
        for idx, question in enumerate(selected_questions, start=1):
            ts_q = TestSessionQuestion(
                test_session_id=test_session.id,
                question_id=question.id,
                question_order=idx
            )
            db.add(ts_q)
            db.flush()

            answer = Answer(
                test_session_question_id=ts_q.id,
                selected_option_id=None,
                is_correct=False,
                is_answered=False,
                is_marked_for_review=False,
                time_spent_seconds=0
            )
            db.add(answer)

        db.commit()
        db.refresh(test_session)
        return test_session
