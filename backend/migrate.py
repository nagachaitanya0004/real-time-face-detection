import asyncio
import os
import asyncpg
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migrations():
    """
    Connects to PostgreSQL using asyncpg and executes the init.sql script
    to establish tables, constraints, and indexes idempotently.
    """
    dsn = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    
    logger.info("Connecting to database for migrations...")
    conn = await asyncpg.connect(dsn)
    try:
        # Read the init.sql file relative to this script
        migration_file = os.path.join(os.path.dirname(__file__), "init.sql")
        with open(migration_file, "r") as f:
            sql = f.read()
            
        logger.info("Executing init.sql...")
        # asyncpg's execute properly handles multiple statements including DO blocks
        await conn.execute(sql)
        logger.info("Migrations applied successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())
