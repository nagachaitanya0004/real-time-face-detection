import React, { useEffect, useRef } from 'react';

interface VideoFeedProps {
  lastFrame: Blob | null;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ lastFrame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!lastFrame || !canvasRef.current) return;

    const renderFrame = async () => {
      const bitmap = await createImageBitmap(lastFrame);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 640, 480);
        ctx.drawImage(bitmap, 0, 0, 640, 480);
      }
    };

    renderFrame();
  }, [lastFrame]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className="w-full h-auto bg-black block"
      />
    </div>
  );
};
