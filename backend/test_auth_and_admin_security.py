import os
import sys

# Test script for authentication and owner admin security
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_auth_and_security():
    print("--- 1. Testing Normal Student Authentication ---")
    # Make sure ADMIN_EMAILS does NOT contain student
    settings.ADMIN_EMAILS = "owner@testdomain.com,admin2@testdomain.com"
    
    student_payload = {
        "email": "student123@gmail.com",
        "name": "Alex Student",
        "google_id": "google_123"
    }
    
    res = client.post("/api/auth/google", json=student_payload)
    assert res.status_code == 200, f"Failed student login: {res.text}"
    student_data = res.json()
    student_token = student_data["access_token"]
    student_role = student_data["user"]["role"]
    assert student_role == "student", f"Expected student role, got {student_role}"
    print(f"[PASS] Student authenticated successfully with role: {student_role}")

    print("\n--- 2. Testing Student Access to Protected Admin Endpoint ---")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    admin_res = client.get("/api/admin/overview", headers=student_headers)
    assert admin_res.status_code == 403, f"Expected 403 Forbidden for student, got {admin_res.status_code}"
    print(f"[PASS] Student correctly blocked with 403 Forbidden: {admin_res.json()}")

    print("\n--- 3. Testing Direct API Question Creation by Student ---")
    q_res = client.post("/api/admin/questions", json={
        "subject_id": "test",
        "topic_id": "test",
        "question_text": "Hacked question",
        "difficulty": "easy",
        "options": []
    }, headers=student_headers)
    assert q_res.status_code == 403, f"Expected 403 for student question creation, got {q_res.status_code}"
    print("[PASS] Student blocked from creating questions (403 Forbidden)")

    print("\n--- 4. Testing Owner/Admin Authentication (Normalized Allowlist) ---")
    # Test with mixed casing and whitespace to verify normalization
    owner_payload = {
        "email": "  Owner@TestDomain.COM  ",
        "name": "Owner Admin",
        "google_id": "google_owner_1"
    }
    
    owner_res = client.post("/api/auth/google", json=owner_payload)
    assert owner_res.status_code == 200, f"Failed owner login: {owner_res.text}"
    owner_data = owner_res.json()
    owner_token = owner_data["access_token"]
    owner_role = owner_data["user"]["role"]
    assert owner_role == "admin", f"Expected admin role for owner, got {owner_role}"
    print(f"[PASS] Owner authenticated successfully with role: {owner_role}")

    print("\n--- 5. Testing Owner Access to Admin Portal & Operations ---")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    admin_overview_res = client.get("/api/admin/overview", headers=owner_headers)
    assert admin_overview_res.status_code == 200, f"Expected 200 for admin, got {admin_overview_res.status_code}: {admin_overview_res.text}"
    overview = admin_overview_res.json()
    print(f"[PASS] Owner accessed Admin Overview successfully: {overview}")

    admin_qs_res = client.get("/api/admin/questions", headers=owner_headers)
    assert admin_qs_res.status_code == 200, f"Failed getting questions: {admin_qs_res.text}"
    print(f"[PASS] Owner fetched question list: count = {len(admin_qs_res.json())}")

    admin_users_res = client.get("/api/admin/users", headers=owner_headers)
    assert admin_users_res.status_code == 200, f"Failed getting users: {admin_users_res.text}"
    print(f"[PASS] Owner fetched user directory: count = {len(admin_users_res.json())}")

    print("\n=======================================================")
    print("ALL SECURITY & AUTHENTICATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_auth_and_security()
