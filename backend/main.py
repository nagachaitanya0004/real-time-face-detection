import asyncio
import logging
import os
import uuid
import json
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis

from database import init_db, get_db_pool, close_db
from face_detector import face_detection_worker
from schemas import ROIRecordModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

redis_client: Optional[aioredis.Redis] = None
worker_task: Optional[asyncio.Task] = None

MAX_FRAME_SIZE = 5 * 1024 * 1024

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, worker_task
    
    dsn = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    await init_db(dsn)
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = aioredis.from_url(redis_url)
    
    worker_task = asyncio.create_task(face_detection_worker(redis_client))
    logger.info("Application startup completed.")
    
    yield
    
    if worker_task:
        worker_task.cancel()
        try:
            await worker_task
        except asyncio.CancelledError:
            pass
            
    if redis_client:
        await redis_client.close()
        
    await close_db()
    logger.info("Application shutdown completed.")

app = FastAPI(title="Real-Time Face Detection Video Streaming", lifespan=lifespan)

@app.post("/stream/upload")
async def upload_frame(
    file: UploadFile = File(...),
    session_id: uuid.UUID = Form(...),
    frame_index: int = Form(...)
):
    if file.content_type not in ["image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid content type. Only image/jpeg is permitted.")
        
    frame_bytes = await file.read()
    
    if len(frame_bytes) > MAX_FRAME_SIZE:
        raise HTTPException(status_code=400, detail="Frame size exceeds 5MB maximum limit.")
        
    frame_id = str(uuid.uuid4())
    
    try:
        await redis_client.setex(f"raw_frame:{frame_id}", 60, frame_bytes)
        
        payload = json.dumps({
            "frame_id": frame_id,
            "session_id": str(session_id),
            "frame_index": frame_index
        })
        await redis_client.rpush("frame_input_queue", payload)
    except Exception as e:
        logger.error(f"Redis error during upload: {e}")
        raise HTTPException(status_code=500, detail="Failed to queue the frame internally.")
        
    return {"frame_id": frame_id, "status": "queued"}

@app.websocket("/stream/live")
async def stream_live(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to WebSocket live stream.")
    
    try:
        while True:
            result = await redis_client.blpop("frame_output_queue", timeout=1.0)
            if result:
                _, frame_id_bytes = result
                frame_id = frame_id_bytes.decode('utf-8')
                
                annotated_bytes = await redis_client.get(f"annotated_frame:{frame_id}")
                if annotated_bytes:
                    await websocket.send_bytes(annotated_bytes)
                    await redis_client.delete(f"annotated_frame:{frame_id}")
    except WebSocketDisconnect:
        logger.info("Client gracefully disconnected from WebSocket live stream.")
    except Exception as e:
        logger.error(f"WebSocket processing error: {e}")
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()

@app.get("/roi/data", response_model=list[ROIRecordModel])
async def get_roi_data(limit: int = Query(10, ge=1, le=1000), offset: int = Query(0, ge=0)):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            records = await conn.fetch("""
                SELECT id, session_id, frame_index, bbox_x, bbox_y, bbox_width, bbox_height, confidence, face_detected, frame_width, frame_height, processed_at
                FROM roi_records
                ORDER BY processed_at DESC
                LIMIT $1 OFFSET $2
            """)
            
            # Since asyncpg returns Record objects, we map them to dicts so Pydantic can validate them correctly.
            result = []
            for r in records:
                result.append(dict(r))
            return result
    except Exception as e:
        logger.error(f"Database error during ROI fetch: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching ROI data.")
