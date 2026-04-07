from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import re

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

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

class UserResponse(UserBase):
    id: UUID                    
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[UUID] = None

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class OTPResend(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=64)

    @field_validator('new_password')
    @classmethod
    def validate_password_complexity(cls, password: str) -> str:
        if not re.search(r'[A-Z]', password):
            raise ValueError('Password must contain an uppercase letter.')
        if not re.search(r'[a-z]', password):
            raise ValueError('Password must contain a lowercase letter.')
        if not re.search(r'\d', password):
            raise ValueError('Password must contain a number.')
        return password
    
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=64)

    @field_validator('new_password')
    @classmethod
    def validate_password_complexity(cls, password: str) -> str:
        if not re.search(r'[A-Z]', password):
            raise ValueError('Password must contain an uppercase letter.')
        if not re.search(r'[a-z]', password):
            raise ValueError('Password must contain a lowercase letter.')
        if not re.search(r'\d', password):
            raise ValueError('Password must contain a number.')
        return password