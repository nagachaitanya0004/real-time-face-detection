# Purpose: API endpoint tests for the face detection backend.

import pytest
import uuid
import json
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_upload_valid_frame(client, sample_frame):
    """Tests that a valid JPEG frame is accepted and queued."""
    session_id = str(uuid.uuid4())
    files = {"file": ("frame.jpg", sample_frame, "image/jpeg")}
    data = {"session_id": session_id, "frame_index": "0"}
    
    response = await client.post("/stream/upload", files=files, data=data)
    
    assert response.status_code == 200
    assert "frame_id" in response.json()
    assert response.json()["status"] == "queued"

@pytest.mark.asyncio
async def test_upload_oversized_frame(client):
    """Tests that frames over 5MB are rejected with 400 Bad Request."""
    large_data = b"0" * (5 * 1024 * 1024 + 1)
    session_id = str(uuid.uuid4())
    files = {"file": ("large.jpg", large_data, "image/jpeg")}
    data = {"session_id": session_id, "frame_index": "0"}
    
    response = await client.post("/stream/upload", files=files, data=data)
    assert response.status_code == 400
    assert "exceeds 5MB" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_invalid_content_type(client):
    """Tests that non-JPEG images are rejected."""
    files = {"file": ("frame.png", b"fake-png-content", "image/png")}
    data = {"session_id": str(uuid.uuid4()), "frame_index": "0"}
    
    response = await client.post("/stream/upload", files=files, data=data)
    assert response.status_code == 400
    assert "Only image/jpeg is permitted" in response.json()["detail"]

@pytest.mark.asyncio
async def test_roi_data_empty(client, mock_db_pool):
    """Tests the ROI data endpoint when no records exist."""
    mock_conn = mock_db_pool.acquire.return_value.__aenter__.return_value
    mock_conn.fetch.return_value = []
    
    response = await client.get("/roi/data")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_roi_data_pagination(client, mock_db_pool):
    """Tests that pagination parameters are correctly passed to the database."""
    mock_conn = mock_db_pool.acquire.return_value.__aenter__.return_value
    mock_conn.fetch.return_value = [{"id": str(uuid.uuid4())} for _ in range(10)]
    
    response = await client.get("/roi/data?limit=10&offset=5")
    assert response.status_code == 200
    assert len(response.json()) == 10
    
    # Verify asyncpg fetch call contains correct limit and offset
    args, _ = mock_conn.fetch.call_args
    assert args[1] == 10  # limit
    assert args[2] == 5   # offset

@pytest.mark.asyncio
async def test_websocket_stream(mock_redis):
    """Tests that the WebSocket correctly broadcasts frames from Pub/Sub."""
    from main import app
    from fastapi.testclient import TestClient
    
    with TestClient(app) as tc:
        # Mock Redis Pub/Sub listener
        mock_pubsub = AsyncMock()
        mock_pubsub.listen.return_value.__aiter__.return_value = iter([
            {'type': 'message', 'data': b'frame-123'}
        ])
        mock_redis.pubsub.return_value = mock_pubsub
        mock_redis.get.return_value = b"annotated-bytes-payload"
        
        with tc.websocket_connect("/stream/live") as websocket:
            data = websocket.receive_bytes()
            assert data == b"annotated-bytes-payload"
