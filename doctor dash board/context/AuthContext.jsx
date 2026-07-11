/**
 * HealEasy — Auth Context
 *
 * Stores the JWT token in localStorage and exposes the logged-in doctor.
 * Pages call useAuth() to get { doctor, login, logout, loading }.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../api/services'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [doctor,  setDoctor]  = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount try to restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('doctor_token')
    if (!token) { setLoading(false); return }

    authService.getMe()
      .then(data => setDoctor(data))
      .catch(() => localStorage.removeItem('doctor_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, doctor: doc } = await authService.login(email, password)
    localStorage.setItem('doctor_token', token)
    setDoctor(doc)
    return doc
  }, [])

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {})
    localStorage.removeItem('doctor_token')
    setDoctor(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ doctor, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
