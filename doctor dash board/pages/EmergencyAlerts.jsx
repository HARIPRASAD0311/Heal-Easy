import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmergencyAlerts, acknowledgeAlert, dismissAlert } from '../api/index'
import './EmergencyAlerts.css'

export default function EmergencyAlerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])

  useEffect(() => { getEmergencyAlerts().then(setAlerts).catch(() => {}) }, [])

  const acknowledge = async id => {
    await acknowledgeAlert(id).catch(() => {})
    setAlerts(a => a.map(al => al.id === id ? { ...al, acknowledged: true } : al))
  }
  const dismiss = async id => {
    await dismissAlert(id).catch(() => {})
    setAlerts(a => a.filter(al => al.id !== id))
  }

  return (
    <div className="emergency-alerts page-in">
      <div className="ea-header">
        <div className="ea-title-row">
          <div className="ea-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/>
            </svg>
          </div>
          <div>
            <p className="eyebrow">Live</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 600 }}>Emergency Alerts</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginTop: 3 }}>
              {alerts.filter(a => !a.acknowledged).length} active · {alerts.length} total
            </p>
          </div>
        </div>
        <span className="badge badge-danger" style={{ padding: '7px 14px', fontSize: 12 }}>⚡ Critical Priority</span>
      </div>

      {alerts.length === 0 ? (
        <div className="ea-empty card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44" style={{ color: 'var(--color-success)', marginBottom: 12 }}>
            <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>
          </svg>
          <h3>No Active Alerts</h3>
          <p>All emergencies have been addressed.</p>
        </div>
      ) : (
        <div className="ea-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`ea-card card ${alert.acknowledged ? 'acknowledged' : ''} sev-${alert.severity}`}>
              {!alert.acknowledged && alert.severity === 'critical' && <div className="ea-crit-bar" />}
              <div className="ea-card-head">
                <div className="ea-alert-type">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M10.3 3.2 1.7 17.8A2 2 0 0 0 3.4 21h17.2a2 2 0 0 0 1.7-3.2L13.7 3.2a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/></svg>
                  {alert.alertType}
                </div>
                <div className="ea-badges">
                  <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                    {alert.severity === 'critical' ? '🔴 CRITICAL' : '🟡 HIGH'}
                  </span>
                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-muted)' }}>{alert.triggeredAt}</span>
                  {alert.acknowledged && <span className="badge badge-success">✓ Acknowledged</span>}
                </div>
              </div>
              <div className="ea-body">
                <div className="ea-patient-row">
                  <div className="ea-pat-avatar">{(alert.patient?.initials ?? alert.patient?.name?.split(' ').map(n => n[0]).join('') ?? '?').slice(0, 2)}</div>
                  <div>
                    <div className="ea-pat-name">{alert.patient?.name}</div>
                    <div className="ea-pat-meta">{alert.patient?.age}y · {alert.patient?.gender} · Queue #{alert.patient?.queueNumber} · Token: {alert.patient?.token}</div>
                    <div className="ea-vitals-row">
                      <span>BP: {alert.patient?.vitals?.bp}</span>
                      <span>HR: {alert.patient?.vitals?.pulse}</span>
                      <span>SpO2: {alert.patient?.vitals?.spo2}</span>
                      <span>Temp: {alert.patient?.vitals?.temp}</span>
                    </div>
                  </div>
                </div>
                <div className="ea-msg">{alert.message}</div>
                <div>
                  <div className="ea-sug-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/></svg>
                    Suggested Actions
                  </div>
                  <ol className="ea-sug-list">
                    {(alert.suggestions ?? []).map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </div>
              <div className="ea-actions">
                <button className="btn btn-danger btn-sm" onClick={() => navigate(`/doctor/patient/${alert.patient?.id}/summary`)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  View Patient
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/consultation/${alert.patient?.id}`)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
                  Start Consult
                </button>
                <button className="btn btn-ghost btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.12.96.36 1.9.72 2.8a2 2 0 0 1-.45 2.11L9.1 10.78a16 16 0 0 0 6.4 6.4l1.16-1.16a2 2 0 0 1 2.11-.45c.9.36 1.84.6 2.8.72A2 2 0 0 1 22 18.4"/></svg>
                  Call Team
                </button>
                {!alert.acknowledged && (
                  <button className="btn btn-success btn-sm" onClick={() => acknowledge(alert.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M20 6 9 17l-5-5"/></svg>
                    Acknowledge
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => dismiss(alert.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
