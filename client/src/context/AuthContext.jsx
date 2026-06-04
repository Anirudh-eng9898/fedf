import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('wellness_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: u, token: t } = res.data.data;
    setUser(u);
    setToken(t);
    localStorage.setItem('wellness_auth', JSON.stringify({ user: u, token: t }));
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await authService.register({ name, email, password, role });
    const { user: u, token: t } = res.data.data;
    setUser(u);
    setToken(t);
    localStorage.setItem('wellness_auth', JSON.stringify({ user: u, token: t }));
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wellness_auth');
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
