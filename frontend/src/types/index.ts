/**
 * Purpose: Centralized TypeScript interfaces for the application.
 */

export interface ROIRecord {
  id: string;
  session_id: string;
  frame_index: number;
  bbox_x: number | null;
  bbox_y: number | null;
  bbox_width: number | null;
  bbox_height: number | null;
  confidence: number | null;
  face_detected: boolean;
  frame_width: number | null;
  frame_height: number | null;
  processed_at: string;
}

export interface VideoSession {
  session_id: string;
  started_at: string;
  ended_at: string | null;
  client_ip: string | null;
  total_frames: number;
}

export interface StreamStats {
  totalProcessed: number;
  facesDetected: number;
  averageConfidence: number;
  startTime: number | null;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';
