# Purpose: Multi-stage Dockerfile for the FastAPI backend with non-root security and health checks.

# Stage 1: Builder - Install dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build essentials for potential C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final Runner - Production image
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies for MediaPipe/OpenCV and health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy only the installed packages from builder to keep image slim
COPY --from=builder /install /usr/local

# Create a non-root user (UID 1001) for enhanced security
RUN useradd -m -u 1001 appuser
USER 1001

# Copy application code with correct ownership
COPY --chown=appuser:appuser . .

# Expose the FastAPI port
EXPOSE 8000

# Production-ready health check using native python to avoid extra dependencies
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Command to launch the application with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
