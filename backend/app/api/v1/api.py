from fastapi import APIRouter
from app.api.v1.endpoints import detection, system, medical_report

api_router = APIRouter()
api_router.include_router(detection.router, prefix="/analysis", tags=["Detection"])
api_router.include_router(medical_report.router, prefix="/medical-report", tags=["Medical Report"])
api_router.include_router(system.router, prefix="/system", tags=["System"])