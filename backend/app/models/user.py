from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import re

# 1. Base User Model (Shared across everything)
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = True
    is_superuser: bool = False  # Added for admin role checks
    is_verified: bool = False   # Added for email confirmation flows

# 2. Model for creating a user (API Input)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=64)

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, password: str) -> str:
        if not re.search(r'[A-Z]', password):
            raise ValueError('Password must contain an uppercase letter.')
        if not re.search(r'[a-z]', password):
            raise ValueError('Password must contain a lowercase letter.')
        if not re.search(r'\d', password):
            raise ValueError('Password must contain a number.')
        return password

# 3. Model for returning user data (API Output)
class UserResponse(UserBase):
    id: UUID                    # Expose the UUID to the frontend
    created_at: datetime
    
    # CRITICAL: This allows Pydantic to read data directly from a Database Object
    # (e.g., SQLAlchemy) rather than requiring a Python dictionary.
    model_config = ConfigDict(from_attributes=True)

# 4. Token Models (Updated to use UUID)
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    # 'sub' (subject) is the standard JWT claim for identifying the user.
    # It expects a UUID matching the generated User ID.
    sub: Optional[UUID] = None