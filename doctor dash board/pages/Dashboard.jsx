import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getDashboardStats, getWeeklyData, getRecentPatients, getAnnouncements, getMe } from '../api/index'
import './Dashboard.css'

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,78,100,0.12)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 10px 24px rgba(0,78,100,0.1)', fontSize: 12 }}>
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 5 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  )
}

const STAT_DEFS = [
  { key: 'totalPatients', label: "Today's Patients", sub: 'Scheduled & walk-ins', style: 'teal',  route: '/doctor/queue',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { key: 'waiting',       label: 'Waiting',          sub: 'In queue now',        style: 'gold',  route: '/doctor/queue',
    icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></> },
  { key: 'completed',     label: 'Completed',        sub: 'Consultations done',  style: 'navy',
    icon: <><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></> },
  { key: 'pendingSOAP',   label: 'Pending SOAP',     sub: 'Notes to approve',    style: 'luxe',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></> },
  { key: 'emergency',     label: 'Emergency',        sub: 'Needs attention',     style: 'rose',  route: '/doctor/emergency',
    icon: <><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/></> },
  { key: 'avgConsultTime',label: 'Avg. Consult',     sub: 'Per patient',         style: 'teal',
    icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></> },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [doctor,        setDoctor]        = useState(null)
  const [stats,         setStats]         = useState(null)
  const [weekly,        setWeekly]        = useState([])
  const [recent,        setRecent]        = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    getMe().then(setDoctor).catch(() => {
      setDoctor({ name: 'Dr. Demo', department: 'General Medicine', hospital: 'HealEasy Demo' })
    })
    getDashboardStats().then(setStats).catch(() => {})
    getWeeklyData().then(setWeekly).catch(() => {})
    getRecentPatients().then(setRecent).catch(() => {})
    getAnnouncements().then(setAnnouncements).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="dash page-in">

      {/* Hero */}
      <div className="dash-hero card sheen">
        <div className="ambient-blur" style={{ width: 300, height: 300, background: '#14C8C2', top: -100, right: -60, opacity: 0.1 }} />
        <div className="dash-hero-inner">
          <div>
            <p className="eyebrow">{today}</p>
            <h1 className="dash-greeting">{greeting}, <span className="gradient-text">{doctor?.name ?? 'Doctor'}</span></h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginTop: 4 }}>
              {doctor?.department} {doctor?.hospital ? `· ${doctor.hospital}` : ''}
            </p>
          </div>
          <div className="dash-hero-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/notifications')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>
              Alerts
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/queue')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              View Queue
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-children">
        {STAT_DEFS.map(s => (
          <div key={s.key} className={`stat-card card stat-${s.style} ${s.route ? 'stat-clickable' : ''}`} onClick={s.route ? () => navigate(s.route) : undefined}>
            <div className="stat-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
            </div>
            <div className="stat-number">{stats?.[s.key] ?? '—'}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div className="dash-mid-grid">
        <div className="card">
          <div className="card-header">
            <div><h3>Weekly Overview</h3><p>Patient consultations this week</p></div>
            <span className="badge badge-accent">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={weekly} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004E64" stopOpacity={0.18}/><stop offset="95%" stopColor="#004E64" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14C8C2" stopOpacity={0.22}/><stop offset="95%" stopColor="#14C8C2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,78,100,0.06)" />
              <XAxis dataKey="day"  tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis              tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="patients"  name="Total"     stroke="#004E64" strokeWidth={2} fill="url(#gP)" dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#14C8C2" strokeWidth={2} fill="url(#gA)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="quick-actions-col">
            {[
              { label: 'Call Next Patient',  desc: 'Open the live queue',      route: '/doctor/queue',     style: 'teal' },
              { label: 'Pending SOAP Notes', desc: 'Notes awaiting approval',  route: '/doctor/queue',     style: 'navy' },
              { label: 'Emergency Alerts',   desc: 'Critical patients',        route: '/doctor/emergency', style: 'rose' },
              { label: 'Live Queue',         desc: 'All waiting patients',     route: '/doctor/queue',     style: 'gold' },
            ].map(qa => (
              <button key={qa.label} className={`qa-item qa-${qa.style}`} onClick={() => navigate(qa.route)}>
                <div className="qa-text"><div className="qa-label">{qa.label}</div><div className="qa-desc">{qa.desc}</div></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }}><path d="M9 6l6 6-6 6"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="dash-bottom-grid">

        <div className="card">
          <div className="card-header">
            <h3>Recent Patients</h3>
            <button className="see-all btn btn-ghost btn-sm" onClick={() => navigate('/doctor/queue')}>
              View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
          {recent.map(p => (
            <div key={p.id} className="rec-item" onClick={() => navigate(`/doctor/patient/${p.id}/history`)}>
              <div className="rec-avatar">{(p.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
              <div className="rec-info">
                <div className="rec-name">{p.name}</div>
                <div className="rec-diag">{p.diagnosis}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge ${p.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                  {p.status === 'completed' ? 'Done' : 'SOAP Pending'}
                </span>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{p.time ?? p.createdAt}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>Queue Summary</h3><span className="badge badge-open">Live</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Waiting',      value: stats?.waiting,     color: 'var(--color-warning)' },
              { label: 'Emergency',    value: stats?.emergency,   color: 'var(--color-danger)' },
              { label: 'Pending SOAP', value: stats?.pendingSOAP, color: 'var(--color-primary)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--fs-small)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{r.label}</span>
                <strong style={{ color: r.color, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{r.value ?? '—'}</strong>
              </div>
            ))}
            <button className="btn btn-primary btn-block btn-sm" onClick={() => navigate('/doctor/queue')}>
              Open Full Queue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Announcements</h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: 'var(--color-text-muted)' }}><path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>
          </div>
          {announcements.length === 0
            ? <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-text-muted)' }}>No announcements</p>
            : announcements.map(a => (
              <div key={a.id} className={`announce-item announce-${a.type}`}>
                <div className="announce-title">{a.title}</div>
                <div className="announce-msg">{a.message}</div>
                <div className="announce-time">{a.time ?? a.createdAt}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
