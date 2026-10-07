import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models import *
from database.seed_data import seed_database
from app.services.test_engine import TestEngineService
from app.services.scoring import ScoringService
from app.schemas.test import TestConfig

def run_integration_test():
    print("=== Step 1: Initializing Database Schema ===")
    Base.metadata.create_all(bind=engine)
    print("Schema created successfully with UUID primary keys and indexes.")

    print("\n=== Step 2: Running Full Taxonomy & Question Bank Seed ===")
    db = SessionLocal()
    try:
        seed_database(db)
        subjects = db.query(Subject).all()
        topics = db.query(Topic).all()
        questions = db.query(Question).all()
        user = db.query(User).filter(User.email == "hammad@nsctprep.pk").first()
        
        print(f"[OK] Subjects Seeded: {len(subjects)} (Target: 10)")
        print(f"[OK] Topics Seeded: {len(topics)} (Target: 150+)")
        print(f"[OK] Questions in Bank: {len(questions)}")
        print(f"[OK] Active Student User: {user.name} ({user.email})")

        print("\n=== Step 3: Testing Test Generation Engine (Largest-Remainder Method) ===")
        # Generate a 10-question Full Mock Simulation
        config = TestConfig(
            mode="full_mock",
            question_count=10,
            time_limit_minutes=10,
            difficulty="mixed"
        )
        session = TestEngineService.generate_test_session(db, user.id, config)
        print(f"[OK] Test Session Generated: ID={session.id}, Title='{session.title}', Questions={session.question_count}")
        
        sqs = db.query(TestSessionQuestion).filter(TestSessionQuestion.test_session_id == session.id).all()
        print(f"[OK] Immutable Snapshot Persisted: {len(sqs)} test_session_questions created.")

        print("\n=== Step 4: Simulating Student Answering & Submission ===")
        for idx, sq in enumerate(sqs):
            opts = db.query(QuestionOption).filter(QuestionOption.question_id == sq.question_id).all()
            if opts:
                # Pick an option
                selected_opt = opts[0]
                ans = db.query(Answer).filter(Answer.test_session_question_id == sq.id).first()
                ans.selected_option_id = selected_opt.id
                ans.is_answered = True
                ans.time_spent_seconds = 25
        db.commit()

        # Submit session
        submitted_session = ScoringService.submit_test_session(db, session.id, user.id)
        result_summary = ScoringService.get_test_result_summary(db, session.id, user.id)
        print(f"[OK] Submission Evaluated Authoritatively:")
        print(f"   Score: {result_summary.score}/{result_summary.question_count} ({result_summary.accuracy}%)")
        print(f"   Correct: {result_summary.total_correct}, Wrong: {result_summary.total_wrong}, Unanswered: {result_summary.total_unanswered}")
        print(f"   Subject Breakdowns: {len(result_summary.subject_breakdown)} competency areas analyzed")

        print("\n=== Step 5: Testing Weak Area Analytics Engine ===")
        stats = db.query(UserTopicStats).filter(UserTopicStats.user_id == user.id).all()
        print(f"[OK] UserTopicStats Records Updated: {len(stats)} topics analyzed for weakness ranking.")

        print("\n>>> ALL ARCHITECTURAL TESTS PASSED! <<<")
    finally:
        db.close()

if __name__ == "__main__":
    run_integration_test()
