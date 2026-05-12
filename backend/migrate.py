import asyncio
import asyncpg
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def apply_migrations():
    # Retrieve the database URL from environment variable
    # Defaults to a local testing postgres DB if not set
    database_url = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/postgres"
    )
    
    logger.info("Connecting to the database...")
    try:
        conn = await asyncpg.connect(database_url)
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return

    # Dynamically locate the init.sql file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(script_dir, "init.sql")
    
    if not os.path.exists(sql_path):
        logger.error(f"Migration file not found at {sql_path}")
        await conn.close()
        return

    # Read the idempotent SQL script
    with open(sql_path, "r") as f:
        sql_content = f.read()

    logger.info("Applying migrations...")
    try:
        # asyncpg.execute() runs multiple statements in one go
        await conn.execute(sql_content)
        logger.info("Migrations applied successfully!")
    except Exception as e:
        logger.error(f"Error applying migrations: {e}")
    finally:
        await conn.close()
        logger.info("Database connection closed.")

if __name__ == "__main__":
    asyncio.run(apply_migrations())
