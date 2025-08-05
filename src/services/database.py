import os
import asyncpg
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import json
import uuid

from ..models.auth import User, UserCreate, ConversionRecord, UsageStats

logger = logging.getLogger(__name__)


class DatabaseService:
    def __init__(self):
        self.connection_string = os.getenv('NEON_CONNECTION_STRING')
        if not self.connection_string:
            logger.warning("NEON_CONNECTION_STRING not found, database operations will fail")
        self.pool = None

    async def init_pool(self):
        """Initialize the connection pool"""
        if not self.connection_string:
            return
        
        try:
            self.pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            logger.info("Database pool initialized successfully")
            await self.create_tables()
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            self.pool = None

    async def close_pool(self):
        """Close the connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database pool closed")

    @asynccontextmanager
    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.pool:
            raise Exception("Database pool not initialized")
        
        async with self.pool.acquire() as connection:
            yield connection

    async def create_tables(self):
        """Create necessary database tables"""
        create_users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'unlimited')),
            subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
            trial_end_date TIMESTAMP,
            monthly_usage INTEGER DEFAULT 0,
            monthly_limit INTEGER DEFAULT 50,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        """
        
        create_refresh_tokens_table = """
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
        
        create_conversions_table = """
        CREATE TABLE IF NOT EXISTS conversions (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'processing')),
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
        );
        """
        
        create_indexes = """
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
        CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
        CREATE INDEX IF NOT EXISTS idx_conversions_created ON conversions(created_at);
        """

        async with self.get_connection() as conn:
            await conn.execute(create_users_table)
            await conn.execute(create_refresh_tokens_table)
            await conn.execute(create_conversions_table)
            await conn.execute(create_indexes)
            logger.info("Database tables created successfully")

    # User Management
    async def create_user(self, user_data: UserCreate, password_hash: str) -> User:
        """Create a new user"""
        user_id = str(uuid.uuid4())
        trial_end = datetime.utcnow() + timedelta(days=7)
        
        query = """
        INSERT INTO users (id, email, first_name, last_name, password_hash, trial_end_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query, user_id, user_data.email, user_data.firstName, 
                user_data.lastName, password_hash, trial_end
            )
            return self._row_to_user(row)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        query = "SELECT * FROM users WHERE email = $1"
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, email)
            return self._row_to_user(row) if row else None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = $1"
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, user_id)
            return self._row_to_user(row) if row else None

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[User]:
        """Update user information"""
        if not updates:
            return await self.get_user_by_id(user_id)
        
        # Map frontend field names to database field names
        field_mapping = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'email': 'email'
        }
        
        db_updates = {}
        for key, value in updates.items():
            db_field = field_mapping.get(key, key)
            db_updates[db_field] = value
        
        set_clause = ", ".join([f"{field} = ${i+2}" for i, field in enumerate(db_updates.keys())])
        query = f"UPDATE users SET {set_clause}, updated_at = NOW() WHERE id = $1 RETURNING *"
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, user_id, *db_updates.values())
            return self._row_to_user(row) if row else None

    async def get_password_hash(self, email: str) -> Optional[str]:
        """Get password hash for authentication"""
        query = "SELECT password_hash FROM users WHERE email = $1"
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, email)
            return row['password_hash'] if row else None

    async def update_password(self, user_id: str, new_password_hash: str) -> bool:
        """Update user password"""
        query = "UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1"
        
        async with self.get_connection() as conn:
            result = await conn.execute(query, user_id, new_password_hash)
            return result == "UPDATE 1"

    # Refresh Token Management
    async def store_refresh_token(self, user_id: str, token_hash: str, expires_at: datetime) -> str:
        """Store a refresh token"""
        token_id = str(uuid.uuid4())
        query = """
        INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        """
        
        async with self.get_connection() as conn:
            await conn.fetchval(query, token_id, user_id, token_hash, expires_at)
            return token_id

    async def validate_refresh_token(self, token_hash: str) -> Optional[str]:
        """Validate refresh token and return user_id"""
        query = """
        SELECT user_id FROM refresh_tokens 
        WHERE token_hash = $1 AND expires_at > NOW()
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, token_hash)
            return row['user_id'] if row else None

    async def revoke_refresh_token(self, token_hash: str) -> bool:
        """Revoke a refresh token"""
        query = "DELETE FROM refresh_tokens WHERE token_hash = $1"
        
        async with self.get_connection() as conn:
            result = await conn.execute(query, token_hash)
            return result.split()[-1] == "1"

    async def cleanup_expired_tokens(self):
        """Clean up expired refresh tokens"""
        query = "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
        
        async with self.get_connection() as conn:
            await conn.execute(query)

    # Conversion Tracking
    async def record_conversion(self, user_id: str, filename: str, file_type: str, 
                              file_size: int, status: str, error_message: Optional[str] = None) -> str:
        """Record a file conversion"""
        conversion_id = str(uuid.uuid4())
        completed_at = datetime.utcnow() if status == 'completed' else None
        
        query = """
        INSERT INTO conversions (id, user_id, filename, file_type, file_size, status, error_message, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
        """
        
        async with self.get_connection() as conn:
            await conn.fetchval(
                query, conversion_id, user_id, filename, file_type, 
                file_size, status, error_message, completed_at
            )
            
        # Update user's monthly usage if conversion was successful
        if status == 'completed':
            await self._increment_user_usage(user_id)
            
        return conversion_id

    async def get_user_conversions(self, user_id: str, limit: int = 50, offset: int = 0) -> List[ConversionRecord]:
        """Get user's conversion history"""
        query = """
        SELECT * FROM conversions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
        """
        
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, user_id, limit, offset)
            return [self._row_to_conversion(row) for row in rows]

    async def get_usage_stats(self, user_id: str) -> UsageStats:
        """Get user's usage statistics"""
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        query = """
        SELECT 
            COUNT(*) FILTER (WHERE status = 'completed') as total_conversions,
            COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= $2) as monthly_conversions,
            COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= $3) as daily_conversions,
            COALESCE(SUM(file_size) FILTER (WHERE status = 'completed' AND created_at >= $2), 0) as storage_used
        FROM conversions 
        WHERE user_id = $1
        """
        
        # Get user's plan limit
        user_query = "SELECT monthly_limit FROM users WHERE id = $1"
        
        async with self.get_connection() as conn:
            stats_row = await conn.fetchrow(query, user_id, start_of_month, start_of_day)
            user_row = await conn.fetchrow(user_query, user_id)
            
            return UsageStats(
                totalConversions=stats_row['total_conversions'],
                monthlyConversions=stats_row['monthly_conversions'],
                dailyConversions=stats_row['daily_conversions'],
                storageUsed=round(stats_row['storage_used'] / (1024 * 1024)),  # Convert to MB
                planLimit=user_row['monthly_limit'] if user_row else 50
            )

    async def _increment_user_usage(self, user_id: str):
        """Increment user's monthly usage counter"""
        query = "UPDATE users SET monthly_usage = monthly_usage + 1, updated_at = NOW() WHERE id = $1"
        
        async with self.get_connection() as conn:
            await conn.execute(query, user_id)

    def _row_to_user(self, row) -> User:
        """Convert database row to User model"""
        return User(
            id=row['id'],
            email=row['email'],
            firstName=row['first_name'],
            lastName=row['last_name'],
            plan=row['plan'],
            subscriptionStatus=row['subscription_status'],
            trialEndDate=row['trial_end_date'],
            monthlyUsage=row['monthly_usage'],
            monthlyLimit=row['monthly_limit'],
            createdAt=row['created_at'],
            updatedAt=row['updated_at']
        )

    def _row_to_conversion(self, row) -> ConversionRecord:
        """Convert database row to ConversionRecord model"""
        return ConversionRecord(
            id=row['id'],
            userId=row['user_id'],
            filename=row['filename'],
            fileType=row['file_type'],
            fileSize=row['file_size'],
            status=row['status'],
            createdAt=row['created_at'],
            completedAt=row['completed_at'],
            errorMessage=row['error_message']
        )


# Global database service instance
db_service = DatabaseService()