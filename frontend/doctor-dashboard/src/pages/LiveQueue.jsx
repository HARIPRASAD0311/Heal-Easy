import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQueue, callPatient, skipPatient } from '../api/index'
import './LiveQueue.css'

const PRI = {
  emergency: { cls: 'badge-danger',  label: 'Emergency', rank: 0 },
  high:      { cls: 'badge-warning', label: 'High',      rank: 1 },
  medium:    { cls: 'badge-primary', label: 'Medium',    rank: 2 },
  low:       { cls: 'badge-success', label: 'Low',       rank: 3 },
}

export default function LiveQueue() {
  const navigate = useNavigate()
  const [patients,  setPatients]  = useState([])
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [calledId,  setCalled]    = useState(null)

  useEffect(() => { getQueue().then(setPatients).catch(() => {}) }, [])

  const list = patients
    .filter(p => filter === 'all' || p.priority === filter)
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.symptoms ?? []).some(s => s.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => (PRI[a.priority]?.rank ?? 9) - (PRI[b.priority]?.rank ?? 9))

  const handleCall = async id => {
    setCalled(id)
    await callPatient(id).catch(() => {})
    setTimeout(() => setCalled(null), 2800)
  }
  const handleSkip = async id => {
    await skipPatient(id).catch(() => {})
    getQueue().then(setPatients).catch(() => {})
  }

  return (
    <div className="live-queue page-in">
      <div className="lq-header">
        <div>
          <p className="eyebrow">Today</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 600 }}>Live Queue</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginTop: 4 }}>
            {patients.length} patients {patients.filter(p => p.priority === 'emergency').length > 0 &&
              <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>· {patients.filter(p => p.priority === 'emergency').length} emergency</span>}
          </p>
        </div>
        <span className="badge badge-open">Live Updates</span>
      </div>

      <div className="lq-stats stagger-children">
        {[
          { label: 'Total',     v: patients.length,                                        cls: 'navy' },
          { label: 'Emergency', v: patients.filter(p => p.priority === 'emergency').length, cls: 'rose' },
          { label: 'Waiting',   v: patients.filter(p => p.status === 'waiting').length,    cls: 'gold' },
          { label: 'Avg Wait',  v: '—',                                                    cls: 'teal' },
        ].map(s => (
          <div key={s.label} className={`lq-stat card lq-stat-${s.cls}`}>
            <div className="lq-stat-val">{s.v}</div>
            <div className="lq-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="lq-toolbar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 380 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search patients or symptoms…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-row" style={{ margin: 0, padding: 0 }}>
          {['all', 'emergency', 'high', 'medium', 'low'].map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="queue-list">
        {list.map((p, i) => {
          const pc = PRI[p.priority] ?? PRI.low
          return (
            <div key={p.id} className={`qc card ${p.priority === 'emergency' ? 'qc-emergency' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
              {p.priority === 'emergency' && <div className="qc-emergency-bar" />}
              <div className="qc-body">
                <div className="qc-num">#{p.queueNumber}</div>
                <div className="qc-avatar">{(p.initials ?? p.name?.split(' ').map(n => n[0]).join('') ?? '?').slice(0, 2)}</div>
                <div className="qc-info">
                  <div className="qc-name">
                    {p.name}
                    {p.priority === 'emergency' && <span className="badge badge-danger" style={{ marginLeft: 8 }}>⚡ EMERGENCY</span>}
                  </div>
                  <div className="qc-meta">
                    {p.age}y · {p.gender} · {p.bloodGroup}
                    <span style={{ margin: '0 5px', color: 'var(--color-text-muted)' }}>·</span>
                    Token: <strong>{p.token}</strong>
                    <span style={{ margin: '0 5px', color: 'var(--color-text-muted)' }}>·</span>
                    {p.arrivalTime}
                  </div>
                  <div className="qc-symptoms">
                    {(p.symptoms ?? []).map(s => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
                <div className="qc-right">
                  <span className={`badge ${pc.cls}`}>{pc.label} Priority</span>
                  <div className="qc-wait">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                    {p.waitTime}
                  </div>
                  <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-primary)', fontWeight: 600 }}>→ {p.department}</div>
                </div>
                <div className="qc-severity">
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>Severity</div>
                  <div className="sev-track">
                    <div className="sev-fill" style={{ width: `${(p.severity ?? 0) * 10}%`, background: (p.severity ?? 0) >= 8 ? 'var(--color-danger)' : (p.severity ?? 0) >= 6 ? 'var(--color-luxury)' : 'var(--color-accent)' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: (p.severity ?? 0) >= 8 ? 'var(--color-danger)' : (p.severity ?? 0) >= 6 ? '#7c5e08' : '#086b66', marginTop: 3 }}>{p.severity ?? '—'}/10</div>
                </div>
              </div>
              <div className="qc-actions">
                <button className={`btn btn-primary btn-sm ${calledId === p.id ? 'calling' : ''}`} onClick={() => handleCall(p.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L9.1 10.5a16 16 0 0 0 6.4 6.4l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>
                  {calledId === p.id ? 'Calling…' : 'Call Patient'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/doctor/patient/${p.id}/summary`)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                  Summary
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => navigate(`/doctor/patient/${p.id}/summary`)}>
                  Start Consult <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M9 6l6 6-6 6"/></svg>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleSkip(p.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 19l7-7-7-7"/></svg>
                  Skip
                </button>
              </div>
              <div className="qc-ai-row">
                <span className="eyebrow" style={{ fontSize: 10 }}>AI</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {p.confidence ?? '—'}% confident → <strong>{p.department}</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
