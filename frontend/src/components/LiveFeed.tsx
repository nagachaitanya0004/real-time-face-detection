/**
 * Purpose: Component for displaying the processed live video feed from WebSocket.
 */

import React, { useEffect, useRef } from 'react';

interface LiveFeedProps {
  lastFrame: Blob | null;
}

/**
 * Renders the latest annotated frame from the WebSocket onto a canvas.
 * @param props Contains the latest frame Blob.
 */
export const LiveFeed: React.FC<LiveFeedProps> = ({ lastFrame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!lastFrame || !canvasRef.current) return;

    const render = async () => {
      const bitmap = await createImageBitmap(lastFrame);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 640, 480);
        ctx.drawImage(bitmap, 0, 0, 640, 480);
      }
    };

    render();
  }, [lastFrame]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl border border-slate-700">
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Annotated Feed</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-medium">REAL-TIME</span>
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className="w-full h-auto bg-black"
      />
    </div>
  );
};
