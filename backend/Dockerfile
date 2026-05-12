# Stage 1: Builder - Install dependencies and pre-download models
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Pre-download MediaPipe face detection model at build time to bake into image
RUN PYTHONPATH=/install/lib/python3.11/site-packages python -c \
    "import mediapipe as mp; mp.solutions.face_detection.FaceDetection(min_detection_confidence=0.5); print('MediaPipe model cached')"

# Stage 2: Final Runtime Image
FROM python:3.11-slim

# Install runtime dependencies (libGL for MediaPipe/OpenCV, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root security
RUN useradd -u 1001 -m appuser
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY --chown=appuser:appuser . .

# CRITICAL: Explicitly remove local artifacts if they were accidentally copied
RUN rm -rf venv __pycache__ .pytest_cache *.egg-info

USER appuser
EXPOSE 8000

# Healthcheck targeting the new /health endpoint
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
