from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class DetectionItem(BaseModel):
    id: int
    class_name: str = Field(alias="class")
    confidence: float
    box: BoundingBox

class XRayAnalysisBase(BaseModel):
    detection_id: str
    message: str
    result_image_url: str
    explanation_image_url: Optional[str] = None
    gradcam_image_url: Optional[str] = None
    detections: List[DetectionItem] = []
    
    # NEW: Store the LLM's interpretation and recommendations
    ai_consultation: Optional[str] = None 

class XRayAnalysisInDB(XRayAnalysisBase):
    user_id: UUID
    input_image_path: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class XRayAnalysisResponse(XRayAnalysisBase):
    id: str  
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)