import asyncio
import io
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Tuple
from uuid import UUID
from datetime import datetime, timezone

import redis.asyncio as aioredis
from PIL import Image, ImageDraw
import mediapipe as mp
import numpy as np

from database import get_db_pool

# Configure logger
logger = logging.getLogger(__name__)

# Executor for CPU-bound MediaPipe tasks
executor = ThreadPoolExecutor(max_workers=4)

def process_frame_with_mediapipe(image_bytes: bytes) -> Tuple[bytes, Optional[dict]]:
    """
    Process an image with MediaPipe Face Detection, draw a bounding box using PIL,
    and return the annotated image bytes along with ROI metadata. No OpenCV is used.
    
    Args:
        image_bytes (bytes): The raw JPEG image bytes.
        
    Returns:
        Tuple[bytes, Optional[dict]]: Annotated JPEG bytes and ROI dictionary (or None if no face).
    """
    try:
        # Load image via Pillow
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to open image: {e}")
        return image_bytes, None

    width, height = image.size
    
    # Initialize MediaPipe face detection
    with mp.solutions.face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    ) as face_detection:
        # Convert PIL image to numpy array for MediaPipe
        image_np = np.array(image)
        results = face_detection.process(image_np)
        
        roi_data = None
        if results.detections:
            # Take the first detected face for ROI
            detection = results.detections[0]
            bboxC = detection.location_data.relative_bounding_box
            
            # Compute absolute pixel coordinates for the axis-aligned minimal bounding box
            min_x = int(bboxC.xmin * width)
            min_y = int(bboxC.ymin * height)
            box_width = int(bboxC.width * width)
            box_height = int(bboxC.height * height)
            max_x = min_x + box_width
            max_y = min_y + box_height
            
            confidence = float(detection.score[0])
            
            # Draw axis-aligned bounding box with PIL (strictly no cv2)
            draw = ImageDraw.Draw(image)
            draw.rectangle([min_x, min_y, max_x, max_y], outline="red", width=3)
            
            roi_data = {
                "x": float(min_x),
                "y": float(min_y),
                "width": float(box_width),
                "height": float(box_height),
                "confidence": confidence
            }
            
        # Serialize the annotated image back to JPEG bytes
        out_io = io.BytesIO()
        image.save(out_io, format="JPEG")
        annotated_bytes = out_io.getvalue()
        
        return annotated_bytes, roi_data

async def face_detection_worker(redis_client: aioredis.Redis) -> None:
    """
    Background asyncio worker that continuously pulls raw frames from Redis,
    processes them via MediaPipe in a thread pool, saves ROI metadata to PostgreSQL,
    and pushes the annotated frames back to the output queue.
    
    Args:
        redis_client (aioredis.Redis): The connected Redis client instance.
    """
    logger.info("Face detection worker started.")
    loop = asyncio.get_running_loop()
    
    while True:
        try:
            # Block and wait for a frame in the input queue
            result = await redis_client.blpop("frame_input_queue", timeout=1.0)
            if not result:
                continue
                
            _, payload_bytes = result
            payload = json.loads(payload_bytes.decode('utf-8'))
            frame_id = payload['frame_id']
            
            # Fetch the raw image bytes associated with the queued frame
            raw_image_bytes = await redis_client.get(f"raw_frame:{frame_id}")
            if not raw_image_bytes:
                logger.warning(f"Raw frame {frame_id} not found in Redis. Dropping.")
                continue
                
            # Process CPU-bound detection in executor to avoid blocking the event loop
            annotated_bytes, roi_data = await loop.run_in_executor(
                executor, process_frame_with_mediapipe, raw_image_bytes
            )
            
            # Cleanup raw frame from Redis
            await redis_client.delete(f"raw_frame:{frame_id}")
            
            # Push annotated frame to output queue for the WebSocket stream
            await redis_client.setex(f"annotated_frame:{frame_id}", 60, annotated_bytes)
            await redis_client.rpush("frame_output_queue", frame_id)
            
            # Store ROI metadata to database using parameterized queries
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                timestamp = datetime.now(timezone.utc)
                if roi_data:
                    await conn.execute("""
                        INSERT INTO roi_records (frame_id, x, y, width, height, confidence, timestamp, face_detected)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """, UUID(frame_id), roi_data['x'], roi_data['y'], roi_data['width'], 
                       roi_data['height'], roi_data['confidence'], timestamp, True)
                else:
                    # Log negative detection with explicit NULL boundaries
                    await conn.execute("""
                        INSERT INTO roi_records (frame_id, x, y, width, height, confidence, timestamp, face_detected)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """, UUID(frame_id), None, None, None, None, None, timestamp, False)
                    
        except asyncio.CancelledError:
            logger.info("Face detection worker cancelled gracefully.")
            break
        except Exception as e:
            logger.error(f"Error in face detection worker: {e}", exc_info=True)
            await asyncio.sleep(1)
