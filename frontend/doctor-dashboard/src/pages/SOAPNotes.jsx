import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSOAPNotes, approveSOAP, rejectSOAP, regenerateSOAP, saveSOAPDraft } from '../api/index'
import './SOAPNotes.css'

const chevD = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M6 9l6 6 6-6"/></svg>
const chevU = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 15l-6-6-6 6"/></svg>
const iconEdit = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const iconCheck = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M20 6 9 17l-5-5"/></svg>
const iconSave = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
const iconDown = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const iconX = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
const iconRefresh = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M23 4v6h-6"/><path d="M20.5 15a9 9 0 1 1-2.8-9.8L23 10"/></svg>

function EditField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  useEffect(() => setVal(value), [value])
  return (
    <div className="ef">
      <div className="ef-label">{label}</div>
      {editing ? (
        <div className="ef-edit-wrap">
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={Math.max(3, (val ?? '').split('\n').length + 1)} />
          <div className="ef-edit-btns">
            <button className="btn btn-success btn-sm" onClick={() => { onChange(val); setEditing(false) }}>{iconCheck} Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setVal(value); setEditing(false) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="ef-value" onClick={() => setEditing(true)}>
          <span>{val ?? '—'}</span>
          <span className="ef-edit-icon">{iconEdit}</span>
        </div>
      )}
    </div>
  )
}

