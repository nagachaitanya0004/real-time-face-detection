# Security Policy: VisionPro

VisionPro is designed with a defense-in-depth approach to protect the real-time face detection pipeline. This document outlines our security model and policies.

## 🛡️ Security Model

### 1. Input Validation & Filtering
- **Content Sniffing**: All uploaded frames undergo binary header validation to ensure they are legitimate JPEGs (Magic Bytes: `FF D8 FF`), preventing polyglot file attacks.
- **Size Enforcement**: Rigid 5MB hard limit on frame uploads at the application layer.
- **Sanitization**: Session IDs and frame indices are strictly typed as UUIDs and Integers via Pydantic/FastAPI, preventing injection into logs or internal logic.

### 2. Infrastructure Security (Docker)
- **Non-Root Execution**: All containers run with non-root user IDs (UID 1001 for app, 70 for DB).
- **Read-Only Filesystem**: The backend container filesystem is mounted as read-only. We use a dedicated `tmpfs` mount for `/tmp` to prevent persistent malware installation.
- **Privilege Escalation**: `no-new-privileges` is enforced via Docker security options to prevent binary exploits.
- **Network Isolation**: Only the Nginx frontend is exposed. All other services (API, DB, Redis) communicate over an internal, isolated bridge network.

### 3. Database & SQL Safety
- **Least Privilege**: The application uses a dedicated DB user. DDL operations (DROP, ALTER) are restricted outside of the migration phase.
- **Zero Interpolation**: 100% of SQL queries are parameterized using `asyncpg` positional arguments (`$1`, `$2`). No raw string formatting is allowed.
- **SSL Enforcement**: The system automatically refuses to connect to external database URLs unless SSL is enabled (`sslmode=require`).

### 4. API & Real-Time Security
- **CORS Policies**: Restricted to the explicit origins defined in `CORS_ORIGINS`.
- **Security Headers**: Standard headers are injected into every response:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
- **WebSocket Origin Check**: WebSockets validate the `Origin` header before accepting an upgrade.
- **Rate Limiting**: sliding window rate limiting (30 FPS) is enforced per IP using Redis to prevent DoS attacks.

### 5. Observability & Tracing
- **Request Tracing**: All requests are assigned a unique `X-Request-ID`.
- **Structured Logging**: Logs are emitted in JSON format for secure ingestion into SIEM tools.
- **Data Privacy**: Raw frame bytes and PII (User IPs) are stripped from logs in production mode.

## 🚀 Deployment Recommendations
- Always deploy behind a TLS-terminating load balancer (HTTPS).
- Rotate `POSTGRES_PASSWORD` and `SECRET_KEY` regularly.
- Keep the internal Docker network private and do not expose Redis or Postgres ports to the host.
