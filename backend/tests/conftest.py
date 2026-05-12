# Purpose: Pytest fixtures for the face detection backend.

import pytest
import io
import uuid
import json
import sys
import os
from unittest.mock import AsyncMock, MagicMock, patch
from PIL import Image, ImageDraw
from httpx import AsyncClient

# Ensure the backend directory is in the path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture
def sample_frame():
    """Generates a 640x480 white JPEG frame with an oval 'face' representation."""
    img = Image.new('RGB', (640, 480), color='white')
    draw = ImageDraw.Draw(img)
    # Draw an oval that looks like a face for detection tests
    draw.ellipse([200, 100, 440, 380], outline="black", width=2)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

@pytest.fixture
async def client():
    """Provides an asynchronous test client for FastAPI."""
    from main import app
    # Mock database and redis initialization during lifespan
    with patch("database.init_db", new_callable=AsyncMock), \
         patch("main.aioredis.from_url", return_value=AsyncMock()):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac

@pytest.fixture(autouse=True)
def mock_redis():
    """Automatically mocks the redis_client used in the main app."""
    with patch("main.redis_client", new_callable=AsyncMock) as mock:
        yield mock

@pytest.fixture(autouse=True)
def mock_db_pool():
    """Automatically mocks the database pool to avoid real PostgreSQL connections."""
    with patch("database.get_db_pool", new_callable=AsyncMock) as mock_get_pool:
        mock_pool = AsyncMock()
        mock_conn = AsyncMock()
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_get_pool.return_value = mock_pool
        yield mock_pool
