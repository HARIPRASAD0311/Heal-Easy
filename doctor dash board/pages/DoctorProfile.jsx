import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctorProfile, updateSettings } from '../api/index'
import './DoctorProfile.css'

function Toggle({ label, checked, onChange }) {
  return (
    <div className="tgl-row">
      <span>{label}</span>
      <button className={`tgl-btn ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
        <span className="tgl-knob" />
      </button>
    </div>
  )
}

export default function DoctorProfile() {
  const navigate = useNavigate()
  const [doctor,   setDoctor]   = useState(null)
  const [tab,      setTab]      = useState('profile')
  const [settings, setSettings] = useState({})

  useEffect(() => {
    getDoctorProfile().then(d => {
      setDoctor(d)
      setSettings(d.settings ?? {})
    }).catch(() => {})
  }, [])

  const handleToggle = async (key, val) => {
    const next = { ...settings, [key]: val }
    setSettings(next)
    await updateSettings(next).catch(() => {})
  }

  const handleLogout = () => {
    localStorage.removeItem('healeasy_doctor_token')
    navigate('/login')
  }

  const initials = doctor?.name
    ? doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (!doctor) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading profile…</div>

  return (
    <div className="doctor-profile page-in">
      <div className="card dp-hero">
        <div className="dp-banner">
          <div className="ambient-blur" style={{ width: 300, height: 300, background: '#14C8C2', top: -80, right: -60, opacity: 0.18 }} />
          <div className="ambient-blur" style={{ width: 200, height: 200, background: 'var(--color-primary)', bottom: -60, left: 40, opacity: 0.14 }} />
        </div>
        <div className="dp-hero-body">
          <div className="dp-av-wrap">
            <div className="dp-avatar">{initials}</div>
            <span className="dp-online" title="Available" />
          </div>
          <div className="dp-identity">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 600 }}>{doctor.name}</h1>
            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)', marginTop: 3 }}>{doctor.qualification}</p>
            <div className="dp-chips">
              <span className="chip">{doctor.specialty}</span>
              <span className="chip">{doctor.department}</span>
              <span className="badge badge-success">✓ {doctor.availability ?? 'Available'}</span>
            </div>
          </div>
          <div className="dp-stats-row">
            {[
              { l: 'Rating',     v: doctor.rating     ? `${doctor.rating}/5`                          : '—', c: 'var(--color-luxury)' },
              { l: 'Patients',   v: doctor.totalPatients ? doctor.totalPatients.toLocaleString()       : '—', c: 'var(--color-primary)' },
              { l: 'Experience', v: doctor.experience ?? '—',                                               c: 'var(--color-success)' },
            ].map(s => (
              <div key={s.l} className="dp-stat">
                <span className="dp-stat-val" style={{ color: s.c }}>{s.v}</span>
                <span className="dp-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dp-tab-bar">
        {[{ k: 'profile', l: 'Profile' }, { k: 'settings', l: 'Settings' }, { k: 'availability', l: 'Availability' }].map(t => (
          <button key={t.k} className={`dp-tab ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="dp-grid">
          <div className="card dp-info-card">
            <div className="dpc-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4"/></svg>
              <h3>Personal Information</h3>
            </div>
            {[
              { l: 'Email',        v: doctor.email },
              { l: 'Phone',        v: doctor.phone },
              { l: 'Registration', v: doctor.regNumber },
              { l: 'Hospital',     v: doctor.hospital },
              { l: 'Department',   v: doctor.department },
              { l: 'Experience',   v: doctor.experience },
            ].map(row => (
              <div key={row.l} className="dpi-row">
                <span className="dpi-label">{row.l}</span>
                <span className="dpi-val">{row.v ?? '—'}</span>
              </div>
            ))}
          </div>
          <div className="dp-right">
            <div className="card dp-info-card">
              <div className="dpc-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <h3>Languages</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {(doctor.languages ?? []).map(l => <span key={l} className="badge badge-accent" style={{ padding: '5px 12px' }}>{l}</span>)}
              </div>
            </div>
            <div className="card dp-info-card">
              <div className="dpc-head">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <h3>Today's Summary</h3>
              </div>
              {Object.entries(doctor.todaySummary ?? {}).map(([k, v]) => (
                <div key={k} className="dpi-row">
                  <span className="dpi-label">{k}</span>
                  <strong style={{ color: 'var(--color-text)', fontWeight: 700 }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="card dp-settings">
          {[
            { heading: 'Notification Preferences', keys: ['emergencyAlerts', 'newPatientArrivals', 'soapNotesReady', 'queueUpdates', 'hospitalAnnouncements'] },
            { heading: 'Privacy & Security',        keys: ['twoFactorAuth', 'sessionTimeout', 'auditLog'] },
            { heading: 'AI Settings',               keys: ['autoGenerateSOAP', 'aiTriageSuggestions', 'voiceActivityDetection', 'noiseCancellation'] },
          ].map(sec => (
            <div key={sec.heading} className="dp-settings-sec">
              <h3>{sec.heading}</h3>
              {sec.keys.map(k => (
                <Toggle key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  checked={settings[k] ?? false} onChange={v => handleToggle(k, v)} />
              ))}
            </div>
          ))}
          <button className="btn btn-danger btn-block" style={{ marginTop: 8 }} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      )}

      {tab === 'availability' && (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Weekly Schedule</h3>
          <div className="avail-grid">
            {(doctor.schedule ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, hours: i < 5 ? '9AM–5PM' : null }))).map(s => (
              <div key={s.day} className={`avail-day ${s.hours ? 'on' : 'off'}`}>
                <span className="av-day">{s.day}</span>
                <span className="av-time">{s.hours ?? 'Off'}</span>
                <span className={`av-dot ${s.hours ? 'live' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
