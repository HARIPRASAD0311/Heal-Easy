import { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'healeasy_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function titleCaseFromEmail(email) {
  const handle = email.split('@')[0] || 'Guest';
  return handle
    .replace(/[._]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Guest User';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const persist = useCallback((record) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Storage unavailable — keep the session in memory only, prototype-only.
    }
    setUser(record);
    return record;
  }, []);

  // Prototype authentication: no backend, no password check — this simply
  // simulates a signed-in session so the booking/token flows can be gated.
  const login = useCallback((email) => {
    const record = {
      name: titleCaseFromEmail(email || 'guest@healeasy.app'),
      email: email || 'guest@healeasy.app',
      joinedAt: new Date().toISOString(),
    };
    return persist(record);
  }, [persist]);

  const signup = useCallback((name, email) => {
    const record = {
      name: name?.trim() || titleCaseFromEmail(email || 'guest@healeasy.app'),
      email: email || 'guest@healeasy.app',
      joinedAt: new Date().toISOString(),
    };
    return persist(record);
  }, [persist]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = { user, isAuthenticated: !!user, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
