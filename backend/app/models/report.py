from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

class ReportBase(BaseModel):
    original_filename: str
    extracted_text: str
    analysis_result: str

class ReportInDB(ReportBase):
    user_id: UUID
    saved_file_path: str
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportResponse(ReportBase):
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)