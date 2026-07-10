import { useState } from "react";
import DashboardHeader  from "../../components/layout/DashboardHeader";
import PatientInfoCard  from "../../components/ui/PatientInfoCard";
import QueueStatusCard  from "../../components/ui/QueueStatusCard";
import QuickActionButton from "../../components/ui/QuickActionButton";

// ── Icons ─────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
function QueueIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

// ── Hardcoded queue data (from database/data/queue.json — PAT-A1B2C3D4) ──
const DEMO_QUEUE = {
  tokenNumber:   1,
  position:      1,
  department:    "Cardiology",
  estimatedWait: 0,
  status:        "completed",
  doctorName:    "Dr. Vikram Iyer",
  doctorSpecialty: "Cardiologist",
  totalInQueue:  3,
};

// ── Hardcoded medical history (from database/data/consultations.json) ──────
const DEMO_HISTORY = [
  {
    id:         "CON-C001A001",
    date:       "28 Oct 2024",
    doctor:     "Dr. Vikram Iyer",
    department: "Cardiology",
    complaint:  "Chest pain",
    status:     "completed",
    prescription: "Aspirin 75mg · Atorvastatin 20mg",
    followUp:   "04 Nov 2024",
  },
];

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed:       "bg-teal-100 text-teal-700",
    in_progress:     "bg-blue-100 text-blue-700",
    in_consultation: "bg-blue-100 text-blue-700",
    waiting:         "bg-amber-100 text-amber-700",
    scheduled:       "bg-slate-100 text-slate-600",
    cancelled:       "bg-red-100 text-red-600",
  };
  const labels = {
    completed:       "Completed",
    in_progress:     "In Progress",
    in_consultation: "In Consultation",
    waiting:         "Waiting",
    scheduled:       "Scheduled",
    cancelled:       "Cancelled",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
      ${map[status] ?? map.scheduled}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Hardcoded Queue Section ───────────────────────────────────────
function HardcodedQueueSection() {
  const q = DEMO_QUEUE;
  const isNext = q.position === 1 && q.status === "waiting";

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden
      ${isNext ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-white"}`}>

      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Queue Status</p>
        <StatusBadge status={q.status} />
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        {/* Token */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-2 shadow-sm">
            <span className="font-bold text-xl text-white">{q.tokenNumber}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium text-center">Token</p>
        </div>

        {/* Department */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-tight">{q.department}</p>
          <p className="text-xs text-slate-400 mt-0.5">Department</p>
        </div>

        {/* Wait */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-tight">
            {q.estimatedWait > 0 ? `~${q.estimatedWait} min` : "Done"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Est. wait</p>
        </div>
      </div>

      {/* Doctor */}
      <div className="px-5 pb-4">
        <div className="rounded-xl bg-slate-100 px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center flex-shrink-0">
            <span className="text-teal-700 font-bold text-sm">
              {q.doctorName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">{q.doctorName}</p>
            <p className="text-xs text-slate-500">{q.doctorSpecialty}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hardcoded Medical History Section ────────────────────────────
function HardcodedHistorySection() {
  return (
    <div className="space-y-3">
      {DEMO_HISTORY.map((c) => (
        <div key={c.id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{c.complaint}</p>
              <p className="text-xs text-slate-400 mt-0.5">{c.date} · {c.department}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>

          {/* Doctor */}
          <p className="text-xs text-slate-500 mb-2">
            <span className="font-semibold">Doctor:</span> {c.doctor}
          </p>

          {/* Prescription */}
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Prescription
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">{c.prescription}</p>
          </div>

          {/* Follow-up */}
          {c.followUp && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" />
              </svg>
              <p className="text-xs text-teal-600 font-semibold">Follow-up: {c.followUp}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("");
  const patientId = localStorage.getItem("patientId") ?? "";

  return (
    <div className="min-h-screen bg-slate-50">

      <DashboardHeader patientName={patientName} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Welcome strip */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-5 text-white shadow-sm">
          <p className="text-teal-100 text-sm mb-0.5">Welcome back 👋</p>
          <h1 className="font-bold text-xl leading-tight">
            {patientName ? patientName : "Your dashboard"}
          </h1>
          <p className="text-teal-200 text-xs mt-1">
            City General Hospital · OPD
          </p>
        </div>

        {/* Patient information */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Patient Information
          </h2>
          {patientId ? (
            <PatientInfoCard patientId={patientId} onNameResolved={setPatientName} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
              <p className="text-sm text-slate-500">No patient session found.</p>
              <a href="/login" className="mt-3 inline-block text-teal-600 text-sm font-semibold hover:underline">
                Please log in again
              </a>
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <QuickActionButton
              icon={<MicIcon />}
              label="Start Voice Consultation"
              description="Describe your symptoms in your own language"
              to="/patient/voice"
              accent="teal"
            />
            <QuickActionButton
              icon={<QueueIcon />}
              label="View Queue"
              description="Check your position and estimated wait time"
              to="/patient/queue"
              accent="blue"
            />
            <QuickActionButton
              icon={<HistoryIcon />}
              label="Medical History"
              description="View your past visits and clinical notes"
              to="/patient/history"
              accent="purple"
            />
          </div>
        </section>

        {/* Queue status — hardcoded from DB */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Queue Status
          </h2>
          <HardcodedQueueSection />
        </section>

        {/* Medical history — hardcoded from DB */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Medical History
          </h2>
          <HardcodedHistorySection />
        </section>

        <div className="h-4" />
      </main>
    </div>
  );
}
