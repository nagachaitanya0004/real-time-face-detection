import asyncio
import logging
import os
import uuid
import json
import time
from contextlib import asynccontextmanager
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pythonjsonlogger import jsonlogger
import redis.asyncio as aioredis

# ISSUE 6: Import SlowAPI for rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import init_db, get_db_pool, close_db, validate_db_url
from face_detector import face_detection_worker
from schemas import ROIRecord, ROIPaginatedResponse

# ISSUE 6: Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

# Structured Logging Configuration
logger = logging.getLogger("vision_pro")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s %(request_id)s %(endpoint)s %(processing_time_ms)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.propagate = False

MAX_FRAME_SIZE = 5 * 1024 * 1024 

redis_client: Optional[aioredis.Redis] = None
worker_task: Optional[asyncio.Task] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, worker_task
    dsn = os.getenv("DATABASE_URL", "")
    validate_db_url(dsn)
    await init_db(dsn)
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = aioredis.from_url(redis_url)
    worker_task = asyncio.create_task(face_detection_worker(redis_client))
    logger.info("application_startup_completed")
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
    logger.info("application_shutdown_completed")

app = FastAPI(title="Real-Time Face Detection Video Streaming", lifespan=lifespan)

# ISSUE 6: Attach limiter to app state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ISSUE 5: Dynamic CORS configuration from environment variables with safe defaults.
origins_raw = os.getenv("CORS_ORIGINS", "http://localhost,http://localhost:3000")
allowed_origins = [o.strip() for o in origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ISSUE 1: Using APIRouter to support both / and /api prefixes seamlessly.
router = APIRouter()

# ISSUE 2: Standard health check with ISO timestamp for monitoring systems.
@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# ISSUE 6 & 7: Added rate limiting and optional session_id with auto-generation logic.
@router.post("/stream/upload")
@limiter.limit("30/minute")
async def upload_frame(
    request: Request,
    file: UploadFile = File(...),
    session_id: Optional[uuid.UUID] = Form(None),
    frame_index: int = Form(...)
):
    # ISSUE 7: Generate session_id if none provided by the client.
    if session_id is None:
        session_id = uuid.uuid4()
        
    if file.size and file.size > MAX_FRAME_SIZE:
        raise HTTPException(status_code=413, detail="Frame size exceeds 5MB limit.")
        
    frame_bytes = await file.read()
    
    if not frame_bytes.startswith(b"\xff\xd8\xff"):
        raise HTTPException(status_code=400, detail="Invalid image format. Must be JPEG.")
    
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
        logger.error("redis_upload_error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Internal server error.")
        
    return {"frame_id": frame_id, "session_id": session_id, "status": "queued"}

@router.websocket("/ws/stream/live")
async def stream_live(websocket: WebSocket):
    origin = websocket.headers.get("origin")
    if origin and allowed_origins and origin not in allowed_origins:
        await websocket.close(code=4003)
        return

    await websocket.accept()
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("frame_broadcast")
    try:
        async for message in pubsub.listen():
            if message['type'] == 'message':
                frame_id = message['data'].decode('utf-8')
                annotated_bytes = await redis_client.get(f"annotated_frame:{frame_id}")
                if annotated_bytes:
                    await websocket.send_bytes(annotated_bytes)
    except WebSocketDisconnect:
        pass
    finally:
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()
        await pubsub.unsubscribe("frame_broadcast")

# ISSUE 3: Updated to return a structured ROIPaginatedResponse instead of a bare list.
@router.get("/stream/roi-data", response_model=ROIPaginatedResponse)
async def get_roi_data(limit: int = Query(10, ge=1, le=1000), offset: int = Query(0, ge=0)):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Get items
            records = await conn.fetch("""
                SELECT id, session_id, frame_index, bbox_x, bbox_y, bbox_width, bbox_height, confidence, face_detected, frame_width, frame_height, processed_at
                FROM roi_records
                ORDER BY processed_at DESC
                LIMIT $1 OFFSET $2
            """, limit, offset)
            
            # Get total count for pagination metadata
            total = await conn.fetchval("SELECT COUNT(*) FROM roi_records")
            
            return {
                "items": [dict(r) for r in records],
                "total": total,
                "limit": limit,
                "offset": offset
            }
    except Exception as e:
        logger.error("db_fetch_error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Database connection error.")

# ISSUE 1: Mount the same router at both root and /api to support all proxy configurations.
app.include_router(router, prefix="")
app.include_router(router, prefix="/api")

# Custom Security Headers Middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
