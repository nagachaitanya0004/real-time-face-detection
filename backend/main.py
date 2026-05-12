import asyncio
import logging
import os
import uuid
import json
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pythonjsonlogger import jsonlogger
import redis.asyncio as aioredis

from database import init_db, get_db_pool, close_db, validate_db_url
from face_detector import face_detection_worker
from schemas import ROIRecord

# Structured Logging Configuration
logger = logging.getLogger("vision_pro")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s %(request_id)s %(endpoint)s %(processing_time_ms)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.propagate = False

MAX_FRAME_SIZE = 5 * 1024 * 1024 # 5MB limit
REDIS_RATE_LIMIT_FPS = 30

redis_client: Optional[aioredis.Redis] = None
worker_task: Optional[asyncio.Task] = None

async def check_rate_limit(client_ip: str):
    """Implements a sliding window rate limiter in Redis."""
    if not redis_client:
        return
    key = f"rate_limit:{client_ip}"
    now = time.time()
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.zremrangebyscore(key, 0, now - 1)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, 2)
        results = await pipe.execute()
    
    if results[2] > REDIS_RATE_LIMIT_FPS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 30 FPS.")

def validate_image_magic_bytes(content: bytes):
    """Sniffs magic bytes to ensure the payload is actually a JPEG."""
    if not content.startswith(b"\xff\xd8\xff"):
        raise HTTPException(status_code=400, detail="Invalid image format. Content must be a valid JPEG.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, worker_task
    
    dsn = os.getenv("DATABASE_URL", "")
    validate_db_url(dsn) # Security check for plain-text external connections
    
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

# CORS Security: Restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Custom Security Headers & Request ID Middleware
@app.middleware("http")
async def security_and_tracing_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Add security headers
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Structured log of the request
    logger.info("request_processed", extra={
        "request_id": request_id,
        "endpoint": request.url.path,
        "method": request.method,
        "processing_time_ms": round(process_time, 2),
        "status_code": response.status_code
    })
    
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/stream/upload")
async def upload_frame(
    request: Request,
    file: UploadFile = File(...),
    session_id: uuid.UUID = Form(...),
    frame_index: int = Form(...)
):
    # 1. Rate Limiting
    await check_rate_limit(request.client.host if request.client else "unknown")
    
    # 2. Size Validation
    if file.size and file.size > MAX_FRAME_SIZE:
        raise HTTPException(status_code=413, detail="Frame size exceeds 5MB limit.")
        
    frame_bytes = await file.read()
    
    # 3. MIME Sniffing / Magic Byte Validation
    validate_image_magic_bytes(frame_bytes)
    
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
        
    return {"frame_id": frame_id, "status": "queued"}

@app.websocket("/stream/live")
async def stream_live(websocket: WebSocket):
    # WebSocket Origin Validation
    origin = websocket.headers.get("origin")
    allowed_origins = os.getenv("CORS_ORIGINS", "").split(",")
    if origin and allowed_origins and origin not in allowed_origins:
        logger.warning("websocket_origin_rejected", extra={"origin": origin})
        await websocket.close(code=4003)
        return

    await websocket.accept()
    logger.info("websocket_client_connected")
    
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
        logger.info("websocket_client_disconnected")
    except Exception as e:
        logger.error("websocket_error", extra={"error": str(e)})
    finally:
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()
        await pubsub.unsubscribe("frame_broadcast")

@app.get("/roi/data", response_model=list[ROIRecord])
async def get_roi_data(limit: int = Query(10, ge=1, le=1000), offset: int = Query(0, ge=0)):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Audit: Parameterized query ($1, $2) prevents SQL injection
            records = await conn.fetch("""
                SELECT id, session_id, frame_index, bbox_x, bbox_y, bbox_width, bbox_height, confidence, face_detected, frame_width, frame_height, processed_at
                FROM roi_records
                ORDER BY processed_at DESC
                LIMIT $1 OFFSET $2
            """, limit, offset)
            
            return [dict(r) for r in records]
    except Exception as e:
        logger.error("db_fetch_error", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail="Database connection error.")
