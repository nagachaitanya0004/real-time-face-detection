from pydantic import BaseModel, Field, IPvAnyAddress
from typing import Optional
from uuid import UUID
from datetime import datetime

class VideoSessionModel(BaseModel):
    """
    Pydantic v2 schema for the video_sessions table.
    Provides strict typing and parsing for INET IPs and TIMESTAMPTZ fields.
    """
    session_id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    client_ip: Optional[IPvAnyAddress] = None
    total_frames: int = 0

class ROIRecordModel(BaseModel):
    """
    Pydantic v2 schema for the roi_records table.
    Mirrors table constraints exactly, including bounding box rules and confidence bounds.
    """
    id: Optional[UUID] = None  # DB generates via gen_random_uuid() if omitted
    session_id: UUID
    frame_index: int
    bbox_x: Optional[int] = None
    bbox_y: Optional[int] = None
    bbox_width: Optional[int] = None
    bbox_height: Optional[int] = None
    
    # Matches the SQL CHECK(confidence >= 0 AND confidence <= 1)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    face_detected: bool
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None
    processed_at: Optional[datetime] = None
