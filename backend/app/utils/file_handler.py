import os
import shutil
from fastapi import UploadFile
from app.core.config import settings

class FileHandler:
    @staticmethod
    async def save_upload(file: UploadFile, detection_id: str) -> str:
        """
        Saves an uploaded file to the configured upload directory with a unique ID.
        """
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{detection_id}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return file_path

    @staticmethod
    def get_result_url(detection_id: str, folder: str = "") -> str:
        """
        Constructs the static URL path for a result image.
        """
        if folder == "explanations":
            return f"/results/explanations/{detection_id}_explanation.jpg"
        elif folder == "gradcam":
            return f"/results/gradcam/{detection_id}_gradcam.jpg"
        return f"/results/{detection_id}_result.jpg"