from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

class SendOtpRequest(BaseModel):
    phone: str
    role: Optional[str] = "worker"

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    demo_otp: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = None

class LoginPasswordRequest(BaseModel):
    phone: str
    password: str

class RegisterRequest(BaseModel):
    phone: str
    role: str = Field(..., description="worker or employer")
    name: str
    password: Optional[str] = None
    location: Optional[str] = None
    primary_skill: Optional[str] = None
    experience_years: Optional[int] = 0
    employer_type: Optional[str] = None
    business_name: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    token: str
    role: str
    user: Dict[str, Any]
    profile: Dict[str, Any]

