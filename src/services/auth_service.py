import jwt
import bcrypt
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple
import os
import secrets

from ..models.auth import User, UserCreate, TokenResponse, AuthResponse, TokenData
from .database import db_service


class AuthService:
    def __init__(self):
        # Use environment variable or generate a secure random key
        self.secret_key = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
        self.algorithm = 'HS256'
        self.access_token_expire_minutes = 60  # 1 hour
        self.refresh_token_expire_days = 30    # 30 days

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def create_refresh_token(self) -> str:
        """Create a secure refresh token"""
        return secrets.token_urlsafe(32)

    def hash_refresh_token(self, token: str) -> str:
        """Hash a refresh token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()

    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            email: str = payload.get("sub")
            user_id: str = payload.get("user_id")
            exp: float = payload.get("exp")
            
            if email is None or user_id is None:
                return None
                
            exp_datetime = datetime.fromtimestamp(exp) if exp else None
            return TokenData(email=email, sub=user_id, exp=exp_datetime)
        except jwt.PyJWTError:
            return None

    async def register_user(self, user_data: UserCreate) -> AuthResponse:
        """Register a new user"""
        # Check if user already exists
        existing_user = await db_service.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        # Hash the password
        password_hash = self.hash_password(user_data.password)

        # Create the user
        user = await db_service.create_user(user_data, password_hash)

        # Generate tokens
        access_token = self.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        refresh_token = self.create_refresh_token()
        
        # Store refresh token
        refresh_token_hash = self.hash_refresh_token(refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        await db_service.store_refresh_token(user.id, refresh_token_hash, expires_at)

        return AuthResponse(
            user=user,
            token=access_token,
            refreshToken=refresh_token,
            expiresIn=self.access_token_expire_minutes * 60
        )

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password"""
        # Get password hash from database
        password_hash = await db_service.get_password_hash(email)
        if not password_hash:
            return None

        # Verify password
        if not self.verify_password(password, password_hash):
            return None

        # Get user data
        user = await db_service.get_user_by_email(email)
        return user

    async def login_user(self, email: str, password: str) -> AuthResponse:
        """Login a user"""
        user = await self.authenticate_user(email, password)
        if not user:
            raise ValueError("Invalid email or password")

        # Generate tokens
        access_token = self.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        refresh_token = self.create_refresh_token()
        
        # Store refresh token
        refresh_token_hash = self.hash_refresh_token(refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        await db_service.store_refresh_token(user.id, refresh_token_hash, expires_at)

        return AuthResponse(
            user=user,
            token=access_token,
            refreshToken=refresh_token,
            expiresIn=self.access_token_expire_minutes * 60
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Refresh an access token using a refresh token"""
        # Hash the refresh token
        refresh_token_hash = self.hash_refresh_token(refresh_token)
        
        # Validate refresh token and get user_id
        user_id = await db_service.validate_refresh_token(refresh_token_hash)
        if not user_id:
            raise ValueError("Invalid or expired refresh token")

        # Get user data
        user = await db_service.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Generate new access token
        access_token = self.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )

        # Generate new refresh token
        new_refresh_token = self.create_refresh_token()
        
        # Revoke old refresh token
        await db_service.revoke_refresh_token(refresh_token_hash)
        
        # Store new refresh token
        new_refresh_token_hash = self.hash_refresh_token(new_refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        await db_service.store_refresh_token(user.id, new_refresh_token_hash, expires_at)

        return TokenResponse(
            token=access_token,
            refreshToken=new_refresh_token,
            expiresIn=self.access_token_expire_minutes * 60
        )

    async def logout_user(self, refresh_token: str) -> bool:
        """Logout a user by revoking their refresh token"""
        refresh_token_hash = self.hash_refresh_token(refresh_token)
        return await db_service.revoke_refresh_token(refresh_token_hash)

    async def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from access token"""
        token_data = self.verify_token(token)
        if not token_data or not token_data.sub:
            return None

        user = await db_service.get_user_by_id(token_data.sub)
        return user

    async def change_password(self, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password"""
        # Get user data
        user = await db_service.get_user_by_id(user_id)
        if not user:
            return False

        # Get current password hash
        password_hash = await db_service.get_password_hash(user.email)
        if not password_hash:
            return False

        # Verify current password
        if not self.verify_password(current_password, password_hash):
            raise ValueError("Current password is incorrect")

        # Hash new password
        new_password_hash = self.hash_password(new_password)

        # Update password
        return await db_service.update_password(user_id, new_password_hash)


# Global auth service instance
auth_service = AuthService()
