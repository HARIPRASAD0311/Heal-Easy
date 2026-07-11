import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const DoctorLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Your authentication logic or API service call goes here
      console.log('Logging in with:', email)
      
      // On success, redirect the doctor to their secure dashboard layout route
      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email credentials or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f5f7fb' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '6px', color: '#1e293b' }}>HealEasy</h2>
        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Doctor Portal Sign In</p>
        
        {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="dr.ananya@healeasy.com" />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="••••••••" />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

// CRITICAL VITE FIX: Explicitly default export the component matching App.jsx's import statement
export default DoctorLogin
