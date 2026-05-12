import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  
  const toast = Object.assign(
    (message, type = 'info') => addToast({ message, type }),
    {
      success: (message) => addToast({ message, type: 'success' }),
      error: (message) => addToast({ message, type: 'error' }),
      warning: (message) => addToast({ message, type: 'warning' }),
      info: (message) => addToast({ message, type: 'info' }),
    }
  );
  
  return { toast };
}
