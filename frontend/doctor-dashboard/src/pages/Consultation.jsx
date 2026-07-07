import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientSummary } from '../api/index'
import './Consultation.css'

function Waveform({ active }) {
  return (
    <div className="waveform">
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} className={`wave-bar ${active ? 'active' : ''}`}
          style={{ animationDelay: `${(i * 85) % 1100}ms`, animationDuration: `${380 + (i * 61) % 580}ms` }} />
      ))}
    </div>
  )
}

export default function Consultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient,    setPatient]    = useState(null)
  const [recording,  setRecording]  = useState(false)
  const [paused,     setPaused]     = useState(false)
  const [started,    setStarted]    = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [transcript, setTranscript] = useState([])
  const [noise,      setNoise]      = useState(0.25)
  const timerRef = useRef(null)
  const txRef    = useRef(null)

  useEffect(() => { getPatientSummary(id).then(setPatient).catch(() => {}) }, [id])

  useEffect(() => {
    if (recording && !paused) {
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1)
        setNoise(Math.random() * 0.38 + 0.08)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [recording, paused])

  // Real transcript comes from backend WebSocket / SSE on consultationId
  // The backend team should push transcript lines to this component.
  // Placeholder: transcript state is managed here, backend pushes to it.
  const pushTranscriptLine = (line) => {
    setTranscript(prev => [...prev, line])
    if (txRef.current) txRef.current.scrollTop = txRef.current.scrollHeight
  }

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const initials = patient ? (patient.initials ?? patient.name?.split(' ').map(n => n[0]).join('') ?? '?').slice(0, 2) : '?'

  return (
    <div className="consultation page-in">
      <div className="con-header">
        <div className="con-patient-row">
          <div className="con-avatar">{initials}</div>
          <div>
            <div className="con-name">{patient?.name ?? 'Loading…'}</div>
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)' }}>
              {patient?.age}y · {patient?.gender} · Token: {patient?.token}
            </div>
          </div>
        </div>
        <div className="con-badges">
          {recording && !paused && <span className="badge badge-danger" style={{ animation: 'recBlink 1s ease infinite' }}>● REC</span>}
          {paused && <span className="badge badge-warning">⏸ PAUSED</span>}
          <span className="badge badge-open">Quality: Excellent</span>
          <span className="badge badge-primary">{fmt(elapsed)}</span>
        </div>
      </div>

      <div className="con-layout">
        <div className="card con-mic-card">
          <div className="mic-stage">
            <div className={`mic-rings ${recording && !paused ? 'active' : ''}`}>
              <div className="mic-ring r1" /><div className="mic-ring r2" /><div className="mic-ring r3" />
              <button
                className={`mic-btn ${recording && !paused ? 'rec' : ''} ${paused ? 'psd' : ''}`}
                onClick={() => {
                  if (!started) { setStarted(true); setRecording(true); setPaused(false) }
                  else setPaused(v => !v)
                }}>
                {paused
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                }
                {!started && <span className="mic-hint">Tap to Start</span>}
              </button>
            </div>
            <Waveform active={recording && !paused} />
            <div className="rec-timer">{fmt(elapsed)}</div>
            <div style={{ fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {!started ? 'Ready to Record' : recording && !paused ? 'Recording Active' : 'Paused'}
            </div>
          </div>

          <div className="rec-metrics">
            <div className="rec-metric">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>
              <span>Noise Level</span>
              <div className="noise-track"><div className="noise-fill" style={{ width: `${noise * 100}%`, background: noise > 0.6 ? 'var(--color-danger)' : noise > 0.4 ? 'var(--color-luxury)' : 'var(--color-accent)' }} /></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: noise > 0.6 ? 'var(--color-danger)' : noise > 0.4 ? '#7c5e08' : '#086b66' }}>
                {noise > 0.6 ? 'High' : noise > 0.4 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="rec-metric">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span>Recording Quality</span>
              <span style={{ fontWeight: 600, fontSize: 12, color: '#086b66' }}>Excellent</span>
            </div>
          </div>

          <div className="con-controls">
            {!started ? (
              <button className="btn btn-primary btn-lg" onClick={() => { setStarted(true); setRecording(true); setPaused(false) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                Start Recording
              </button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => setPaused(v => !v)}>
                  {paused
                    ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
                  }
                </button>
                <button className="btn btn-danger" onClick={() => navigate(`/doctor/soap/${id}`)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                  End Consultation
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="con-sidebar">
          <div className="card transcript-card">
            <div className="tc-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-small)', fontWeight: 600 }}>Live Transcript</h3>
              <span className="badge badge-open" style={{ fontSize: 11 }}>{recording && !paused ? 'Live' : 'Paused'}</span>
            </div>
            <div className="tc-body" ref={txRef}>
              {transcript.length === 0 ? (
                <div className="tc-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" style={{ color: 'var(--color-text-muted)', marginBottom: 10 }}>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                  <p>Transcript appears here once recording starts.<br/>Backend AI streams lines in real-time.</p>
                </div>
              ) : transcript.map(t => (
                <div key={t.id} className={`tx-line tx-${t.speaker}`}>
                  <div className="tx-speaker">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                      {t.speaker === 'doctor' ? <path d="M3 18v-6a9 9 0 0 1 18 0v6"/> : <><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4"/></>}
                    </svg>
                    <span>{t.speaker === 'doctor' ? (patient ? `Dr. ${patient.name?.split(' ')[1] ?? ''}` : 'Doctor') : (patient?.name ?? 'Patient')}</span>
                    <span className="tx-time">{t.time}</span>
                  </div>
                  <div className="tx-text">{t.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card con-vitals-snap">
            <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Patient Snapshot
            </div>
            {[
              { l: 'Chief Complaint', v: patient?.chiefComplaint?.substring(0, 42) + '…' },
              { l: 'BP',    v: patient?.vitals?.bp },
              { l: 'SpO2', v: patient?.vitals?.spo2, warn: parseFloat(patient?.vitals?.spo2) < 96 },
              { l: 'Pulse', v: patient?.vitals?.pulse ? `${patient.vitals.pulse} bpm` : null },
            ].map(r => (
              <div key={r.l} className="snap-row">
                <span className="snap-label">{r.l}</span>
                <span className="snap-val" style={r.warn ? { color: 'var(--color-danger)' } : {}}>{r.v ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
