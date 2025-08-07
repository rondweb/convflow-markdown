from fastapi import APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List

from ..models.auth_keycloak import User, TokenData
from ..services.auth_service_keycloak import keycloak_auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Dependency to get current authenticated user from Keycloak token"""
    try:
        user = await keycloak_auth_service.get_current_user(credentials.credentials)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """Dependency to get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        user = await keycloak_auth_service.get_current_user(credentials.credentials)
        return user
    except Exception:
        return None


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to ensure user has admin role"""
    admin_roles = ["admin", "realm-admin"]
    
    if not any(role in current_user.roles for role in admin_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    return current_user


@router.get("/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile from Keycloak"""
    return current_user


@router.get("/validate-token")
async def validate_token(authorization: str = Header(None)):
    """Validate Keycloak token and return basic user info"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    token_data = await keycloak_auth_service.validate_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {
        "valid": True,
        "user_id": token_data.sub,
        "username": token_data.preferred_username,
        "email": token_data.email,
        "roles": token_data.roles
    }
