import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

// Token management
function getToken() {
  try { return localStorage.getItem('clarity_token'); } catch { return null; }
}
function getRefreshToken() {
  try { return localStorage.getItem('clarity_refresh'); } catch { return null; }
}
function getAuthProvider() {
  try { return localStorage.getItem('clarity_auth_provider') || 'legacy'; } catch { return 'legacy'; }
}
function storeTokens(access, refresh, provider) {
  try {
    if (access) localStorage.setItem('clarity_token', access);
    if (refresh) localStorage.setItem('clarity_refresh', refresh);
    if (provider) localStorage.setItem('clarity_auth_provider', provider);
  } catch { /* noop */ }
}
function clearTokens() {
  try {
    localStorage.removeItem('clarity_token');
    localStorage.removeItem('clarity_refresh');
    localStorage.removeItem('clarity_auth_provider');
  } catch { /* noop */ }
}

// Axios instance
const api = axios.create();

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
      const provider = getAuthProvider();

      // Supabase token refresh
      if (provider === 'supabase' && supabase) {
        try {
          const { data: { session } } = await supabase.auth.refreshSession();
          if (session?.access_token) {
            storeTokens(session.access_token, session.refresh_token, 'supabase');
            orig.headers.Authorization = `Bearer ${session.access_token}`;
            return api(orig);
          }
        } catch { /* fall through */ }
      }

      // Legacy token refresh
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          });
          if (data.access_token) {
            storeTokens(data.access_token, null, 'legacy');
            orig.headers.Authorization = `Bearer ${data.access_token}`;
            return api(orig);
          }
        } catch { /* noop */ }
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
      // Check if Supabase has a session (e.g., from password reset redirect)
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            storeTokens(session.access_token, session.refresh_token, 'supabase');
            const { data } = await api.get(`${API}/auth/me`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setUser({ ...data, _id: data._id || data.id });
            setLoading(false);
            return;
          }
        } catch { /* no session */ }
      }
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`${API}/auth/me`);
      setUser({ ...data, _id: data._id || data.id });
    } catch {
      clearTokens();
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for Supabase auth state changes (handles password reset callback)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            storeTokens(session.access_token, session.refresh_token, 'supabase');
          }
          if (event === 'SIGNED_IN' && session && !getToken()) {
            storeTokens(session.access_token, session.refresh_token, 'supabase');
            checkAuth();
          }
        }
      );
      return () => subscription?.unsubscribe();
    }
  }, [checkAuth]);

  const login = async (email, password) => {
    // Login via backend (which tries Supabase first, then legacy)
    const { data } = await api.post(`${API}/auth/login`, { email, password });
    storeTokens(data.access_token, data.refresh_token, data.auth_provider || 'legacy');

    // If Supabase login, also set Supabase session for client-side features
    if (data.auth_provider === 'supabase' && supabase) {
      try {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      } catch { /* non-critical */ }
    }

    const userData = {
      id: data.id,
      _id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      force_password_change: data.force_password_change,
      auth_provider: data.auth_provider,
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await api.post(`${API}/auth/logout`); } catch { /* noop */ }
    if (supabase && getAuthProvider() === 'supabase') {
      try { await supabase.auth.signOut(); } catch { /* noop */ }
    }
    clearTokens();
    setUser(false);
  };

  const forgotPassword = async (email) => {
    await api.post(`${API}/auth/forgot-password`, { email });
  };

  const clearForcePasswordChange = () => {
    if (user) setUser({ ...user, force_password_change: false });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, forgotPassword, checkAuth, clearForcePasswordChange }}>
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
