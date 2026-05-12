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
  processed_at: string;
}

export interface ROIPaginatedResponse {
  items: ROIRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface StreamStats {
  totalProcessed: number;
  facesDetected: number;
  averageConfidence: number;
  sessionDurationSeconds: number;
}
