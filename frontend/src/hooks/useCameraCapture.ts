/**
 * Purpose: Custom hook for capturing frames from the webcam and streaming to the backend.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Handles camera initialization and periodic frame capture.
 * @param fps Target frames per second for capture.
 * @param sessionId Current session UUID.
 * @param apiUrl Backend endpoint for frame upload.
 * @returns Object with streaming state, errors, and start/stop controls.
 */
export const useCameraCapture = (fps: number, sessionId: string | null, apiUrl: string) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIndex = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      setError('Camera permission denied or not found.');
      setIsStreaming(false);
    }
  };

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !sessionId) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, 640, 480);
    
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('session_id', sessionId);
      formData.append('frame_index', frameIndex.current.toString());

      try {
        await fetch(`${apiUrl}/stream/upload`, {
          method: 'POST',
          body: formData,
        });
        frameIndex.current += 1;
      } catch (err) {
        console.error('Upload failed', err);
      }
    }, 'image/jpeg', 0.8);
  }, [sessionId, apiUrl]);

  const toggleStreaming = () => {
    if (isStreaming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsStreaming(false);
    } else {
      setIsStreaming(true);
      frameIndex.current = 0;
      intervalRef.current = window.setInterval(captureFrame, 1000 / fps);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { videoRef, canvasRef, isStreaming, toggleStreaming, error };
};
