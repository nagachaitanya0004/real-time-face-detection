import { ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkeletonRow } from '@/components/ui/Skeleton';

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  onRowClick, 
  emptyMessage = "No results found",
  sortConfig,
  onSort,
  onResetFilters,
  
  // Pagination props
  showPagination = false,
  currentPage,
  totalPages,
  goToPage,
  pageSize,
  setPageSize,
  filteredCount
}) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-[var(--border-card)] text-xs uppercase tracking-wider text-[var(--text-faint)] bg-[var(--bg-card)]/80 backdrop-blur-md">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn(
                    "px-6 py-4 font-medium",
                    col.sortable && "cursor-pointer hover:text-[var(--text-secondary)] transition-colors select-none",
                    col.width,
                    col.className
                  )}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                        : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                      <Inbox className="w-8 h-8 text-[var(--text-faint)]" />
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{emptyMessage}</p>
                    {onResetFilters && (
                      <button 
                        onClick={onResetFilters}
                        className="px-4 py-2 bg-[var(--bg-active)] border border-[var(--border-focus)] hover:bg-white/[0.08] text-sm text-[var(--text-main)] font-medium rounded-lg transition-colors"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  className={cn(
                    "hover:bg-[var(--bg-card-hover)] transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-6 py-4 text-sm text-[var(--text-secondary)]", col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !loading && filteredCount > 0 && (
        <div className="p-4 border-t border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <span className="text-sm text-[var(--text-faint)]">Items per page</span>
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); goToPage(1); }}
              className="px-2 py-1 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-lg text-sm text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-active)] border border-[var(--border-card)] rounded-lg hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  pageNum = currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-indigo-600 text-[var(--text-main)] shadow-glass-edge' 
                        : 'text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden px-3 text-sm text-[var(--text-faint)]">
              {currentPage} / {totalPages}
            </div>

            <button 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-active)] border border-[var(--border-card)] rounded-lg hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
