import { useState, useEffect } from 'react';
import { orders } from '@/data/dummy';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import DataTable from '@/components/dashboard/DataTable';
import DetailModal from '@/components/dashboard/DetailModal';
import Badge from '@/components/ui/Badge';
import { Search, Eye, Download, FileText, Calendar } from 'lucide-react';

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const { toast } = useToast();

  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    sortConfig,
    handleSort,
    currentPage,
    totalPages,
    goToPage,
    pageSize,
    setPageSize,
    totalCount,
    filteredCount
  } = useTable(orders, { sort: { key: 'id', direction: 'desc' } });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', sortable: true, render: (row) => <span className="font-medium text-[var(--text-main)]">{row.orderId}</span> },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, className: "hidden sm:table-cell", render: (row) => <span className="font-medium text-[var(--text-main)]">{row.amount}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => <Badge variant={getStatusVariant(row.status)} className="capitalize">{row.status}</Badge>
    },
    { key: 'date', label: 'Date', sortable: true, className: "hidden md:table-cell" },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); modal.open(row); }}
          className="p-1.5 text-[var(--text-faint)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDuration: '0.4s' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-main)] tracking-tight">Orders</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Track and process customer orders.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-active)] border border-[var(--border-focus)] hover:bg-white/[0.08] text-[var(--text-main)] text-sm font-medium rounded-xl transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-card)] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-sm text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <select 
            value={filters.status || 'All'}
            onChange={(e) => setFilter('status', e.target.value)}
            className="px-3 py-2 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {Object.keys(filters).length > 0 && (
            <button 
              onClick={() => { setFilter('status', 'All'); }}
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex items-center text-sm text-[var(--text-faint)]">
          Showing {filteredCount} of {totalCount} orders
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-card)] rounded-2xl overflow-hidden shadow-sm">
        <DataTable 
          columns={columns}
          data={paginatedData}
          loading={loading}
          onRowClick={modal.open}
          sortConfig={sortConfig}
          onSort={handleSort}
          onResetFilters={() => { 
            setFilter('status', 'All'); 
            setSearchTerm(''); 
            toast.info('Filters reset');
          }}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          filteredCount={filteredCount}
        />
      </div>

      {/* Detail Modal */}
      <DetailModal isOpen={modal.isOpen} onClose={modal.close} title="Order Details">
        {modal.data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">{modal.data.orderId}</h3>
                <p className="text-[var(--text-muted)] text-sm">Customer: {modal.data.customer}</p>
              </div>
              <Badge variant={getStatusVariant(modal.data.status)} className="capitalize text-sm px-3 py-1">{modal.data.status}</Badge>
            </div>

            <hr className="border-[var(--border-card)]" />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Product</p>
                <p className="text-sm font-medium text-[var(--text-main)]">{modal.data.product}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Items: {modal.data.items}</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</p>
                <p className="text-sm font-medium text-[var(--text-main)]">{modal.data.date}</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">{modal.data.amount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button className="flex-1 py-2.5 bg-[var(--bg-active)] hover:bg-white/[0.08] border border-[var(--border-focus)] rounded-xl text-sm font-medium text-[var(--text-main)] transition-colors">
                Download Invoice
              </button>
              <button 
                onClick={() => { modal.close(); toast.success('Order status updated successfully'); }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-main)] rounded-xl text-sm font-medium transition-colors shadow-glass-edge"
              >
                Update Status
              </button>
            </div>
          </div>
        )}
      </DetailModal>

    </div>
  );
}
