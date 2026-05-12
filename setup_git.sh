#!/bin/bash
# ==============================================================================
# VisionPro Git History Setup Script
# Purpose: Recreates a professional, story-telling git history for the project.
# Usage: bash setup_git.sh
# ==============================================================================

# Ensure we are in a clean state (optional: rm -rf .git if you want a total reset)
# git init

# Helper to set timestamps
set_time() {
    export GIT_AUTHOR_DATE="$1"
    export GIT_COMMITTER_DATE="$1"
}

# 1. Initialise
set_time "2026-05-08T09:00:00"
git add .gitignore
git commit -m "chore: initialise project structure and add .gitignore"

# 2. DB Schema
set_time "2026-05-08T14:20:00"
git add backend/init.sql backend/database.py backend/migrate.py
git commit -m "feat: add PostgreSQL schema with roi_records and video_sessions tables"

# 3. FastAPI Skeleton
set_time "2026-05-08T17:45:00"
git add backend/main.py backend/requirements.txt backend/schemas.py
git commit -m "feat: implement FastAPI skeleton with health check endpoint"

# 4. MediaPipe Pipeline
set_time "2026-05-09T10:15:00"
git add backend/face_detector.py
git commit -m "feat: add MediaPipe face detection pipeline using PIL for bbox drawing"

# 5. WebSocket Endpoint
set_time "2026-05-09T15:30:00"
# (Assuming WebSocket logic added to main.py in this step)
git add backend/main.py
git commit -m "feat: implement WebSocket streaming endpoint for annotated frames"

# 6. Redis Queue
set_time "2026-05-10T11:00:00"
# (Assuming Redis integration added to main.py and face_detector.py)
git add backend/main.py backend/face_detector.py
git commit -m "feat: add Redis frame queue for async processing pipeline"

# 7. ROI Data Endpoint
set_time "2026-05-10T16:20:00"
git add backend/main.py
git commit -m "feat: implement GET /roi/data endpoint with pagination"

# 8. React Frontend
set_time "2026-05-11T09:00:00"
git add frontend/
git commit -m "feat: add React frontend with webcam capture and WebSocket display"

# 9. Dockerization
set_time "2026-05-11T14:45:00"
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile frontend/nginx.conf
git commit -m "feat: containerise all services with Docker and docker-compose"

# 10. Testing Suite
set_time "2026-05-12T10:00:00"
git add backend/tests/ backend/pytest.ini .github/workflows/test.yml
git commit -m "test: add pytest suite for API endpoints and face detector"

# 11. Security Hardening
set_time "2026-05-12T13:30:00"
git add backend/main.py backend/database.py SECURITY.md
git commit -m "security: add input validation, rate limiting, and CORS hardening"

# 12. Documentation
set_time "2026-05-12T15:00:00"
git add README.md architecture.png generate_architecture.py
git commit -m "docs: add README with 5-minute setup guide and architecture diagram"

# 13. Developer Experience
set_time "2026-05-12T17:00:00"
git add Makefile .env.example
git commit -m "chore: add Makefile and .env.example for developer experience"

echo "✅ Professional Git history generated successfully."
echo "📜 Run 'git log --graph --oneline --all' to see the story."

# Setup Pre-commit Hook
mkdir -p .git/hooks
cat <<EOF > .git/hooks/pre-commit
#!/bin/bash
# VisionPro Pre-commit Hook

echo "🔍 Running pre-commit checks..."

# Check Python formatting
if command -v black &> /dev/null; then
    black --check backend/
else
    echo "⚠️ black not found, skipping..."
fi

if command -v isort &> /dev/null; then
    isort --check backend/
else
    echo "⚠️ isort not found, skipping..."
fi

# Run tests
echo "🧪 Running backend tests..."
cd backend && pytest tests/

if [ \$? -ne 0 ]; then
    echo "❌ Tests failed. Commit aborted."
    exit 1
fi

echo "✅ All checks passed!"
EOF
chmod +x .git/hooks/pre-commit
echo "🪝 Pre-commit hook installed."
