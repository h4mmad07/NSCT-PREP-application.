from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)

ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Validates JWT token and extracts authenticated user.
    In development, falls back to default active student if no token provided.
    In production, strictly requires a valid JWT bearer token.
    """
    if not token:
        if settings.ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please sign in with Google.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Development fallback user
        user = db.query(User).filter(User.email.in_(["mh9456605@gmail.com", "hammad@nsctprep.pk"])).first()
        if user:
            return user
        
        from app.models.user import UserProfile
        user = User(
            email="mh9456605@gmail.com",
            name="Muhammad Hammad",
            role="admin",
            status="active"
        )
        db.add(user)
        db.flush()
        
        profile = UserProfile(
            user_id=user.id,
            university="National University",
            department="Computer Science",
            semester=7,
            target_score=85,
            preparation_goal="pass_nsct"
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
        return user

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or suspended account")
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Strict server-side authorization: Blocks non-administrators with 403 Forbidden.
    """
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user
