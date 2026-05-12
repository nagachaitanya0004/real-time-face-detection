# Purpose: Multi-stage Dockerfile for the frontend SPA (React/Vite) served by Nginx.

# Stage 1: Build - Compile the static assets
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies using 'npm ci' for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy source and build (assumes 'dist' is the output directory)
COPY . .
RUN npm run build

# Stage 2: Serve - Nginx alpine for a lightweight production server
FROM nginx:alpine

# Copy custom nginx configuration for API/WS proxying and security
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to nginx's serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check for Nginx using wget (available in alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
