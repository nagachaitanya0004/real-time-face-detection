import { useState, useEffect, useRef, useCallback } from 'react';

export const useCameraCapture = (fps: number, sessionId: string, apiUrl: string) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIndexCounter = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      setError('Webcam access denied. Please allow camera permissions.');
      setIsStreaming(false);
    }
  };

  const captureAndUpload = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('session_id', sessionId);
      formData.append('frame_index', frameIndexCounter.current.toString());

      try {
        await fetch(`${apiUrl}/stream/upload`, {
          method: 'POST',
          body: formData,
        });
        frameIndexCounter.current += 1;
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }, 'image/jpeg', 0.7);
  }, [isStreaming, sessionId, apiUrl]);

  const toggleStreaming = () => {
    setIsStreaming((prev) => !prev);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = window.setInterval(captureAndUpload, 1000 / fps);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isStreaming, fps, captureAndUpload]);

  return { videoRef, canvasRef, isStreaming, toggleStreaming, error };
};
