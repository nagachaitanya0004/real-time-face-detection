/**
 * Purpose: Component for stream management and status indicators.
 */

import React from 'react';
import { Camera, CameraOff, Wifi, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '../types';
import { clsx } from 'clsx';

interface ControlsProps {
  isStreaming: boolean;
  onToggle: () => void;
  status: ConnectionStatus;
  fps: number;
}

/**
 * Renders the session control bar with status badges.
 * @param props Control handlers and status states.
 */
export const Controls: React.FC<ControlsProps> = ({ isStreaming, onToggle, status, fps }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggle}
          className={clsx(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 shadow-lg",
            isStreaming 
              ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
          )}
        >
          {isStreaming ? (
            <><CameraOff size={20} /> Stop Stream</>
          ) : (
            <><Camera size={20} /> Start Stream</>
          )}
        </button>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Client FPS</span>
          <span className="text-xl font-black text-slate-200">{isStreaming ? fps.toFixed(1) : '0.0'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-md border border-slate-700">
          {status === 'open' ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
          <span className={clsx(
            "text-xs font-bold uppercase",
            status === 'open' ? "text-green-500" : "text-red-500"
          )}>
            WS: {status}
          </span>
        </div>
      </div>
    </div>
  );
};
