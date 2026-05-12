# Purpose: Development and maintenance utility for the Dockerized application.

.PHONY: build up down logs test shell-backend clean

# Build all service images
build:
	docker-compose build

# Start services in background
up:
	docker-compose up -d

# Stop and remove all containers
down:
	docker-compose down

# Follow logs from all services
logs:
	docker-compose logs -f

# Run backend tests (assumes pytest is installed in image)
test:
	docker-compose exec backend pytest

# Open an interactive shell inside the backend container
shell-backend:
	docker-compose exec backend /bin/bash

# Remove volumes and orphan containers
clean:
	docker-compose down -v --remove-orphans
