import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, CameraOff, Layout, Terminal } from 'lucide-react';
import { useSessionId } from './hooks/useSessionId';
import { useWebSocket } from './hooks/useWebSocket';
import { useCameraCapture } from './hooks/useCameraCapture';
import { useROIData } from './hooks/useROIData';
import { VideoFeed } from './components/VideoFeed';
import { CameraCapture } from './components/CameraCapture';
import { ROITable } from './components/ROITable';
import { StatsBar } from './components/StatsBar';
import { StatusBadge } from './components/StatusBadge';
import { ErrorBoundary } from './components/ErrorBoundary';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/stream/live';

const App: React.FC = () => {
  const sessionId = useSessionId();
  const [clientFps, setClientFps] = useState(0);
  const lastFrameTime = useRef<number>(performance.now());
  const startTime = useRef<number>(performance.now());

  const { lastFrame, readyState } = useWebSocket(WS_URL);
  const { videoRef, canvasRef, isStreaming, toggleStreaming, error: cameraError } = 
    useCameraCapture(15, sessionId, API_BASE);
  
  const roiPaginated = useROIData(API_BASE, 2000);
  const records = roiPaginated?.items || [];

  // Calculate FPS from incoming binary frames
  useEffect(() => {
    if (!lastFrame) return;
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;
    setClientFps(1000 / delta);
  }, [lastFrame]);

  // Derived Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const detected = records.filter(r => r.face_detected).length;
    const avgConf = total > 0 
      ? records.reduce((acc, r) => acc + (r.confidence || 0), 0) / total 
      : 0;
    
    return {
      total,
      detectedPercent: total > 0 ? (detected / total) * 100 : 0,
      avgConfidence: avgConf,
      sessionTime: Math.floor((performance.now() - startTime.current) / 1000)
    };
  }, [records]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto gap-8">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              VISION<span className="text-blue-500 font-light italic">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
              Session: <span className="text-slate-400 font-mono uppercase">{sessionId.slice(0, 8)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge readyState={readyState} />
          <button
            onClick={toggleStreaming}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
              isStreaming 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
            }`}
          >
            {isStreaming ? <><CameraOff size={18} /> Stop</> : <><Camera size={18} /> Start Stream</>}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative group">
            <ErrorBoundary title="Video Stream Error">
              <VideoFeed lastFrame={lastFrame} />
            </ErrorBoundary>
            
            {/* FPS Counter Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
              <Terminal size={14} className="text-blue-400" />
              <span className="text-xs font-mono font-bold text-white">
                {isStreaming ? clientFps.toFixed(1) : '0.0'} <span className="text-slate-400 uppercase text-[10px]">FPS</span>
              </span>
            </div>

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-sm rounded-xl">
                <p className="text-red-400 font-bold text-center">{cameraError}</p>
              </div>
            )}
          </div>

          <CameraCapture videoRef={videoRef} canvasRef={canvasRef} />
        </div>

        {/* Right Column: Stats & Data */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ErrorBoundary title="Statistics Error">
            <StatsBar 
              totalFrames={stats.total}
              detectedPercent={stats.detectedPercent}
              avgConfidence={stats.avgConfidence}
              sessionTime={stats.sessionTime}
            />
          </ErrorBoundary>

          <ErrorBoundary title="ROI Table Error">
            <ROITable records={records} />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="mt-auto pt-8 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>v1.2.0-STABLE</span>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-help transition-colors">Documentation</span>
          <span className="hover:text-slate-400 cursor-help transition-colors">API Status</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
