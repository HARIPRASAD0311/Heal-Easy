import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getMe, getNotifications, logout } from '../api/index'
import './DashboardLayout.css'

const NAV = [
  { path: '/doctor/dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { path: '/doctor/queue', label: 'Live Queue', badge: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { path: '/doctor/emergency', label: 'Emergency', badgeDanger: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/></svg> },
  { path: '/doctor/notifications', label: 'Notifications', notifBadge: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg> },
  { path: '/doctor/profile', label: 'Profile',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4"/></svg> },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctor,  setDoctor]  = useState(null)
  const [unread,  setUnread]  = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(setDoctor).catch(() => {
      // Demo mode — no backend yet, use placeholder
      setDoctor({ name: 'Dr. Demo', department: 'General Medicine', hospital: 'HealEasy Demo' })
    })
    getNotifications().then(notifs => setUnread(notifs.filter(n => !n.read).length)).catch(() => {})
  }, [])

  const initials = doctor?.name
    ? doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = async () => {
    await logout().catch(() => {})
    localStorage.removeItem('healeasy_doctor_token')
    navigate('/login')
  }

  return (
    <div className="dl-root">
      {sidebarOpen && <div className="dl-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`dl-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dl-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 12h6M12 9v6"/>
            </svg>
          </div>
          <div>
            <span className="dl-brand-name">HealEasy</span>
            <span className="dl-brand-sub">Doctor Portal</span>
          </div>
          <button className="dl-sidebar-close icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="dl-doc-card">
          <div className="dl-doc-avatar">{initials}</div>
          <div className="dl-doc-info">
            <span className="dl-doc-name">{doctor?.name ?? 'Doctor'}</span>
            <span className="dl-doc-dept">{doctor?.department ?? ''}</span>
          </div>
          <span className="dl-doc-online" title="Available" />
        </div>

        <nav className="dl-nav">
          {NAV.map(({ path, label, icon, notifBadge }) => (
            <NavLink key={path} to={path}
              className={({ isActive }) => `dl-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="dl-nav-icon">{icon}</span>
              <span className="dl-nav-label">{label}</span>
              {notifBadge && unread > 0 && <span className="dl-nav-badge">{unread}</span>}
              <svg className="dl-nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M9 6l6 6-6 6"/></svg>
            </NavLink>
          ))}
        </nav>

        <div className="dl-sidebar-footer">
          <div className="dl-ai-status"><span className="dl-ai-dot" /><span>AI Engine Active</span></div>
          <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="dl-main">
        <header className="dl-topbar">
          <button className="dl-menu-btn icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className="dl-topbar-brand">
            <div className="brand-mark" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>HealEasy</span>
          </div>
          <div className="dl-topbar-actions">
            <button className="icon-btn" style={{ position: 'relative' }} onClick={() => navigate('/doctor/notifications')} aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19"><path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>
              {unread > 0 && <span className="dl-topbar-badge">{unread}</span>}
            </button>
            <button className="icon-btn" style={{ position: 'relative', background: 'rgba(225,76,109,0.08)', color: 'var(--color-danger)' }} onClick={() => navigate('/doctor/emergency')} aria-label="Emergency">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/></svg>
            </button>
            <button className="dl-topbar-avatar" onClick={() => navigate('/doctor/profile')} aria-label="Profile">{initials}</button>
          </div>
        </header>
        <main className="dl-page" id="main"><Outlet /></main>
      </div>
    </div>
  )
}
