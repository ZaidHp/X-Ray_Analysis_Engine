import torch
import numpy as np
from ultralytics import YOLO
from PIL import Image
from app.core.config import settings

class AIService:
    def __init__(self):
        self.model = YOLO(settings.MODEL_PATH)
    
    def predict(self, image_path: str):
        image = Image.open(image_path).convert("RGB")
        image_array = np.array(image)
        results = self.model(image_array)
        return results, image_array

ai_service = AIService()