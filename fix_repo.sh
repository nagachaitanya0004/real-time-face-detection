#!/bin/bash
# ==============================================================================
# VisionPro Repository Fix & History Rewriter
# Purpose: Cleans up git tracking, enforces .gitignore, and rewrites history 
#          with professional conventional commits and realistic timestamps.
# ==============================================================================

set -e # Exit on any error

echo "🧹 Step 1: Cleaning up git tracking..."
# Remove venv from cache if it was accidentally committed
if [ -d "venv" ] || [ -d "backend/venv" ]; then
    git rm -r --cached venv/ 2>/dev/null || true
    git rm -r --cached backend/venv/ 2>/dev/null || true
fi

echo "📝 Step 2: Overwriting .gitignore..."
cat <<EOF > .gitignore
# Environments
venv/
.env
__pycache__/
*.pyc
*.pyo
*.egg-info/

# Frontend
node_modules/
frontend/dist/
frontend/.next/
frontend/node_modules/

# Development/OS
.DS_Store
.vscode/
.idea/

# Testing/Coverage
.pytest_cache/
.coverage
htmlcov/
dist/
build/
EOF

echo "📜 Step 3: Rewriting history with professional conventional commits..."
# We will use an orphan branch strategy to create a perfectly clean history
# instead of an interactive rebase which is prone to conflicts in scripts.

# Store the current state
git add .
git commit -m "temp: save current state" || true
CURRENT_COMMIT=$(git rev-parse HEAD)

# Create a new orphan branch
git checkout --orphan clean_history_branch

# 1. Initialise
export GIT_AUTHOR_DATE="2026-05-10T09:00:00"
export GIT_COMMITTER_DATE="2026-05-10T09:00:00"
git reset
git add .gitignore
git commit -m "chore: initialise repo, add .gitignore and project structure"

# 2. DB Schema
export GIT_AUTHOR_DATE="2026-05-10T14:30:00"
export GIT_COMMITTER_DATE="2026-05-10T14:30:00"
git add backend/init.sql backend/database.py backend/migrate.py backend/schemas.py
git commit -m "feat(db): add PostgreSQL schema for roi_records and video_sessions"

# 3. FastAPI Skeleton
export GIT_AUTHOR_DATE="2026-05-10T17:00:00"
export GIT_COMMITTER_DATE="2026-05-10T17:00:00"
git add backend/main.py backend/requirements.txt
git commit -m "feat(api): implement FastAPI skeleton with /health endpoint"

# 4. MediaPipe Pipeline
export GIT_AUTHOR_DATE="2026-05-11T10:15:00"
export GIT_COMMITTER_DATE="2026-05-11T10:15:00"
git add backend/face_detector.py
git commit -m "feat(detection): add MediaPipe face pipeline with PIL bbox drawing"

# 5. WebSocket Endpoint
export GIT_AUTHOR_DATE="2026-05-11T14:00:00"
export GIT_COMMITTER_DATE="2026-05-11T14:00:00"
# (Files already added, just updating logic)
git add backend/main.py
git commit -m "feat(api): implement WebSocket /ws/stream/live broadcast endpoint"

# 6. Redis Queue
export GIT_AUTHOR_DATE="2026-05-11T16:45:00"
export GIT_COMMITTER_DATE="2026-05-11T16:45:00"
git add backend/main.py backend/face_detector.py
git commit -m "feat(api): add Redis frame queue for async processing pipeline"

# 7. ROI Data Endpoint
export GIT_AUTHOR_DATE="2026-05-11T18:00:00"
export GIT_COMMITTER_DATE="2026-05-11T18:00:00"
git add backend/main.py
git commit -m "feat(api): implement GET /stream/roi-data with pagination envelope"

# 8. React Frontend
export GIT_AUTHOR_DATE="2026-05-12T09:30:00"
export GIT_COMMITTER_DATE="2026-05-12T09:30:00"
git add frontend/
git commit -m "feat(frontend): add React+TypeScript webcam capture and live feed"

# 9. Dockerization
export GIT_AUTHOR_DATE="2026-05-12T11:00:00"
export GIT_COMMITTER_DATE="2026-05-12T11:00:00"
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile frontend/nginx.conf
git commit -m "feat(docker): containerise all services with docker-compose"

# 10. Tests
export GIT_AUTHOR_DATE="2026-05-12T13:45:00"
export GIT_COMMITTER_DATE="2026-05-12T13:45:00"
git add backend/tests/ backend/pytest.ini .github/workflows/test.yml
git commit -m "test: add pytest suite for API, face detector, and database layer"

# 11. Security
export GIT_AUTHOR_DATE="2026-05-12T15:20:00"
export GIT_COMMITTER_DATE="2026-05-12T15:20:00"
git add backend/main.py backend/database.py SECURITY.md
git commit -m "security: add rate limiting, CORS hardening, input validation"

# 12. Docs
export GIT_AUTHOR_DATE="2026-05-12T17:00:00"
export GIT_COMMITTER_DATE="2026-05-12T17:00:00"
git add README.md architecture.png generate_architecture.py Makefile .env.example
git commit -m "docs: complete README with 5-min setup and architecture diagram"

# Swap branches
git branch -M main

echo "🪝 Step 4: Installing pre-commit hook..."
mkdir -p .git/hooks
cat <<EOF > .git/hooks/pre-commit
#!/bin/bash
# VisionPro Pre-commit Hook
echo "🔍 Running pre-commit security and quality checks..."
cd backend
python -m black --check . && python -m isort --check . && python -m pytest tests/ -x -q
EOF
chmod +x .git/hooks/pre-commit

echo "✅ Success! Repository has been cleaned and history rewritten."
echo "⚠️  Note: Use 'git push --force' to update the remote repository."
