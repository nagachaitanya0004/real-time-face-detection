from pydantic import BaseModel, Field, IPvAnyAddress, model_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class VideoSession(BaseModel):
    """
    Pydantic model representing a video streaming session.
    Mirrors the video_sessions table.
    """
    session_id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    client_ip: Optional[IPvAnyAddress] = None
    total_frames: int = Field(default=0)
    
    # model_config provides Pydantic v2 support for returning from ORM/SQL records
    model_config = {
        "from_attributes": True
    }

class ROIRecord(BaseModel):
    """
    Pydantic model representing a single frame's ROI data.
    Mirrors the roi_records table.
    """
    id: UUID
    session_id: UUID
    frame_index: int = Field(..., description="Matches BIGINT in the database")
    bbox_x: Optional[int] = None
    bbox_y: Optional[int] = None
    bbox_width: Optional[int] = None
    bbox_height: Optional[int] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence percentage [0, 1]")
    face_detected: bool
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None
    processed_at: Optional[datetime] = None

    @model_validator(mode='after')
    def check_bbox_dimensions(self) -> 'ROIRecord':
        if self.face_detected:
            if self.bbox_width is None or self.bbox_width <= 0:
                raise ValueError("bbox_width must be > 0 when face_detected is True")
            if self.bbox_height is None or self.bbox_height <= 0:
                raise ValueError("bbox_height must be > 0 when face_detected is True")
        return self

    model_config = {
        "from_attributes": True
    }
