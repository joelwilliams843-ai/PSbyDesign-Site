import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

// Token storage helpers
function getStoredToken() {
  try { return localStorage.getItem('clarity_access_token'); } catch { return null; }
}
function getStoredRefresh() {
  try { return localStorage.getItem('clarity_refresh_token'); } catch { return null; }
}
function storeTokens(access, refresh) {
  try {
    if (access) localStorage.setItem('clarity_access_token', access);
    if (refresh) localStorage.setItem('clarity_refresh_token', refresh);
  } catch { /* localStorage unavailable */ }
}
function clearStoredTokens() {
  try {
    localStorage.removeItem('clarity_access_token');
    localStorage.removeItem('clarity_refresh_token');
  } catch { /* noop */ }
}

// Axios instance with interceptor for token fallback
const api = axios.create({ withCredentials: true });

api.interceptors.request.use(config => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async error => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry && !orig.url?.includes('/auth/login') && !orig.url?.includes('/auth/refresh')) {
      orig._retry = true;
      try {
        const refreshToken = getStoredRefresh();
        const headers = refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {};
        const { data } = await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true, headers });
        if (data.access_token) {
          storeTokens(data.access_token, null);
          orig.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(orig);
      } catch {
        clearStoredTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get(`${API}/auth/me`);
      setUser(data);
    } catch {
      clearStoredTokens();
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post(`${API}/auth/login`, { email, password });
    // Store tokens from response body as fallback
    if (data.access_token) {
      storeTokens(data.access_token, data.refresh_token);
    }
    // Set user without tokens in state
    const userData = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      force_password_change: data.force_password_change
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post(`${API}/auth/logout`);
    } catch { /* ignore */ }
    clearStoredTokens();
    setUser(false);
  };

  const clearForcePasswordChange = () => {
    if (user) setUser({ ...user, force_password_change: false });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, clearForcePasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function formatApiError(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail.map(e => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).filter(Boolean).join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}
