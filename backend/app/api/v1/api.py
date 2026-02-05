from fastapi import APIRouter
from app.api.v1.endpoints import detection, system

api_router = APIRouter()
api_router.include_router(detection.router, prefix="/analysis", tags=["Detection"])

api_router.include_router(system.router, prefix="/system", tags=["System"])