from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional

from ..models.auth import User, ConversionRecord, UsageStats
from ..services.database import db_service
from .auth import get_current_user

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/usage", response_model=UsageStats)
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """Get user's usage statistics"""
    try:
        stats = await db_service.get_usage_stats(current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve usage statistics"
        )


@router.get("/history", response_model=List[ConversionRecord])
async def get_conversion_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """Get user's conversion history"""
    try:
        conversions = await db_service.get_user_conversions(current_user.id, limit, offset)
        return conversions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversion history"
        )


@router.post("/conversions")
async def record_conversion(
    filename: str,
    file_type: str,
    file_size: int,
    status: str,
    error_message: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Record a file conversion"""
    try:
        conversion_id = await db_service.record_conversion(
            current_user.id, filename, file_type, file_size, status, error_message
        )
        return {"conversion_id": conversion_id, "message": "Conversion recorded successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record conversion"
        )


@router.delete("/account")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Delete user account (placeholder - implement with care)"""
    # This is a placeholder - in a real implementation, you'd want:
    # 1. Additional authentication (password confirmation)
    # 2. Soft delete with grace period
    # 3. Data export option
    # 4. Proper cleanup of all user data
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Account deletion not yet implemented"
    )


@router.get("/settings")
async def get_user_settings(current_user: User = Depends(get_current_user)):
    """Get user settings and preferences"""
    # This is a placeholder for user settings/preferences
    # In a real implementation, you'd have a separate settings table
    return {
        "notifications": {
            "email": True,
            "conversion_complete": True,
            "weekly_summary": False
        },
        "preferences": {
            "default_output_format": "markdown",
            "auto_download": False,
            "retention_days": 30
        }
    }


@router.put("/settings")
async def update_user_settings(
    settings: dict,
    current_user: User = Depends(get_current_user)
):
    """Update user settings and preferences"""
    # This is a placeholder for user settings update
    # In a real implementation, you'd validate and store these in a settings table
    return {"message": "Settings updated successfully", "settings": settings}