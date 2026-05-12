/**
 * Purpose: Component for displaying high-level session statistics.
 */

import React from 'react';
import { StreamStats } from '../types';
import { Activity, UserCheck, Target, Clock } from 'lucide-react';

interface StatsBarProps {
  stats: StreamStats;
}

/**
 * Renders a row of metric cards for the current session.
 * @param props Current session statistics.
 */
export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const duration = stats.startTime ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        label="Total Frames" 
        value={stats.totalProcessed.toLocaleString()} 
        icon={<Activity className="text-blue-400" size={20} />} 
      />
      <StatCard 
        label="Faces Detected" 
        value={stats.facesDetected.toLocaleString()} 
        icon={<UserCheck className="text-green-400" size={20} />} 
      />
      <StatCard 
        label="Avg Confidence" 
        value={`${(stats.averageConfidence * 100).toFixed(1)}%`} 
        icon={<Target className="text-purple-400" size={20} />} 
      />
      <StatCard 
        label="Duration" 
        value={`${duration}s`} 
        icon={<Clock className="text-orange-400" size={20} />} 
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4 shadow-lg transition-transform hover:scale-[1.02]">
    <div className="p-3 bg-slate-900 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  </div>
);
