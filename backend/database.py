import asyncpg
import os
from typing import Optional

pool: Optional[asyncpg.Pool] = None

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
