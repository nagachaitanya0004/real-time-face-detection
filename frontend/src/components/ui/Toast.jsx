import { useToastStore } from '@/hooks/useToast';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const variants = {
    success: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
    error: { icon: AlertCircle, className: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
    warning: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
    info: { icon: Info, className: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
  };

  const { icon: Icon, className } = variants[toast.type] || variants.info;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto animate-[fadeUp_0.3s_ease-out_forwards]",
      className
    )}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button 
        onClick={onRemove}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
