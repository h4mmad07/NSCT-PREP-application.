from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.tests import router as tests_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.bookmarks import router as bookmarks_router
from app.api.v1.admin import router as admin_router

from app.api.v1.questions import router as questions_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(subjects_router)
api_router.include_router(questions_router)
api_router.include_router(tests_router)
api_router.include_router(analytics_router)
api_router.include_router(bookmarks_router)
api_router.include_router(admin_router)
