import { useParams, useNavigate } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import InfoRow from "../../components/ui/InfoRow";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import { getPatientDetails, getPatientHistory } from "../../services/doctorService";
import { StatusBadge } from "./PatientQueue";

// ── Vital Card ────────────────────────────────────────────────────
function VitalCard({ label, value, unit, icon, accent = "teal" }) {
  const colors = {
    teal:  "bg-teal-50  border-teal-100",
    blue:  "bg-blue-50  border-blue-100",
    amber: "bg-amber-50 border-amber-100",
    red:   "bg-red-50   border-red-100",
    purple:"bg-purple-50 border-purple-100",
  };
  const iconColors = {
    teal:  "text-teal-600",
    blue:  "text-blue-600",
    amber: "text-amber-600",
    red:   "text-red-600",
    purple:"text-purple-600",
  };
  return (
    <div className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center ${colors[accent]}`}>
      <span className={`${iconColors[accent]}`}>{icon}</span>
      <div>
        <p className="text-xl font-black text-slate-800 leading-none">
          {value ?? "—"}
          {value && unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{title}</h2>
      {children}
    </section>
  );
}

// ── Icons ─────────────────────────────────────────────────────────
function HeartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}
function TempIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    </svg>
  );
}
function PressureIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function OxygenIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function WeightIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99.203 1.99.377 3 .52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 5.491Z" />
    </svg>
  );
}

export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { data: patient, loading, error, refetch } = useFetch(
    () => getPatientDetails(patientId),
    [patientId]
  );

  const { data: history, loading: histLoading } = useFetch(
    () => getPatientHistory(patientId),
    [patientId]
  );

  const consultations = Array.isArray(history) ? history : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Back + actions */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Queue
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Patient Details</h1>
          </div>
          <button
            onClick={() => navigate(`/doctor/consultation?patientId=${patientId}`)}
            className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold
              hover:bg-teal-700 transition-colors shadow-sm"
          >
            Start Consultation →
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <Spinner message="Loading patient details…" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-2xl">
                    {patient?.name?.charAt(0)?.toUpperCase() ?? "P"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg leading-tight">{patient?.name ?? "—"}</p>
                  <p className="text-teal-100 text-xs mt-0.5">
                    {patient?.age ? `${patient.age} yrs` : ""} {patient?.gender ? `· ${patient.gender}` : ""}
                  </p>
                  <p className="text-teal-200 text-xs mt-0.5">ID: {patientId}</p>
                </div>
              </div>
              <div className="px-5 py-2">
                <InfoRow label="Phone" value={patient?.phone}
                  icon={<svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>} />
                <InfoRow label="Blood Group" value={patient?.bloodGroup}
                  icon={<svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>} />
                <InfoRow label="Allergies" value={patient?.allergies}
                  icon={<svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>} />
              </div>
            </div>

            {/* Vitals */}
            <Section title="Vital Information">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <VitalCard label="Heart Rate"   value={patient?.vitals?.heartRate}  unit="bpm" icon={<HeartIcon />}    accent="red" />
                <VitalCard label="Temperature"  value={patient?.vitals?.temperature} unit="°F"  icon={<TempIcon />}    accent="amber" />
                <VitalCard label="Blood Pressure" value={patient?.vitals?.bp}        unit="mmHg" icon={<PressureIcon />} accent="blue" />
                <VitalCard label="Oxygen Sat."  value={patient?.vitals?.spo2}        unit="%"   icon={<OxygenIcon />}  accent="teal" />
                <VitalCard label="Weight"       value={patient?.vitals?.weight}      unit="kg"  icon={<WeightIcon />}  accent="purple" />
              </div>
            </Section>

            {/* Symptoms */}
            <Section title="Current Symptoms">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
                {patient?.symptoms ? (
                  <p className="text-sm text-slate-700 leading-relaxed">{patient.symptoms}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No symptoms recorded yet.</p>
                )}
                {Array.isArray(patient?.symptomTags) && patient.symptomTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {patient.symptomTags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* Consultation history */}
            <Section title="Consultation History">
              {histLoading ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <Spinner message="Loading history…" />
                </div>
              ) : consultations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <EmptyState title="No past consultations" subtitle="First visit for this patient." />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {consultations.map((c, i) => (
                    <div key={c.id ?? i}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-800">{c.date ?? "—"}</p>
                          <StatusBadge status={c.status ?? "completed"} />
                        </div>
                        <p className="text-xs text-slate-500">{c.diagnosis ?? "No diagnosis recorded"}</p>
                        {c.doctor && <p className="text-xs text-slate-400 mt-0.5">Dr. {c.doctor}</p>}
                      </div>
                      <button
                        onClick={() => navigate(`/doctor/record/${c.id}`)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold
                          text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
