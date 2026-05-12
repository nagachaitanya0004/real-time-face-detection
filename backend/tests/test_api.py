import pytest
import uuid
from unittest.mock import AsyncMock

@pytest.mark.anyio
async def test_upload_valid_frame(async_client, sample_jpeg_bytes):
    """
    ISSUE 2: Test valid frame upload returns 200 and a valid UUID.
    """
    files = {'file': ('test.jpg', sample_jpeg_bytes, 'image/jpeg')}
    data = {'session_id': str(uuid.uuid4()), 'frame_index': 0}
    
    response = await async_client.post("/stream/upload", files=files, data=data)
    
    assert response.status_code == 200
    json_data = response.json()
    assert "frame_id" in json_data
    # Validate UUID format
    uuid.UUID(json_data["frame_id"])

@pytest.mark.anyio
async def test_upload_oversized_frame(async_client):
    """
    ISSUE 2: Test that frames over 5MB are rejected with 413 Payload Too Large.
    """
    oversized_data = b"0" * (6 * 1024 * 1024) # 6MB
    files = {'file': ('large.jpg', oversized_data, 'image/jpeg')}
    data = {'session_id': str(uuid.uuid4()), 'frame_index': 0}
    
    response = await async_client.post("/stream/upload", files=files, data=data)
    assert response.status_code == 413

@pytest.mark.anyio
async def test_roi_data_empty(async_client, mock_db_pool):
    """
    ISSUE 2: Test paginated ROI data when no records exist.
    """
    mock_conn = AsyncMock()
    mock_db_pool.acquire.return_value.__aenter__.return_value = mock_conn
    
    # Mock empty results
    mock_conn.fetch.return_value = []
    mock_conn.fetchval.return_value = 0
    
    response = await async_client.get("/stream/roi-data")
    assert response.status_code == 200
    assert response.json() == {
        "items": [],
        "total": 0,
        "limit": 10,
        "offset": 0
    }

@pytest.mark.anyio
async def test_roi_data_pagination(async_client, mock_db_pool):
    """
    ISSUE 2: Test that pagination parameters are respected and metadata is returned.
    """
    mock_conn = AsyncMock()
    mock_db_pool.acquire.return_value.__aenter__.return_value = mock_conn
    
    # Create 10 dummy records
    dummy_records = [
        {
            "id": uuid.uuid4(),
            "session_id": uuid.uuid4(),
            "frame_index": i,
            "bbox_x": 10, "bbox_y": 10, "bbox_width": 50, "bbox_height": 50,
            "confidence": 0.95, "face_detected": True,
            "frame_width": 640, "frame_height": 480,
            "processed_at": "2024-05-12T12:00:00Z"
        } for i in range(10)
    ]
    
    mock_conn.fetch.return_value = dummy_records
    mock_conn.fetchval.return_value = 100 # Total count in DB
    
    response = await async_client.get("/stream/roi-data?limit=10&offset=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["offset"] == 5
    assert data["total"] == 100
