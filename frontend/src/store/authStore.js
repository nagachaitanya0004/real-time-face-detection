import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        
        // Mock login
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (password.length >= 6) {
              set({ 
                user: { email, name: email.split('@')[0], role: 'admin' },
                isAuthenticated: true,
                isLoading: false,
              });
              resolve(true);
            } else {
              set({ isLoading: false });
              reject(new Error('Password must be at least 6 characters'));
            }
          }, 800);
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
