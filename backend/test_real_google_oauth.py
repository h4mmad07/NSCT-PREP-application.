import urllib.parse
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.auth import get_or_create_user_from_google

client = TestClient(app)

def test_google_oauth_routes():
    print("--- 1. Testing GET /api/auth/google/url without config ---")
    settings.GOOGLE_CLIENT_ID = ""
    settings.GOOGLE_CLIENT_SECRET = ""
    res = client.get("/api/auth/google/url")
    assert res.status_code == 200
    data = res.json()
    assert data["configured"] is False
    print("[PASS] Successfully reported unconfigured Google OAuth state:", data["message"])

    print("\n--- 2. Testing GET /api/auth/google/login redirect with config ---")
    settings.GOOGLE_CLIENT_ID = "mock-client-id-123.apps.googleusercontent.com"
    settings.GOOGLE_CLIENT_SECRET = "mock-secret-456"
    settings.GOOGLE_REDIRECT_URI = "http://localhost:8000/api/auth/google/callback"
    
    url_res = client.get("/api/auth/google/url")
    assert url_res.status_code == 200
    assert url_res.json()["configured"] is True
    auth_url = url_res.json()["auth_url"]
    assert "accounts.google.com" in auth_url
    assert "client_id=mock-client-id-123" in auth_url
    print("[PASS] Generated valid Google OAuth authorization URL:", auth_url)

    login_res = client.get("/api/auth/google/login", follow_redirects=False)
    assert login_res.status_code in [302, 307]
    assert "accounts.google.com" in login_res.headers["location"]
    print("[PASS] /api/auth/google/login correctly redirects to Google sign-in:", login_res.headers["location"])

    print("\n--- 3. Testing Google Callback Error Handling ---")
    cb_err = client.get("/api/auth/google/callback?error=access_denied", follow_redirects=False)
    assert cb_err.status_code in [302, 307]
    assert "error=access_denied" in cb_err.headers["location"]
    print("[PASS] Callback error redirection works properly:", cb_err.headers["location"])

    print("\n--- 4. Testing Verified Google User Creation & Server-Side Role ---")
    db = SessionLocal()
    settings.ADMIN_EMAILS = "mh9456605@gmail.com"

    # Test 4a: Student Google Info
    student_google_info = {
        "sub": "google_sub_student_999",
        "email": "newstudent@gmail.com",
        "name": "Jane Student",
        "picture": "https://lh3.googleusercontent.com/a/student",
        "email_verified": True
    }
    student_user = get_or_create_user_from_google(student_google_info, db)
    assert student_user.role == "student"
    assert student_user.email == "newstudent@gmail.com"
    assert student_user.name == "Jane Student"
    print(f"[PASS] Student created with verified Google identity. Role = {student_user.role}")

    # Test 4b: Owner Google Info
    owner_google_info = {
        "sub": "google_sub_owner_001",
        "email": "mh9456605@gmail.com",
        "name": "Muhammad Hammad",
        "picture": "https://lh3.googleusercontent.com/a/owner",
        "email_verified": True
    }
    owner_user = get_or_create_user_from_google(owner_google_info, db)
    assert owner_user.role == "admin"
    assert owner_user.email == "mh9456605@gmail.com"
    assert owner_user.name == "Muhammad Hammad"
    print(f"[PASS] Owner created with verified Google identity. Role = {owner_user.role}")

    # Clean up test student
    db.delete(student_user)
    db.commit()

    print("\n=======================================================")
    print("ALL REAL GOOGLE OAUTH AUDIT TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_google_oauth_routes()
