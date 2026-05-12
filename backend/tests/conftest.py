import pytest
import asyncio
import io
import uuid
from unittest.mock import AsyncMock, patch
from PIL import Image, ImageDraw
import httpx
from main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def async_client():
    """
    ISSUE 1: Async httpx client for testing FastAPI endpoints using ASGITransport.
    """
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture(autouse=True)
async def mock_db_pool():
    """
    ISSUE 1: Mock asyncpg connection pool to avoid real database dependency.
    """
    mock_pool = AsyncMock()
    with patch("main.get_db_pool", return_value=mock_pool):
        yield mock_pool

@pytest.fixture(autouse=True)
async def mock_redis():
    """
    ISSUE 1: Mock aioredis client to avoid real Redis dependency.
    """
    mock_r = AsyncMock()
    with patch("main.redis_client", mock_r):
        yield mock_r

@pytest.fixture
def sample_jpeg_bytes():
    """
    ISSUE 1: Generate a valid JPEG image with a face-like oval for detection testing.
    """
    img = Image.new('RGB', (100, 100), color='white')
    draw = ImageDraw.Draw(img)
    # Draw an oval simulating a face
    draw.ellipse([25, 20, 75, 80], fill='pink', outline='black')
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()
