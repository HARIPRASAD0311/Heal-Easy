import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientSummary } from '../api/index'
import './PatientSummary.css'

const VitalCard = ({ label, value, unit, color }) => (
  <div className="vital-card" style={{ '--vc': color }}>
    <div className="vc-val">{value ?? '—'}</div>
    {unit && <div className="vc-unit">{unit}</div>}
    <div className="vc-label">{label}</div>
  </div>
)

export default function PatientSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [p, setP] = useState(null)

  useEffect(() => { getPatientSummary(id).then(setP).catch(() => {}) }, [id])

  if (!p) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading patient summary…</div>

  return (
    <div className="patient-summary page-in">
      <div className="ps-topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/queue')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M15 18l-6-6 6-6"/></svg>
          Queue
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)' }}>Patient Summary</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/consultation/${p.id}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          Start Consultation
        </button>
      </div>

      <div className={`card ps-hero sheen ${p.priority === 'emergency' ? 'ps-hero-emergency' : ''}`}>
        <div className="ambient-blur" style={{ width: 220, height: 220, background: '#14C8C2', top: -80, right: -60, opacity: 0.1 }} />
        <div className="ps-hero-inner">
          <div className="ps-avatar">{(p.initials ?? p.name?.split(' ').map(n => n[0]).join('') ?? '?').slice(0, 2)}</div>
          <div className="ps-identity">
            <div className="ps-name">
              {p.name}
              {p.priority === 'emergency' && <span className="badge badge-danger">⚡ EMERGENCY</span>}
            </div>
            <div className="ps-meta">{p.age} years · {p.gender} · Blood Group: <strong>{p.bloodGroup}</strong></div>
            <div className="ps-meta">{p.phone}</div>
            <div className="ps-tags">
              <span className="chip">Token: {p.token}</span>
              <span className="chip">Queue #{p.queueNumber}</span>
              {p.consentGiven
                ? <span className="badge badge-success">✓ Consent Given</span>
                : <span className="badge badge-danger">✗ No Consent</span>}
            </div>
          </div>
          <div className="ps-quick-stats">
            <div className="pqs-item"><span className="pqs-label">Department</span><span className="pqs-val gradient-text">{p.department}</span></div>
            <div className="pqs-item"><span className="pqs-label">AI Confidence</span><span className="pqs-val" style={{ color: 'var(--color-success)' }}>{p.confidence ?? '—'}%</span></div>
            <div className="pqs-item"><span className="pqs-label">Wait Time</span><span className="pqs-val">{p.waitTime}</span></div>
          </div>
        </div>
      </div>

      <div className="ps-grid">
        <div className="ps-col">
          <div className="card">
            <div className="ps-sec-head">
              <div className="ps-sec-icon danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="M12 8v4M12 15h.01"/></svg></div>
              <h3>Chief Complaint</h3>
            </div>
            <p className="ps-complaint">{p.chiefComplaint}</p>
            <div className="ps-details-row">
              <div className="ps-detail"><span className="pd-label">Duration</span><span className="pd-val">{p.duration}</span></div>
              <div className="ps-detail">
                <span className="pd-label">Severity</span>
                <div className="sev-dots">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`sev-dot2 ${i < (p.severity ?? 0) ? 'on' : ''}`}
                      style={i < (p.severity ?? 0) ? { background: (p.severity ?? 0) >= 8 ? 'var(--color-danger)' : (p.severity ?? 0) >= 6 ? 'var(--color-luxury)' : 'var(--color-accent)' } : {}} />
                  ))}
                  <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{p.severity ?? '—'}/10</span>
                </div>
              </div>
            </div>
            <div className="ps-symptoms">{(p.symptoms ?? []).map(s => <span key={s} className="chip">{s}</span>)}</div>
          </div>

          <div className="card">
            <div className="ps-sec-head">
              <div className="ps-sec-icon primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <h3>Vital Signs</h3>
            </div>
            <div className="vitals-grid">
              <VitalCard label="Blood Pressure" value={p.vitals?.bp}    unit="mmHg" color="var(--color-danger)" />
              <VitalCard label="Pulse Rate"     value={p.vitals?.pulse} unit="bpm"  color="var(--color-primary)" />
              <VitalCard label="Temperature"    value={p.vitals?.temp}  unit=""     color="var(--color-luxury)" />
              <VitalCard label="SpO2"           value={p.vitals?.spo2}  unit=""     color="var(--color-accent)" />
              <VitalCard label="Weight"         value={p.vitals?.weight} unit=""    color="#7c3aed" />
              <VitalCard label="Height"         value={p.vitals?.height} unit=""    color="var(--color-info)" />
            </div>
          </div>

          <div className="card">
            <div className="ps-sec-head">
              <div className="ps-sec-icon success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg></div>
              <h3>Current Medications</h3>
            </div>
            {(p.medications ?? []).length === 0
              ? <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)' }}>None</p>
              : (p.medications ?? []).map(m => (
                <div key={m} className="med-row"><span className="med-dot" /><span style={{ fontSize: 'var(--fs-small)' }}>{m}</span></div>
              ))}
          </div>
        </div>

        <div className="ps-col">
          <div className="card ps-ai-card">
            <div className="ambient-blur" style={{ width: 160, height: 160, background: 'var(--color-accent)', top: -40, right: -30, opacity: 0.08 }} />
            <div className="ps-sec-head">
              <div className="ps-sec-icon accent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 15h.01"/></svg></div>
              <h3>AI Clinical Summary</h3>
              <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>{p.confidence ?? '—'}% Confidence</span>
            </div>
            <p className="ps-ai-text">{p.aiSummary}</p>
            <div className="ai-dept-box">
              <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Recommended Department</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--color-primary)', fontSize: 'var(--fs-body-lg)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
                {p.department}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M9 6l6 6-6 6"/></svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ps-sec-head">
              <div className="ps-sec-icon danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/></svg></div>
              <h3>Allergies</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(p.allergies ?? []).map(a => (
                <span key={a} className={`badge ${a === 'None known' ? 'badge-success' : 'badge-danger'}`} style={{ padding: '5px 12px' }}>{a}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="ps-sec-head">
              <div className="ps-sec-icon primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></div>
              <h3>Medical History</h3>
            </div>
            {(p.medHistory ?? []).map(h => (
              <div key={h} className="hist-row"><span className="hist-dot" /><span style={{ fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)' }}>{h}</span></div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary btn-block" onClick={() => navigate(`/doctor/consultation/${p.id}`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
              Begin Consultation
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => navigate(`/doctor/patient/${p.id}/history`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              View Patient History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
