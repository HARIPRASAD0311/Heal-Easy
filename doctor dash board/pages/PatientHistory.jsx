import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientHistory } from '../api/index'
import './PatientHistory.css'

function VisitCard({ visit }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="visit-card card">
      <button className="vc-header" onClick={() => setOpen(o => !o)}>
        <div className="vch-left">
          <span className="visit-dot" />
          <div>
            <div className="vch-date">{visit.date}</div>
            <div className="vch-diag">{visit.diagnosis}</div>
            <div className="vch-meta">{visit.doctor} · {visit.department}</div>
          </div>
        </div>
        <div className="vch-right">
          <span className={`badge ${visit.type === 'inpatient' ? 'badge-warning' : 'badge-primary'}`}>
            {visit.type === 'inpatient' ? 'Inpatient' : 'Outpatient'}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            {open ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
          </svg>
        </div>
      </button>
      {open && (
        <div className="vc-body">
          <div className="vc-grid">
            <div>
              <div className="vcg-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Vitals
              </div>
              <div className="vitals-mini">
                {Object.entries(visit.vitals ?? {}).map(([k, v]) => (
                  <div key={k} className="vm-row"><span className="vm-key">{k.toUpperCase()}</span><span className="vm-val">{v}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="vcg-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/></svg>
                Medications
              </div>
              <ul className="vc-list">{(visit.medications ?? []).map(m => <li key={m}>{m}</li>)}</ul>
            </div>
            <div>
              <div className="vcg-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                Reports
              </div>
              <ul className="vc-list">{(visit.reports ?? []).map(r => <li key={r}>{r}</li>)}</ul>
            </div>
          </div>
          <div className="vc-notes">
            <div className="vcg-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
              Doctor's Notes
            </div>
            <p>{visit.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PatientHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => { getPatientHistory(id).then(setData).catch(() => {}) }, [id])

  const patient = data?.patient ?? {}
  const visits  = data?.visits  ?? []

  if (!data) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading history…</div>

  return (
    <div className="patient-history page-in">
      <div className="ph-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
        <div className="ph-title-row">
          <div className="ph-avatar">{(patient.initials ?? patient.name?.split(' ').map(n => n[0]).join('') ?? '?').slice(0, 2)}</div>
          <div>
            <h1>{patient.name}</h1>
            <p>{patient.age}y · {patient.gender} · {patient.bloodGroup}</p>
          </div>
        </div>
        <div className="ph-header-stats">
          <div className="ph-hstat"><span>Visits</span><b>{visits.length}</b></div>
          <div className="ph-hstat"><span>Patient ID</span><b>{patient.id}</b></div>
        </div>
      </div>

      <div className="ph-sum-grid stagger-children">
        {[
          { label: 'Total Visits',        value: visits.length,                color: 'var(--color-primary)' },
          { label: 'Current Medications', value: (patient.medications ?? []).length, color: 'var(--color-success)' },
          { label: 'Known Allergies',     value: (patient.allergies ?? []).length,   color: 'var(--color-danger)' },
          { label: 'Last Visit',          value: visits[0]?.date ?? '—',        color: 'var(--color-accent)' },
        ].map(s => (
          <div key={s.label} className="ph-sum-card card">
            <div className="phsc-val" style={{ color: s.color }}>{s.value}</div>
            <div className="phsc-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="ph-timeline-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          Visit History
        </div>
        <div className="visits-list">
          {visits.map(v => <VisitCard key={v.id} visit={v} />)}
        </div>
      </div>
    </div>
  )
}