function Section({ title, color, iconPath, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`ss card ss-${color}`}>
      <button className="ss-head" onClick={() => setOpen(o => !o)}>
        <div className="ss-head-left">
          <span className={`ss-icon ss-icon-${color}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">{iconPath}</svg>
          </span>
          <span className="ss-title">{title}</span>
        </div>
        {open ? chevU : chevD}
      </button>
      {open && <div className="ss-body">{children}</div>}
    </div>
  )
}

export default function SOAPNotes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [soap,     setSoap]     = useState(null)
  const [patient,  setPatient]  = useState(null)
  const [approved, setApproved] = useState(false)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    getSOAPNotes(id).then(data => {
      setSoap(data.notes ?? data)
      setPatient(data.patient ?? null)
    }).catch(() => {})
  }, [id])

  const upd = (path, val) => {
    setSoap(s => {
      const parts = path.split('.')
      const copy = { ...s, [parts[0]]: { ...s[parts[0]], [parts[1]]: val } }
      return copy
    })
  }

  const handleApprove = async () => {
    setSaving(true)
    await approveSOAP(id, soap).catch(() => {})
    setSaving(false)
    setApproved(true)
    setTimeout(() => navigate('/doctor/queue'), 1800)
  }

  if (!soap) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading SOAP notes…</div>

  return (
    <div className="soap-notes page-in">
      <div className="sn-header">
        <div>
          <p className="eyebrow">AI-Generated</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 600 }}>
            SOAP Notes {patient ? `— ${patient.name}` : ''}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-small)', marginTop: 4 }}>
            {patient ? `${patient.age}y · ${patient.gender} · ${patient.chiefComplaint}` : ''}
          </p>
        </div>
        <div className="sn-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => regenerateSOAP(id).then(d => setSoap(d.notes ?? d)).catch(() => {})}>{iconRefresh} Regenerate</button>
          <button className="btn btn-ghost btn-sm" onClick={() => saveSOAPDraft(id, soap).catch(() => {})}>{iconSave} Save Draft</button>
          <button className="btn btn-ghost btn-sm">{iconDown} Export PDF</button>
        </div>
      </div>

      {approved && (
        <div className="sn-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>
          Notes approved and saved to patient record. Returning to queue…
        </div>
      )}

      <div className="sn-layout">
        <div className="sn-main">
          <Section title="S — Subjective" color="blue" iconPath={<><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4"/></>}>
            <EditField label="Chief Complaint"            value={soap.subjective?.chiefComplaint}          onChange={v => upd('subjective.chiefComplaint', v)} />
            <EditField label="History of Present Illness" value={soap.subjective?.historyOfPresentIllness} onChange={v => upd('subjective.historyOfPresentIllness', v)} />
            <EditField label="Review of Systems"          value={soap.subjective?.reviewOfSystems}         onChange={v => upd('subjective.reviewOfSystems', v)} />
            <EditField label="Past Medical History"       value={soap.subjective?.pastMedicalHistory}      onChange={v => upd('subjective.pastMedicalHistory', v)} />
            <EditField label="Medications"                value={soap.subjective?.medications}             onChange={v => upd('subjective.medications', v)} />
            <EditField label="Allergies"                  value={soap.subjective?.allergies}               onChange={v => upd('subjective.allergies', v)} />
          </Section>
          <Section title="O — Objective" color="teal" iconPath={<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>}>
            <EditField label="Vital Signs"          value={soap.objective?.vitals}             onChange={v => upd('objective.vitals', v)} />
            <EditField label="Physical Examination" value={soap.objective?.physicalExamination} onChange={v => upd('objective.physicalExamination', v)} />
            <EditField label="Diagnostic Results"   value={soap.objective?.diagnosticResults}  onChange={v => upd('objective.diagnosticResults', v)} />
          </Section>
          <Section title="A — Assessment" color="gold" iconPath={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></>}>
            <EditField label="Primary Diagnosis"      value={soap.assessment?.primaryDiagnosis}    onChange={v => upd('assessment.primaryDiagnosis', v)} />
            <EditField label="Differential Diagnoses" value={soap.assessment?.differentialDiagnosis} onChange={v => upd('assessment.differentialDiagnosis', v)} />
            <EditField label="Clinical Impression"    value={soap.assessment?.clinicalImpression}  onChange={v => upd('assessment.clinicalImpression', v)} />
          </Section>
          <Section title="P — Plan" color="green" iconPath={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}>
            <EditField label="Diagnostics Ordered"         value={soap.plan?.diagnostics}      onChange={v => upd('plan.diagnostics', v)} />
            <EditField label="Medications & Interventions" value={soap.plan?.medications}      onChange={v => upd('plan.medications', v)} />
            <EditField label="Referrals"                   value={soap.plan?.referrals}        onChange={v => upd('plan.referrals', v)} />
            <EditField label="Patient Education"           value={soap.plan?.patientEducation} onChange={v => upd('plan.patientEducation', v)} />
            <EditField label="Follow-up"                   value={soap.plan?.followUp}         onChange={v => upd('plan.followUp', v)} />
          </Section>
        </div>

        <div className="sn-sidebar">
          <div className="card sn-action-card">
            <div className="sna-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
              <h3>Doctor Actions</h3>
            </div>
            <div className="sna-meta">
              <div className="sna-row"><span>Patient</span><strong>{patient?.name ?? '—'}</strong></div>
              <div className="sna-row"><span>Date</span><strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
              <div className="sna-row"><span>Status</span><span className="badge badge-warning">Pending Review</span></div>
            </div>
            <div className="sna-btns">
              <button className="btn btn-success btn-block" onClick={handleApprove} disabled={saving}>
                {iconCheck} {saving ? 'Saving…' : 'Approve & Save Record'}
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => saveSOAPDraft(id, soap).catch(() => {})}>{iconSave} Save Draft</button>
              <button className="btn btn-ghost btn-block">{iconDown} Export as PDF</button>
              <button className="btn btn-danger btn-block" onClick={() => rejectSOAP(id).catch(() => {})}>{iconX} Reject Notes</button>
            </div>
          </div>

          <div className="card sna-conf">
            <div className="sna-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 15h.01"/></svg>
              <h3>AI Confidence</h3>
            </div>
            {(soap.confidence ?? []).map(c => (
              <div key={c.label} className="conf-row">
                <span className="conf-label">{c.label}</span>
                <div className="conf-track"><div className="conf-fill" style={{ width: `${c.value}%` }} /></div>
                <span className="conf-pct">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
