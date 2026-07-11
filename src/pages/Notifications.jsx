import React, { useState, useEffect } from 'react'
import { getNotifications, markNotifRead, markAllRead, deleteNotif } from '../api/index'
import './Notifications.css'

const TYPE = {
  patient_arrived: { color: 'var(--color-primary)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  soap_ready:      { color: 'var(--color-success)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg> },
  emergency:       { color: 'var(--color-danger)',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/></svg> },
  queue_update:    { color: 'var(--color-accent)',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  hospital:        { color: 'var(--color-luxury)',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg> },
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { getNotifications().then(setNotifs).catch(() => {}) }, [])

  const handleMarkAll = async () => {
    await markAllRead().catch(() => {})
    setNotifs(n => n.map(nt => ({ ...nt, read: true })))
  }
  const handleDelete = async id => {
    await deleteNotif(id).catch(() => {})
    setNotifs(n => n.filter(nt => nt.id !== id))
  }
  const handleRead = async id => {
    await markNotifRead(id).catch(() => {})
    setNotifs(n => n.map(nt => nt.id === id ? { ...nt, read: true } : nt))
  }

  const unread   = notifs.filter(n => !n.read).length
  const filtered = notifs.filter(n => {
    if (filter === 'unread')    return !n.read
    if (filter === 'emergency') return n.type === 'emergency'
    return true
  })

  return (
    <div className="notifs-page page-in">
      <div className="nf-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 600 }}>Notifications</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginTop: 3 }}>
            {unread} unread · {notifs.length} total
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M18 6 7 17l-5-5M22 6 11 17l-2.5-2.5"/></svg>
          Mark All Read
        </button>
      </div>

      <div className="filter-row">
        {[{ k: 'all', l: 'All' }, { k: 'unread', l: 'Unread' }, { k: 'emergency', l: 'Emergency' }].map(f => (
          <button key={f.k} className={`filter-pill ${filter === f.k ? 'is-active' : ''}`} onClick={() => setFilter(f.k)}>
            {f.l}
            {f.k === 'unread' && unread > 0 && <span className="badge badge-danger" style={{ marginLeft: 6, padding: '1px 6px' }}>{unread}</span>}
          </button>
        ))}
      </div>

      <div className="card nf-list">
        {filtered.length === 0 ? (
          <div className="nf-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36" style={{ color: 'var(--color-text-muted)', marginBottom: 10 }}>
              <path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/>
            </svg>
            <p>No notifications</p>
          </div>
        ) : filtered.map(n => {
          const cfg = TYPE[n.type] ?? TYPE.hospital
          return (
            <div key={n.id} className={`nf-item ${!n.read ? 'unread' : ''}`} onClick={() => handleRead(n.id)}>
              <div className="nf-icon">
                <div style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', color: cfg.color, background: `color-mix(in srgb, currentColor 12%, transparent)`, flexShrink: 0 }}>
                  {cfg.icon}
                </div>
              </div>
              <div className="nf-body">
                <div className="nf-title">{n.title}{!n.read && <span className="nf-dot" />}</div>
                <div className="nf-msg">{n.message}</div>
                <div className="nf-time">{n.time ?? n.createdAt}</div>
              </div>
              <button className="nf-del btn btn-ghost btn-icon-sq" onClick={e => { e.stopPropagation(); handleDelete(n.id) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
