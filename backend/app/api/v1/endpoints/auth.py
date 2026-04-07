import uuid
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm

from app.models.user import UserCreate, UserResponse, Token, OTPVerify, OTPResend, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.mongodb import get_database
from app.utils.email_service import send_otp_email, send_password_reset_email
from app.api.deps import get_current_user

router = APIRouter()

def generate_otp() -> str:
    """Generates a 6-digit numeric OTP."""
    return str(random.randint(100000, 999999))


@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, background_tasks: BackgroundTasks, db = Depends(get_database)):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["is_verified"] = False
    
    raw_otp = generate_otp()
    user_dict["otp_hash"] = get_password_hash(raw_otp)
    user_dict["otp_expiry"] = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db["users"].insert_one(user_dict)
    
    background_tasks.add_task(send_otp_email, user.email, raw_otp)
    
    return user_dict


@router.post("/verify-email")
async def verify_email(payload: OTPVerify, db = Depends(get_database)):
    user = await db["users"].find_one({"email": payload.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.get("is_verified"):
        return {"message": "Email is already verified"}
        
    expiry = user.get("otp_expiry")
    if expiry and expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    if not verify_password(payload.otp, user.get("otp_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    await db["users"].update_one(
        {"email": payload.email},
        {
            "$set": {"is_verified": True},
            "$unset": {"otp_hash": "", "otp_expiry": ""}
        }
    )
    
    return {"message": "Email verified successfully. You can now log in."}


@router.post("/resend-otp")
async def resend_otp(payload: OTPResend, background_tasks: BackgroundTasks, db = Depends(get_database)):
    user = await db["users"].find_one({"email": payload.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.get("is_verified"):
        raise HTTPException(status_code=400, detail="Email is already verified")
        
    raw_otp = generate_otp()
    new_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db["users"].update_one(
        {"email": payload.email},
        {"$set": {
            "otp_hash": get_password_hash(raw_otp),
            "otp_expiry": new_expiry
        }}
    )
    
    background_tasks.add_task(send_otp_email, payload.email, raw_otp)
    
    return {"message": "A new OTP has been sent to your email."}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_database)):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in."
        )
        
    access_token = create_access_token(data={"sub": str(user["id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, db = Depends(get_database)):
    user = await db["users"].find_one({"email": payload.email})
    
    if user:
        raw_otp = generate_otp()
        new_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        await db["users"].update_one(
            {"email": payload.email},
            {"$set": {
                "otp_hash": get_password_hash(raw_otp),
                "otp_expiry": new_expiry
            }}
        )
        
        background_tasks.add_task(send_password_reset_email, payload.email, raw_otp)
        
    return {"message": "If an account with that email exists, a password reset OTP has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db = Depends(get_database)):
    user = await db["users"].find_one({"email": payload.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    expiry = user.get("otp_expiry")
    if not expiry or expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired or was not requested. Please request a new one.")
        
    if not verify_password(payload.otp, user.get("otp_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    new_hashed_password = get_password_hash(payload.new_password)
    
    await db["users"].update_one(
        {"email": payload.email},
        {
            "$set": {"hashed_password": new_hashed_password},
            "$unset": {"otp_hash": "", "otp_expiry": ""}
        }
    )
    
    return {"message": "Password has been reset successfully. You can now log in with your new password."}

@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest, 
    current_user: dict = Depends(get_current_user), 
    db = Depends(get_database)
):
    if not verify_password(payload.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    if verify_password(payload.new_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    new_hashed_password = get_password_hash(payload.new_password)
    
    await db["users"].update_one(
        {"id": current_user["id"]}, 
        {"$set": {"hashed_password": new_hashed_password}}
    )

    return {"message": "Password changed successfully."}