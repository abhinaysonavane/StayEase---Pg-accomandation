from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    role: str = Field(default="tenant")

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="tenant")

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    kyc_status: Optional[str] = None
    status: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10)
    new_password: str = Field(..., min_length=6, max_length=128)

class GoogleAuthRequest(BaseModel):
    id_token: str
    role: Optional[str] = "tenant"

class GoogleStatusResponse(BaseModel):
    configured: bool
    client_id: Optional[str] = None

class MessageResponse(BaseModel):
    message: str

class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    kyc_status: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

