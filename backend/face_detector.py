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
import mediapipe as mp  # type: ignore
import numpy as np

from database import get_db_pool

logger = logging.getLogger(__name__)
executor = ThreadPoolExecutor(max_workers=4)

# ISSUE 4: Cache MediaPipe model on module import for faster startup and to ensure model availability.
try:
    _warmup_detection = mp.solutions.face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    )
    logger.info("MediaPipe FaceDetection model pre-cached successfully.")
except Exception as e:
    logger.error(f"FAILED to pre-cache MediaPipe model: {e}")

def compute_axis_aligned_bbox(points: list[tuple[int, int]]) -> tuple[int, int, int, int]:
    """
    Computes a bounding box (x, y, width, height) from a set of points.
    Used for coordinate normalization and testing.
    """
    if not points:
        return (0, 0, 0, 0)
    min_x = min(p[0] for p in points)
    max_x = max(p[0] for p in points)
    min_y = min(p[1] for p in points)
    max_y = max(p[1] for p in points)
    return (min_x, min_y, max_x - min_x, max_y - min_y)

def process_frame_with_mediapipe(image_bytes: bytes) -> Tuple[bytes, Optional[dict], int, int]:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to open image: {e}")
        return image_bytes, None, 0, 0

    width, height = image.size
    
    with mp.solutions.face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    ) as face_detection:
        image_np = np.array(image)
        results = face_detection.process(image_np)
        
        roi_data = None
        if results.detections:
            detection = results.detections[0]
            bboxC = detection.location_data.relative_bounding_box
            
            min_x = int(bboxC.xmin * width)
            min_y = int(bboxC.ymin * height)
            box_width = int(bboxC.width * width)
            box_height = int(bboxC.height * height)
            max_x = min_x + box_width
            max_y = min_y + box_height
            
            confidence = float(detection.score[0])
            
            draw = ImageDraw.Draw(image)
            draw.rectangle([min_x, min_y, max_x, max_y], outline="red", width=3)
            
            roi_data = {
                "x": min_x,
                "y": min_y,
                "width": box_width,
                "height": box_height,
                "confidence": confidence
            }
            
        out_io = io.BytesIO()
        image.save(out_io, format="JPEG")
        annotated_bytes = out_io.getvalue()
        
        return annotated_bytes, roi_data, width, height

async def face_detection_worker(redis_client: aioredis.Redis) -> None:
    logger.info("Face detection worker started.")
    loop = asyncio.get_running_loop()
    
    with mp.solutions.face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    ) as face_detection:
        
        while True:
            try:
                result = await redis_client.blpop("frame_input_queue", timeout=1.0)  # type: ignore
                if not result:
                    continue
                    
                _, payload_bytes = result
                payload = json.loads(payload_bytes.decode('utf-8'))
                frame_id = payload['frame_id']
                session_id = payload.get('session_id')
                frame_index = payload.get('frame_index', 0)
                
                raw_image_bytes = await redis_client.get(f"raw_frame:{frame_id}")
                if not raw_image_bytes:
                    logger.warning(f"Raw frame {frame_id} not found in Redis. Dropping.")
                    continue
                    
                def process():
                    try:
                        image = Image.open(io.BytesIO(raw_image_bytes)).convert("RGB")
                        width, height = image.size
                        image_np = np.array(image)
                        results = face_detection.process(image_np)
                        
                        roi_data = None
                        if results.detections:
                            detection = results.detections[0]
                            bboxC = detection.location_data.relative_bounding_box
                            
                            min_x = int(bboxC.xmin * width)
                            min_y = int(bboxC.ymin * height)
                            box_width = int(bboxC.width * width)
                            box_height = int(bboxC.height * height)
                            max_x = min_x + box_width
                            max_y = min_y + box_height
                            
                            confidence = float(detection.score[0])
                            
                            draw = ImageDraw.Draw(image)
                            draw.rectangle([min_x, min_y, max_x, max_y], outline="red", width=3)
                            
                            roi_data = {
                                "x": min_x,
                                "y": min_y,
                                "width": box_width,
                                "height": box_height,
                                "confidence": confidence
                            }
                            
                        out_io = io.BytesIO()
                        image.save(out_io, format="JPEG")
                        return out_io.getvalue(), roi_data, width, height
                    except Exception as e:
                        logger.error(f"Frame processing error: {e}")
                        return raw_image_bytes, None, 0, 0

                annotated_bytes, roi_data, frame_width, frame_height = await loop.run_in_executor(
                    executor, process
                )
                
                await redis_client.delete(f"raw_frame:{frame_id}")
                await redis_client.setex(f"annotated_frame:{frame_id}", 30, annotated_bytes)
                await redis_client.publish("frame_broadcast", frame_id)
                
                pool = await get_db_pool()
                async with pool.acquire() as conn:
                    timestamp = datetime.now(timezone.utc)
                    
                    await conn.execute("""
                        INSERT INTO video_sessions (session_id, started_at) 
                        VALUES ($1, $2) ON CONFLICT DO NOTHING
                    """, UUID(session_id), timestamp)
                    
                    await conn.execute("""
                        UPDATE video_sessions SET total_frames = total_frames + 1 WHERE session_id = $1
                    """, UUID(session_id))
                    
                    if roi_data:
                        await conn.execute("""
                            INSERT INTO roi_records 
                            (session_id, frame_index, bbox_x, bbox_y, bbox_width, bbox_height, confidence, face_detected, frame_width, frame_height, processed_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        """, UUID(session_id), frame_index, roi_data['x'], roi_data['y'], roi_data['width'], 
                           roi_data['height'], roi_data['confidence'], True, frame_width, frame_height, timestamp)
                    else:
                        await conn.execute("""
                            INSERT INTO roi_records 
                            (session_id, frame_index, bbox_x, bbox_y, bbox_width, bbox_height, confidence, face_detected, frame_width, frame_height, processed_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        """, UUID(session_id), frame_index, None, None, None, None, None, False, frame_width, frame_height, timestamp)
                        
            except asyncio.CancelledError:
                logger.info("Face detection worker cancelled gracefully.")
                break
            except Exception as e:
                logger.error(f"Error in face detection worker: {e}", exc_info=True)
                await asyncio.sleep(1)
