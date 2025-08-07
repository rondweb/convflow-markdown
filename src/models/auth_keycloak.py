from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None


class UserCreate(UserBase):
    username: str
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


class User(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    username: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    roles: List[str] = []
    
    # Campos adicionais que podem ser armazenados em atributos do Keycloak
    plan: Literal['basic', 'premium', 'unlimited'] = 'basic'
    subscriptionStatus: Literal['trial', 'active', 'expired', 'cancelled'] = 'trial'
    monthlyUsage: int = 0
    monthlyLimit: int = 50
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    preferred_username: Optional[str] = None
    roles: List[str] = []


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int = 3600  # 1 hora
    refresh_expires_in: int = 1800  # 30 minutos
    token_type: str = "Bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


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
