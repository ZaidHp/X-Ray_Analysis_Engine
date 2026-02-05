from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/results", StaticFiles(directory=settings.RESULT_DIR), name="results")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health():
    return {"status": "healthy"}