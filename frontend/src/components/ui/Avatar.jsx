import { cn } from '@/lib/utils';

export default function Avatar({ initials, className }) {
  const colors = [
    'from-indigo-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-sky-500 to-blue-500'
  ];
  
  const colorIndex = initials ? initials.charCodeAt(0) % colors.length : 0;
  const gradient = colors[colorIndex] || colors[0];

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center shrink-0 text-[var(--text-main)] font-semibold text-sm shadow-glass-edge",
      `bg-gradient-to-br ${gradient}`,
      className || "w-9 h-9"
    )}>
      {initials ? initials.toUpperCase().substring(0, 2) : 'A'}
    </div>
  );
}
