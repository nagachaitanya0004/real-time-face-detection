import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, change, changeType, icon: Icon, color, loading }) {
  if (loading) {
    return (
      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-2xl p-6 h-[140px] flex flex-col justify-between overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <div className="flex justify-between items-start">
          <div className="w-24 h-4 bg-white/5 rounded-md" />
          <div className="w-10 h-10 bg-white/5 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="w-32 h-8 bg-white/5 rounded-md" />
          <div className="w-20 h-3 bg-white/5 rounded-md" />
        </div>
      </div>
    );
  }

  const isPositive = changeType === 'success';

  return (
    <div className="group bg-[var(--bg-active)] border border-[var(--border-focus)] rounded-2xl p-6 hover:bg-[var(--bg-active)] hover:-translate-y-1 hover:shadow-glass-glow transition-all duration-300 cursor-default relative overflow-hidden">
      {/* Subtle hover gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-gradient-to-br",
        color === 'indigo' ? "from-indigo-500 to-transparent" :
        color === 'emerald' ? "from-emerald-500 to-transparent" :
        color === 'amber' ? "from-amber-500 to-transparent" :
        "from-rose-500 to-transparent"
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-medium text-[var(--text-muted)]">{title}</h3>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
          color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
          color === 'amber' ? "bg-amber-500/10 text-amber-400" :
          "bg-rose-500/10 text-rose-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-bold text-[var(--text-main)] mb-2 tracking-tight">{value}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            "flex items-center font-medium",
            isPositive ? "text-emerald-400" : "text-rose-400"
          )}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {change}
          </span>
          <span className="text-[var(--text-faint)]">vs last month</span>
        </div>
      </div>
    </div>
  );
}
