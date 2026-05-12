import asyncpg
import os
from typing import Optional

pool: Optional[asyncpg.Pool] = None

def validate_db_url(url: str):
    """
    Security validation: Ensures that external database connections enforce SSL.
    """
    if not url:
        return
    # If connection is not local or container-internal, require SSL
    if "localhost" not in url and "db" not in url and "127.0.0.1" not in url:
        if "sslmode=require" not in url and "sslmode=verify-full" not in url:
             raise RuntimeError("Security Policy Violation: External database connections must use 'sslmode=require'")

async def init_db(dsn: str) -> None:
    """
    Initialize the database connection pool and run migrations automatically.
    """
    global pool
    pool = await asyncpg.create_pool(dsn)
    async with pool.acquire() as conn:
        migration_file = os.path.join(os.path.dirname(__file__), "init.sql")
        if os.path.exists(migration_file):
            with open(migration_file, "r") as f:
                sql = f.read()
            # Audit: migration execution is safe as it's from a trusted local file
            await conn.execute(sql)

async def get_db_pool() -> asyncpg.Pool:
    """
    Retrieve the initialized database connection pool.
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
