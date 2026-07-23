import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);

function readStoredAuth() {
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('authUsername');
  return token && username ? { token, username } : null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = readStoredAuth();
    setAuthToken(stored?.token ?? null);
    return stored;
  });

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    setAuth(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await api.auth.login(username, password);
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('authUsername', result.username);
    setAuthToken(result.token);
    setAuth({ token: result.token, username: result.username });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const value = useMemo(
    () => ({ isAuthenticated: !!auth, username: auth?.username ?? null, login, logout }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
