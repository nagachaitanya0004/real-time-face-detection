import React from 'react';

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ videoRef, canvasRef }) => {
  return (
    <div className="hidden">
      <video ref={videoRef} width={640} height={480} muted />
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
};
