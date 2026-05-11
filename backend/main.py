import asyncio
import logging
import os
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis

from database import init_db, get_db_pool, close_db
from face_detector import face_detection_worker

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global component instances
redis_client: Optional[aioredis.Redis] = None
worker_task: Optional[asyncio.Task] = None

# Security constraint for frame sizes
MAX_FRAME_SIZE = 5 * 1024 * 1024  # 5MB limit

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event manager to start and stop database, Redis, and background worker cleanly.
    """
    global redis_client, worker_task
    
    # Initialize Database pool and create table if it doesn't exist
    dsn = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    await init_db(dsn)
    
    # Initialize Redis connection
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = aioredis.from_url(redis_url)
    
    # Start background detection worker as an asyncio Task
    worker_task = asyncio.create_task(face_detection_worker(redis_client))
    logger.info("Application startup completed. Worker task initialized.")
    
    yield
    
    # Cleanup routines on graceful shutdown
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

# Initialize FastAPI application
app = FastAPI(title="Real-Time Face Detection Video Streaming", lifespan=lifespan)

@app.post("/stream/upload")
async def upload_frame(file: UploadFile = File(...)):
    """
    Accepts multipart video frames (JPEG bytes), validates size and content type, 
    and pushes to Redis queue for asynchronous background processing.
    """
    # 1. Validate content type strictly
    if file.content_type not in ["image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid content type. Only image/jpeg is permitted.")
        
    frame_bytes = await file.read()
    
    # 2. Validate frame size
    if len(frame_bytes) > MAX_FRAME_SIZE:
        raise HTTPException(status_code=400, detail="Frame size exceeds 5MB maximum limit.")
        
    frame_id = str(uuid.uuid4())
    
    try:
        # Save raw frame content payload and push reference to input queue
        await redis_client.setex(f"raw_frame:{frame_id}", 60, frame_bytes)
        
        import json
        payload = json.dumps({"frame_id": frame_id})
        await redis_client.rpush("frame_input_queue", payload)
    except Exception as e:
        logger.error(f"Redis error during upload: {e}")
        raise HTTPException(status_code=500, detail="Failed to queue the frame internally.")
        
    return {"frame_id": frame_id, "status": "queued"}

@app.websocket("/stream/live")
async def stream_live(websocket: WebSocket):
    """
    WebSocket endpoint that pulls processed frames from the Redis output queue
    and streams annotated JPEG frames back as binary WebSocket messages.
    """
    await websocket.accept()
    logger.info("Client connected to WebSocket live stream.")
    
    try:
        while True:
            # Block until an annotated frame is available in the output queue
            result = await redis_client.blpop("frame_output_queue", timeout=1.0)
            if result:
                _, frame_id_bytes = result
                frame_id = frame_id_bytes.decode('utf-8')
                
                # Fetch annotated bytes payload and forward securely to websocket
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

@app.get("/roi/data")
async def get_roi_data(limit: int = Query(10, ge=1, le=1000), offset: int = Query(0, ge=0)):
    """
    Returns paginated JSON records of all processed ROI data from PostgreSQL.
    Supports limit and offset for client-side pagination functionality.
    """
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Query securely with parameterized bounds
            records = await conn.fetch("""
                SELECT frame_id, x, y, width, height, confidence, timestamp, face_detected
                FROM roi_records
                ORDER BY timestamp DESC
                LIMIT $1 OFFSET $2
            """, limit, offset)
            
            result = []
            for r in records:
                result.append({
                    "frame_id": str(r['frame_id']),
                    "x": r['x'],
                    "y": r['y'],
                    "width": r['width'],
                    "height": r['height'],
                    "confidence": r['confidence'],
                    "timestamp": r['timestamp'].isoformat() if r['timestamp'] else None,
                    "face_detected": r['face_detected']
                })
            return result
    except Exception as e:
        logger.error(f"Database error during ROI fetch: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching ROI data.")
