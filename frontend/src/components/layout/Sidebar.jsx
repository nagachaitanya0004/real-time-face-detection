import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Package, BarChart3, Settings, ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import LogoIcon from '@/components/ui/LogoIcon';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-[#020617] border-r border-[var(--border-card)] transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-[72px]" : "w-[260px]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-card)] shrink-0">
          <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-8" : "w-full")}>
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-glass-edge">
              <LogoIcon className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight text-[var(--text-main)] whitespace-nowrap">VERTEX</span>}
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-slate-200",
                isCollapsed && "justify-center px-0"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-500" : "text-[var(--text-faint)] group-hover:text-[var(--text-secondary)]")} />
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap flex-1">{item.name}</span>
                  )}

                  {!isCollapsed && item.comingSoon && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Soon
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-[var(--bg-tooltip)]/90 backdrop-blur-md border border-[var(--border-focus)] text-xs font-semibold tracking-wide text-[var(--text-main)] rounded-lg shadow-glass-glow shadow-glass-edge opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-[var(--border-card)] shrink-0">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-[var(--border-focus)]">
              <span className="text-sm font-bold text-[var(--text-main)]">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-main)] truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-[var(--text-faint)] truncate">{user?.email || 'admin@vertex.io'}</p>
              </div>
            )}
            
            {!isCollapsed && (
              <button 
                onClick={logout}
                className="p-1.5 text-[var(--text-faint)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
