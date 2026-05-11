import asyncpg
from typing import Optional

pool: Optional[asyncpg.Pool] = None

async def init_db(dsn: str) -> None:
    """
    Initialize the database connection pool and create the roi_records table if it doesn't exist.
    
    Args:
        dsn (str): The PostgreSQL connection string.
    """
    global pool
    pool = await asyncpg.create_pool(dsn)
    async with pool.acquire() as conn:
        # Create the ROI records table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS roi_records (
                frame_id UUID PRIMARY KEY,
                x FLOAT,
                y FLOAT,
                width FLOAT,
                height FLOAT,
                confidence FLOAT,
                timestamp TIMESTAMP WITH TIME ZONE,
                face_detected BOOLEAN NOT NULL
            );
        """)

async def get_db_pool() -> asyncpg.Pool:
    """
    Retrieve the initialized database connection pool.
    
    Returns:
        asyncpg.Pool: The active connection pool.
        
    Raises:
        RuntimeError: If the pool has not been initialized.
    """
    if pool is None:
        raise RuntimeError("Database pool is not initialized.")
    return pool

async def close_db() -> None:
    """
    Close the database connection pool safely.
    """
    global pool
    if pool is not None:
        await pool.close()
        pool = None
