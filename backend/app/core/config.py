import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "X-Ray Analysis Engine"
    API_V1_STR: str = "/api/v1"
    
    UPLOAD_DIR: str = "uploads"
    RESULT_DIR: str = "results"
    EXPLANATION_DIR: str = f"{RESULT_DIR}/explanations"
    GRADCAM_DIR: str = f"{RESULT_DIR}/gradcam"
    
    MODEL_PATH: str = "models/model.pt"
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    def create_directories(self):
        for path in [self.UPLOAD_DIR, self.RESULT_DIR, self.EXPLANATION_DIR, self.GRADCAM_DIR]:
            os.makedirs(path, exist_ok=True)

settings = Settings()
settings.create_directories()