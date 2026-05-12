import React from 'react';
import { Activity, UserCheck, Target, Clock } from 'lucide-react';

interface StatsBarProps {
  totalFrames: number;
  detectedPercent: number;
  avgConfidence: number;
  sessionTime: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalFrames, detectedPercent, avgConfidence, sessionTime }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <StatCard 
        label="Processed" 
        value={totalFrames.toLocaleString()} 
        icon={<Activity className="text-blue-400" size={16} />} 
      />
      <StatCard 
        label="Detection Rate" 
        value={`${detectedPercent.toFixed(1)}%`} 
        icon={<UserCheck className="text-green-400" size={16} />} 
      />
      <StatCard 
        label="Avg Conf." 
        value={`${(avgConfidence * 100).toFixed(1)}%`} 
        icon={<Target className="text-purple-400" size={16} />} 
      />
      <StatCard 
        label="Session" 
        value={`${sessionTime}s`} 
        icon={<Clock className="text-orange-400" size={16} />} 
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
    <div className="p-2 bg-slate-950 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</p>
      <p className="text-lg font-black text-slate-200 leading-none mt-1">{value}</p>
    </div>
  </div>
);
