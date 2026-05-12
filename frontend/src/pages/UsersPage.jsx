import { useState, useEffect } from 'react';
import { users } from '@/data/dummy';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import DataTable from '@/components/dashboard/DataTable';
import DetailModal from '@/components/dashboard/DetailModal';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Search, Plus, Eye, Calendar, DollarSign, Activity } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export default function UsersPage() {
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
  } = useTable(users, { sort: { key: 'name', direction: 'asc' } });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getRoleVariant = (role) => {
    switch (role) {
      case 'Admin': return 'info';
      case 'Manager': return 'warning';
      case 'Editor': return 'success';
      default: return 'default';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar initials={row.avatar} />
          <div>
            <p className="font-medium text-[var(--text-main)]">{row.name}</p>
            <p className="text-xs text-[var(--text-faint)]">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => <Badge variant={getRoleVariant(row.role)}>{row.role}</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", row.status === 'active' ? "bg-emerald-500" : row.status === 'suspended' ? "bg-rose-500" : "bg-slate-500")} />
          <span className="capitalize">{row.status}</span>
        </div>
      )
    },
    { key: 'orders', label: 'Orders', sortable: true, className: "hidden lg:table-cell" },
    { key: 'revenue', label: 'Revenue', sortable: true, className: "hidden sm:table-cell", render: (row) => <span className="font-medium text-[var(--text-main)]">{row.revenue}</span> },
    { key: 'joinDate', label: 'Join Date', sortable: true, className: "hidden md:table-cell" },
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
          <h1 className="text-2xl font-semibold text-[var(--text-main)] tracking-tight">Users</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage team members and customers.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[var(--text-main)] text-sm font-medium rounded-xl shadow-glass-edge transition-all hover:scale-[1.02] hover:shadow-premium-glow">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-card)] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-sm text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <select 
            value={filters.role || 'All'}
            onChange={(e) => setFilter('role', e.target.value)}
            className="px-3 py-2 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
            <option value="Manager">Manager</option>
          </select>

          <select 
            value={filters.status || 'All'}
            onChange={(e) => setFilter('status', e.target.value)}
            className="px-3 py-2 bg-[var(--bg-card-alt)] border border-[var(--border-card)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {Object.keys(filters).length > 0 && (
            <button 
              onClick={() => { setFilter('role', 'All'); setFilter('status', 'All'); }}
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex items-center text-sm text-[var(--text-faint)]">
          Showing {filteredCount} of {totalCount} users
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
            setFilter('role', 'All'); 
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
      <DetailModal isOpen={modal.isOpen} onClose={modal.close} title="User Details">
        {modal.data && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar initials={modal.data.avatar} className="w-20 h-20 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">{modal.data.name}</h3>
                <p className="text-[var(--text-muted)] mb-2">{modal.data.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleVariant(modal.data.role)}>{modal.data.role}</Badge>
                  <Badge variant={getStatusVariant(modal.data.status)} className="capitalize">{modal.data.status}</Badge>
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-card)]" />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Total Revenue</p>
                <p className="text-lg font-bold text-[var(--text-main)]">{modal.data.revenue}</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Total Orders</p>
                <p className="text-lg font-bold text-[var(--text-main)]">{modal.data.orders}</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Member Since</p>
                <p className="text-lg font-bold text-[var(--text-main)]">{modal.data.joinDate}</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-4">
                <p className="text-xs font-medium text-[var(--text-faint)] mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Last Active</p>
                <p className="text-lg font-bold text-emerald-400">Just now</p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Recent Activity</h4>
              <div className="space-y-4">
                {[
                  { title: 'Logged in from new device', date: '2 hours ago', icon: Activity },
                  { title: 'Updated billing details', date: '1 day ago', icon: DollarSign },
                  { title: 'Created new project', date: '3 days ago', icon: Calendar },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-active)] flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
                      <act.icon className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{act.title}</p>
                      <p className="text-xs text-[var(--text-faint)]">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button 
                onClick={() => { modal.close(); toast.success('User updated successfully'); }}
                className="flex-1 py-2.5 bg-[var(--bg-active)] hover:bg-white/[0.08] border border-[var(--border-focus)] rounded-xl text-sm font-medium text-[var(--text-main)] transition-colors"
              >
                Edit User
              </button>
              <button 
                onClick={() => { modal.close(); toast.success(`User ${modal.data.status === 'suspended' ? 'activated' : 'suspended'}`); }}
                className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-sm font-medium text-rose-400 transition-colors"
              >
                {modal.data.status === 'suspended' ? 'Activate' : 'Suspend'}
              </button>
            </div>
          </div>
        )}
      </DetailModal>

    </div>
  );
}
