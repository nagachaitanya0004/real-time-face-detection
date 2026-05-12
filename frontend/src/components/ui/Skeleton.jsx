import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export function SkeletonLine({ className }) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-[var(--bg-active)] rounded",
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent pointer-events-none" />
    </div>
  );
}
SkeletonLine.propTypes = { className: PropTypes.string };

export function SkeletonCard({ className }) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6",
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent pointer-events-none" />
      <SkeletonLine className="h-10 w-10 rounded-xl mb-4" />
      <SkeletonLine className="h-5 w-1/3 mb-2" />
      <SkeletonLine className="h-8 w-1/2" />
    </div>
  );
}
SkeletonCard.propTypes = { className: PropTypes.string };

export function SkeletonRow({ columns = 5 }) {
  return (
    <tr className="relative overflow-hidden border-b border-[var(--border-subtle)]">
      <td colSpan={columns} className="px-6 py-5">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent pointer-events-none" />
        <div className="flex items-center justify-between opacity-50">
          {Array.from({ length: columns }).map((_, idx) => (
            <SkeletonLine key={idx} className={cn("h-4", idx === 0 ? "w-40" : "w-24")} />
          ))}
        </div>
      </td>
    </tr>
  );
}
SkeletonRow.propTypes = { columns: PropTypes.number };
