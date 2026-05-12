/**
 * Purpose: Main application component orchestrating the streaming system.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from './hooks/useWebSocket';
import { useCameraCapture } from './hooks/useCameraCapture';
import { useROIData } from './hooks/useROIData';
import { StatsBar } from './components/StatsBar';
import { LiveFeed } from './components/LiveFeed';
import { ROIPanel } from './components/ROIPanel';
import { Controls } from './components/Controls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StreamStats } from './types';
import { Layout } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.host}/ws`;

const App: React.FC = () => {
  const [sessionId] = useState(() => uuidv4());
  const [fpsCounter, setFpsCounter] = useState(0);
  const lastFrameTime = React.useRef(performance.now());

  const { status, lastFrame } = useWebSocket(`${WS_BASE}/stream/live`);
  const { videoRef, canvasRef, isStreaming, toggleStreaming, error: cameraError } = useCameraCapture(15, sessionId, API_BASE);
  const roiData = useROIData(API_BASE, 2000);

  // FPS calculation for display
  useEffect(() => {
    if (!lastFrame) return;
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;
    setFpsCounter(1000 / delta);
  }, [lastFrame]);

  // Derive stats from ROI data
  const stats = useMemo((): StreamStats => {
    const totalProcessed = roiData.length;
    const facesDetected = roiData.filter(r => r.face_detected).length;
    const avgConfidence = totalProcessed > 0 
      ? roiData.reduce((acc, r) => acc + (r.confidence || 0), 0) / totalProcessed 
      : 0;
    
    return {
      totalProcessed,
      facesDetected,
      averageConfidence: avgConfidence,
      startTime: isStreaming ? performance.now() : null
    };
  }, [roiData, isStreaming]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <header className="max-w-7xl mx-auto flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
          <Layout className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">VISION<span className="text-blue-500 text-sm align-top ml-1 italic font-light">PRO</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-1">Real-Time ROI Detection Pipeline</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <ErrorBoundary>
          <StatsBar stats={stats} />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              <Controls 
                isStreaming={isStreaming} 
                onToggle={toggleStreaming} 
                status={status} 
                fps={fpsCounter}
              />
            </ErrorBoundary>

            {cameraError && (
              <div className="p-4 bg-red-900/40 border border-red-800 rounded-lg text-red-200 text-sm font-medium animate-pulse">
                ⚠️ {cameraError}
              </div>
            )}

            <div className="relative group">
              <ErrorBoundary>
                <LiveFeed lastFrame={lastFrame} />
              </ErrorBoundary>
              
              {/* Hidden elements required for capture */}
              <video ref={videoRef} className="hidden" />
              <canvas ref={canvasRef} className="hidden" width={640} height={480} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ROIPanel records={roiData} />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>v1.0.0 Production Build</span>
        <span>Secure Stream Protocol Enabled</span>
      </footer>
    </div>
  );
};

export default App;
