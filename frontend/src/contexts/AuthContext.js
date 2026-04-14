import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

// Pure localStorage token management — no cookies
function getToken() {
  try { return localStorage.getItem('clarity_token'); } catch { return null; }
}
function getRefreshToken() {
  try { return localStorage.getItem('clarity_refresh'); } catch { return null; }
}
function storeTokens(access, refresh) {
  try {
    if (access) localStorage.setItem('clarity_token', access);
    if (refresh) localStorage.setItem('clarity_refresh', refresh);
  } catch { /* noop */ }
}
function clearTokens() {
  try {
    localStorage.removeItem('clarity_token');
    localStorage.removeItem('clarity_refresh');
  } catch { /* noop */ }
}

// Axios instance — NO withCredentials (avoids CORS * + credentials conflict)
const api = axios.create();

// Add Authorization header to every request
api.interceptors.request.use(config => {
  const token = getToken();
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
    if (
      error.response?.status === 401 &&
      !orig._retry &&
      !orig.url?.includes('/auth/login') &&
      !orig.url?.includes('/auth/refresh')
    ) {
      orig._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          });
          if (data.access_token) {
            storeTokens(data.access_token, null);
            orig.headers.Authorization = `Bearer ${data.access_token}`;
            return api(orig);
          }
        } catch { /* refresh failed */ }
      }
      clearTokens();
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`${API}/auth/me`);
      setUser(data);
    } catch {
      clearTokens();
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
    if (data.access_token) {
      storeTokens(data.access_token, data.refresh_token);
    }
    const userData = {
      id: data.id,
      _id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      force_password_change: data.force_password_change
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await api.post(`${API}/auth/logout`); } catch { /* noop */ }
    clearTokens();
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
