import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os

class FractureDetectionService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Must match the labels used in your Colab training script
        self.classes = [
            "Normal", "Shoulder Fracture", "Humerus Fracture",
            "Elbow Fracture", "Forearm Fracture", "Wrist Fracture", "Hand Fracture"
        ]
        
        # 1. Load the architecture
        self.model = models.densenet121(weights=None)
        num_ftrs = self.model.classifier.in_features
        self.model.classifier = nn.Linear(num_ftrs, len(self.classes))
        
        # 2. Load the weights
        model_path = os.path.join("backend", "models", "densenet_fracture.pth")
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.to(self.device)
            self.model.eval()
        else:
            print(f"Error: Model file not found at {model_path}")

        # 3. Define the preprocessing (Must match training transforms)
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def analyze_image(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        return {
            "diagnosis": self.classes[predicted_idx.item()],
            "confidence": round(confidence.item() * 100, 2),
            "status": "success"
        }

ai_service = FractureDetectionService()