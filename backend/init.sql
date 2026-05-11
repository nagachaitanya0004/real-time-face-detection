-- Enable the pg_trgm extension for potential text search needs (e.g., if we ever add text logs or IP string searching).
-- We use IF NOT EXISTS to ensure idempotency.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- The video_sessions table tracks individual streaming sessions.
-- session_id is a UUID to prevent predictable IDs and support distributed clients.
-- started_at is TIMESTAMPTZ to properly handle global timezone offsets.
-- ended_at is nullable as it is only populated when a session closes gracefully.
-- client_ip uses the INET type which natively validates and indexes IP addresses.
CREATE TABLE IF NOT EXISTS video_sessions (
    session_id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    client_ip INET,
    total_frames INT DEFAULT 0
);

-- The roi_records table tracks frame-by-frame Region of Interest (ROI) data.
-- id uses gen_random_uuid() as a decentralized, conflict-free primary key.
-- session_id establishes a foreign key constraint to ensure relational integrity with video_sessions.
-- frame_index uses BIGINT to support long-running continuous streams without integer overflow.
-- confidence constraint ensures the model's score is always cleanly bounded between 0.0 and 1.0.
-- processed_at uses TIMESTAMPTZ for absolute global ordering of when the frame was actually analyzed.
CREATE TABLE IF NOT EXISTS roi_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_sessions(session_id) ON DELETE CASCADE,
    frame_index BIGINT NOT NULL,
    bbox_x INT,
    bbox_y INT,
    bbox_width INT,
    bbox_height INT,
    confidence FLOAT CHECK(confidence >= 0 AND confidence <= 1),
    face_detected BOOLEAN NOT NULL,
    frame_width INT,
    frame_height INT,
    processed_at TIMESTAMPTZ DEFAULT now()
);

-- Constraint: If a face is detected, the bounding box dimensions must be strictly positive.
-- By using a boolean implication (NOT A OR B), we ensure the dimensions are only checked if face_detected is true.
-- Using DO block safely injects the CHECK constraint without raising an error if it already exists (Idempotent).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_bbox'
    ) THEN
        ALTER TABLE roi_records ADD CONSTRAINT check_valid_bbox 
        CHECK (NOT face_detected OR (bbox_width > 0 AND bbox_height > 0));
    END IF;
END $$;

-- Index on (session_id, frame_index) to allow extremely fast sequential lookups of a specific session's frames,
-- which is heavily used for timeline playback and time-series clustering.
CREATE INDEX IF NOT EXISTS idx_roi_session_frame ON roi_records (session_id, frame_index);

-- Index on processed_at DESC. Since time-range queries (e.g. "last 5 minutes") usually ask for recent data first,
-- the descending order directly optimizes for standard chronological pagination.
CREATE INDEX IF NOT EXISTS idx_roi_processed_at_desc ON roi_records (processed_at DESC);

-- Index on face_detected to heavily optimize queries that only want frames where a face was actually found.
-- In a sparse environment (faces rarely seen), this allows the optimizer to skip vast amounts of empty frames.
CREATE INDEX IF NOT EXISTS idx_roi_face_detected ON roi_records (face_detected);
