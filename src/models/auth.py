from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None


class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=8, max_length=128)
    
    @validator('newPassword')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        return v


class User(UserBase):
    id: str
    plan: Literal['basic', 'premium', 'unlimited'] = 'basic'
    subscriptionStatus: Literal['trial', 'active', 'expired', 'cancelled'] = 'trial'
    trialEndDate: Optional[datetime] = None
    monthlyUsage: int = 0
    monthlyLimit: int = 50
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    refreshToken: str
    expiresIn: int = 3600  # 1 hour


class AuthResponse(TokenResponse):
    user: User


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class TokenData(BaseModel):
    email: Optional[str] = None
    sub: Optional[str] = None
    exp: Optional[datetime] = None


class ConversionRecord(BaseModel):
    id: str
    userId: str
    filename: str
    fileType: str
    fileSize: int
    status: Literal['completed', 'failed', 'processing']
    createdAt: datetime
    completedAt: Optional[datetime] = None
    errorMessage: Optional[str] = None
    
    class Config:
        from_attributes = True


class UsageStats(BaseModel):
    totalConversions: int
    monthlyConversions: int
    dailyConversions: int
    storageUsed: int  # in MB
    planLimit: int