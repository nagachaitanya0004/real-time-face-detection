import { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
