// Replaces the previous version, which just derived a display name
// from whatever email was typed in — no password check, no backend
// call at all. This version does real Cognito sign-in.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authService from '../api/authService';
import { getPatientProfile } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getStoredSession()
      .then(async (session) => {
        if (!session) return;
        const profile = await getPatientProfile(session.patientId).catch(() => null);
        setUser({ ...session, ...profile });
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const session = await authService.signIn(email, password);
    const profile = await getPatientProfile(session.patientId).catch(() => null);
    const record = { ...session, ...profile };
    setUser(record);
    return record;
  }, []);

  const signup = useCallback(async (email, password, hospitalId) => {
    return authService.signUp(email, password, hospitalId);
  }, []);

  const confirmSignup = useCallback(async (email, code) => {
    return authService.confirmSignUp(email, code);
  }, []);

  const logout = useCallback(() => {
    authService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, signup, confirmSignup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}