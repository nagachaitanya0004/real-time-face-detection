-- Enable pg_trgm extension for text search functionalities (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable pgcrypto for gen_random_uuid() (idempotent, needed for older PG versions)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- video_sessions table tracks each streaming session
-- Using TIMESTAMPTZ everywhere to explicitly store and handle timezones properly (UTC standard)
CREATE TABLE IF NOT EXISTS video_sessions (
    session_id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    client_ip INET,
    total_frames INT DEFAULT 0
);

-- roi_records stores per-frame ROI data
-- Using TIMESTAMPTZ for processed_at to ensure consistent timezone handling across queries
CREATE TABLE IF NOT EXISTS roi_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_sessions(session_id) ON DELETE CASCADE,
    frame_index BIGINT NOT NULL,
    bbox_x INT,
    bbox_y INT,
    bbox_width INT,
    bbox_height INT,
    -- Ensure confidence is a valid probability/percentage between 0 and 1
    confidence FLOAT CHECK(confidence >= 0 AND confidence <= 1),
    face_detected BOOLEAN NOT NULL,
    frame_width INT,
    frame_height INT,
    processed_at TIMESTAMPTZ DEFAULT now()
);

-- Constraint: when face_detected is true, bbox width and height must be > 0
-- This constraint acts as a partial validation: we only validate bbox dimensions when a face is actually detected.
-- Using a DO block to ensure idempotency when running the script multiple times.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_bbox_dimensions'
    ) THEN
        ALTER TABLE roi_records 
        ADD CONSTRAINT check_bbox_dimensions 
        CHECK (
            face_detected = FALSE OR (bbox_width > 0 AND bbox_height > 0)
        );
    END IF;
END $$;

-- Index on (session_id, frame_index) for fast chronological retrieval of specific frames in a session
CREATE INDEX IF NOT EXISTS idx_roi_session_frame ON roi_records(session_id, frame_index);

-- Index on processed_at DESC for fast time-range queries (e.g., getting the latest processed frames)
CREATE INDEX IF NOT EXISTS idx_roi_processed_at ON roi_records(processed_at DESC);

-- Index on face_detected for rapidly filtering frames that specifically have or don't have faces
CREATE INDEX IF NOT EXISTS idx_roi_face_detected ON roi_records(face_detected);

-- ==============================================================================
-- Example Queries:
-- ==============================================================================

-- 1. Get all ROIs for a session ordered chronologically
-- SELECT * FROM roi_records 
-- WHERE session_id = 'your-session-uuid-here' 
-- ORDER BY frame_index ASC;

-- 2. Get average confidence per session
-- SELECT session_id, AVG(confidence) as avg_confidence 
-- FROM roi_records 
-- WHERE face_detected = TRUE 
-- GROUP BY session_id;

-- 3. Get frames where no face detected
-- SELECT session_id, frame_index, processed_at 
-- FROM roi_records 
-- WHERE face_detected = FALSE;
