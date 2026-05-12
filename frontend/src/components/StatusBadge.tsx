import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  readyState: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ readyState }) => {
  const status = {
    [WebSocket.CONNECTING]: { label: 'Connecting', color: 'bg-amber-500', text: 'text-amber-500' },
    [WebSocket.OPEN]: { label: 'Connected', color: 'bg-green-500', text: 'text-green-500' },
    [WebSocket.CLOSING]: { label: 'Closing', color: 'bg-red-500', text: 'text-red-500' },
    [WebSocket.CLOSED]: { label: 'Disconnected', color: 'bg-red-500', text: 'text-red-500' },
  }[readyState] || { label: 'Unknown', color: 'bg-slate-500', text: 'text-slate-500' };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 shadow-inner">
      <div className={clsx("w-2 h-2 rounded-full", status.color, readyState === WebSocket.OPEN && "animate-pulse")} />
      <span className={clsx("text-[10px] font-black uppercase tracking-widest", status.text)}>
        {status.label}
      </span>
    </div>
  );
};
