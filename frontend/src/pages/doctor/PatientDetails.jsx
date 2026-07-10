import { useParams, useNavigate } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import InfoRow from "../../components/ui/InfoRow";
import EmptyState from "../../components/ui/EmptyState";
import { getPatient, getPatientConsultations } from "../../data/mockData";
import { StatusBadge } from "./PatientQueue";

function VitalCard({ label, value, unit, color = "bg-slate-50 border-slate-100", textColor = "text-slate-700" }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col items-center gap-1 text-center ${color}`}>
      <p className={`text-xl font-black leading-none ${textColor}`}>{value ?? "—"}{value && unit ? <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span> : null}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const patient  = getPatient(patientId);
  const history  = getPatientConsultations(patientId);

  if (!patient) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-slate-500">Patient not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-teal-600 font-semibold text-sm hover:underline">← Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Queue
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Patient Details</h1>
          </div>
          <button onClick={() => navigate(`/doctor/consultation?patientId=${patientId}`)} className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 shadow-sm">
            Start Consultation →
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-2xl">{patient.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">{patient.name}</p>
              <p className="text-teal-100 text-xs mt-0.5">{patient.age} yrs · {patient.gender}</p>
              <p className="text-teal-200 text-xs mt-0.5">ID: {patientId}</p>
            </div>
          </div>
          <div className="px-5 py-2">
            <InfoRow label="Phone"          value={patient.phone}
              icon={<svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>} />
            <InfoRow label="Blood Group"     value={patient.blood_group}
              icon={<svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>} />
            <InfoRow label="Medical History" value={patient.medical_history}
              icon={<svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>} />
          </div>
        </div>

        {/* Vitals — demo values */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Vital Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <VitalCard label="Heart Rate"    value="78"     unit="bpm"  color="bg-red-50 border-red-100"     textColor="text-red-700" />
            <VitalCard label="Temperature"   value="98.6"   unit="°F"   color="bg-amber-50 border-amber-100" textColor="text-amber-700" />
            <VitalCard label="Blood Pressure" value="120/80" unit="mmHg" color="bg-blue-50 border-blue-100"   textColor="text-blue-700" />
            <VitalCard label="Oxygen Sat."   value="98"     unit="%"    color="bg-teal-50 border-teal-100"   textColor="text-teal-700" />
            <VitalCard label="Weight"        value="70"     unit="kg"   color="bg-purple-50 border-purple-100" textColor="text-purple-700" />
          </div>
        </section>

        {/* Consultation history */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Consultation History</h2>
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <EmptyState title="No past consultations" subtitle="First visit for this patient." />
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map(c => (
                <div key={c.consultationId} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-800">{c.consultation_date}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">{c.chief_complaint}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.doctor_name} · {c.department}</p>
                  {c.prescription && (
                    <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500 leading-relaxed">{c.prescription}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="h-4" />
      </main>
    </div>
  );
}
