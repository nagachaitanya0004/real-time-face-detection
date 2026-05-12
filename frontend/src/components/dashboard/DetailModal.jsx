import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function DetailModal({ isOpen, onClose, children, title }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    modalRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--bg-overlay)]/80 backdrop-blur-md animate-fade-in"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        tabIndex="-1"
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-focus)] rounded-t-[1.5rem] sm:rounded-[1.5rem] shadow-glass-glow shadow-glass-edge max-h-[95vh] sm:max-h-[85vh] overflow-y-auto animate-[modalScale_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] focus:outline-none"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-main)] tracking-tight">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
