import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/index'
import './DoctorLogin.css'

export default function DoctorLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ── Demo bypass (remove when backend is ready) ──────────────────
    // Any email + any password works while the backend is not yet live.
    // The backend team replaces this block with the real API call below.
    setTimeout(() => {
      localStorage.setItem('healeasy_doctor_token', 'demo-token')
      navigate('/doctor/dashboard')
    }, 800)
    return
    // ── Real API call (uncomment when backend is ready) ─────────────
    // try {
    //   const { token } = await login(email, password)
    //   localStorage.setItem('healeasy_doctor_token', token)
    //   navigate('/doctor/dashboard')
    // } catch (err) {
    //   setError(err.message ?? 'Invalid credentials. Please try again.')
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <main className="login-root">
      <div className="ambient-blur mesh-drift" style={{ width: 380, height: 380, background: '#14C8C2', top: -140, left: -100 }} />
      <div className="ambient-blur mesh-drift" style={{ width: 320, height: 320, background: '#D4AF37', bottom: -120, right: -80, animationDelay: '2s' }} />

      {/* Left hero */}
      <div className="login-left">
        <div className="login-hero-media">
          <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80" alt="Hospital corridor" />
          <div className="login-hero-overlay" />
          <div className="login-hero-content">
            <p className="eyebrow" style={{ justifyContent: 'flex-start' }}>AI-Powered Clinical Workflow</p>
            <h1 style={{ color: '#fff', marginTop: 'var(--space-sm)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 600 }}>
              One Voice.<br />Every Visit.<br />One Record.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: 'var(--space-sm)', fontSize: 'var(--fs-body)', lineHeight: 1.6, maxWidth: 340 }}>
              AI-generated SOAP notes, real-time queue management, and smart triage — all in one platform.
            </p>
            <div className="login-features" style={{ marginTop: 'var(--space-lg)' }}>
              {[
                { label: 'AI SOAP Notes', desc: 'Auto-drafted from live consultations' },
                { label: 'Smart Triage',  desc: 'Priority-based patient routing' },
                { label: 'HIPAA-Grade',   desc: 'End-to-end encrypted records' },
              ].map(f => (
                <div key={f.label} className="login-feature-pill">
                  <span className="login-feature-dot" />
                  <div>
                    <div style={{ fontSize: 'var(--fs-small)', fontWeight: 700, color: '#fff' }}>{f.label}</div>
                    <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.6)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="login-card glass-card scale-in">
          <div className="login-brand">
            <div className="brand-mark" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 12h6M12 9v6"/>
              </svg>
            </div>
            <div>
              <span className="login-brand-name">HealEasy</span>
              <span className="login-brand-sub">Doctor Portal</span>
            </div>
          </div>

          <h2 className="login-title">Welcome back, Doctor</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginBottom: 'var(--space-md)' }}>
            Sign in to access your clinical dashboard
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" className="form-input" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="doctor@hospital.com" required />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input id="password" type={showPass ? 'text' : 'password'} className="form-input"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required />
                <button type="button" className="input-end" onClick={() => setShowPass(v => !v)}>
                  {showPass
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 20C6 20 2 12 2 12a18 18 0 0 1 5.1-5.9M9.9 4.2A9.7 9.7 0 0 1 12 4c6 0 10 8 10 8a18 18 0 0 1-2.3 3.4"/><path d="M10.7 10.7a2 2 0 1 0 2.6 2.6"/><path d="M2 2l20 20"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="login-row" style={{ marginTop: 'var(--space-sm)' }}>
              <label className="login-check"><input type="checkbox" defaultChecked /><span>Keep me signed in</span></label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            {error && (
              <div style={{ marginTop: 'var(--space-sm)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(225,76,109,0.08)', border: '1px solid rgba(225,76,109,0.2)', fontSize: 'var(--fs-small)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-lg)' }} disabled={loading}>
              {loading
                ? <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 12a9 9 0 1 1-6.2-8.5"/></svg>
                : <>Sign in to Dashboard <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </form>

          <p className="login-trust" style={{ marginTop: 'var(--space-md)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Demo mode — any email &amp; any password
          </p>
        </div>
      </div>
    </main>
  )
}
