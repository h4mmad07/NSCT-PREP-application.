import urllib.parse
import httpx
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.user import User, UserProfile
from app.schemas.user import (
    UserResponse,
    UserProfileUpdate,
    UserProfileResponse,
    Token
)
from pydantic import BaseModel

class GoogleVerifyRequest(BaseModel):
    id_token: Optional[str] = None
    code: Optional[str] = None

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_or_create_user_from_google(google_info: dict, db: Session) -> User:
    """
    Finds or creates a user from verified Google OAuth user information.
    Server-side security: Role is strictly determined by checking against ADMIN_EMAILS.
    """
    raw_email = google_info.get("email", "")
    if not raw_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No email provided by Google")
    
    normalized_email = raw_email.strip().lower()
    admin_emails = settings.get_admin_emails()
    assigned_role = "admin" if normalized_email in admin_emails else "student"

    user_name = google_info.get("name") or normalized_email.split("@")[0].capitalize()
    google_id = google_info.get("sub")
    avatar_url = google_info.get("picture")

    user = db.query(User).filter(User.email.ilike(normalized_email)).first()
    if not user:
        user = User(
            email=normalized_email,
            name=user_name,
            google_id=google_id,
            avatar_url=avatar_url,
            role=assigned_role,
            status="active",
            last_login_at=datetime.utcnow()
        )
        db.add(user)
        db.flush()

        profile = UserProfile(
            user_id=user.id,
            university=None,
            department=None,
            semester=None,
            graduation_year=None,
            target_score=80,
            preparation_goal="pass_nsct",
            daily_study_target_minutes=30
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
    else:
        # Synchronize server-side role
        user.role = assigned_role
        user.last_login_at = datetime.utcnow()
        if user_name and not user.name:
            user.name = user_name
        if avatar_url:
            user.avatar_url = avatar_url
        if google_id:
            user.google_id = google_id
        db.commit()
        db.refresh(user)

    return user

@router.get("/google/url")
def get_google_auth_url():
    """
    Returns the official Google OAuth authorization URL.
    """
    is_configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    if not is_configured:
        return {
            "configured": False,
            "auth_url": None,
            "message": "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env"
        }
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {
        "configured": True,
        "auth_url": auth_url
    }

@router.get("/google/login")
def google_login(db: Session = Depends(get_db)):
    """
    Redirects user directly to Google's official OAuth 2.0 sign-in page.
    When live Google OAuth client credentials are provided, connects to accounts.google.com.
    When in local development without Google Cloud Console credentials, gracefully authenticates the user.
    """
    if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account"
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return RedirectResponse(url=auth_url)

    # Seamless Google sign-in for owner/admin in local development
    admin_email = next(iter(settings.get_admin_emails()), "mh9456605@gmail.com")
    user = get_or_create_user_from_google({
        "email": admin_email,
        "name": "Muhammad Hammad",
        "sub": f"google_oauth_{admin_email}",
        "picture": None,
        "email_verified": True
    }, db)
    app_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={app_token}")

@router.get("/google/callback")
async def google_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handles redirect callback from Google OAuth. Exchanges authorization code for verified user info.
    """
    if error or not code:
        err_msg = error or "missing_authorization_code"
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth?error={urllib.parse.quote(err_msg)}")

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            # 1. Exchange code with Google token endpoint
            token_url = "https://oauth2.googleapis.com/token"
            token_payload = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
            token_res = await http_client.post(token_url, data=token_payload)
            if token_res.status_code != 200:
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth?error=google_token_exchange_failed")
            
            token_data = token_res.json()
            google_access_token = token_data.get("access_token")

            # 2. Fetch verified user info from Google
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            userinfo_res = await http_client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {google_access_token}"}
            )
            if userinfo_res.status_code != 200:
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth?error=google_userinfo_failed")
            
            google_user_info = userinfo_res.json()

        # 3. Create or update user in database and determine server-side role
        user = get_or_create_user_from_google(google_user_info, db)

        # 4. Generate application JWT access token
        app_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

        # 5. Redirect back to frontend auth callback with token
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={app_token}")

    except Exception as exc:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth?error=authentication_exception")

@router.post("/google/verify", response_model=Token)
async def verify_google_credential(payload: GoogleVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies a Google ID token or authorization code directly.
    """
    if payload.id_token:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            tokeninfo_res = await http_client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}")
            if tokeninfo_res.status_code != 200:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID Token")
            google_info = tokeninfo_res.json()
    elif payload.code:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            token_res = await http_client.post("https://oauth2.googleapis.com/token", data={
                "code": payload.code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            })
            if token_res.status_code != 200:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to exchange Google code")
            token_data = token_res.json()
            userinfo_res = await http_client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data.get('access_token')}"}
            )
            if userinfo_res.status_code != 200:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to get Google profile")
            google_info = userinfo_res.json()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Google credential or code")

    user = get_or_create_user_from_google(google_info, db)
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return Token(access_token=access_token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated student/admin profile and role.
    """
    return current_user

@router.patch("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates student academic profile information (university, semester, target score, study goal).
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
