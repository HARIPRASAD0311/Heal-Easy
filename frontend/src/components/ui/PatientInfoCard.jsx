import { useEffect } from "react";
import { getPatient } from "../../data/mockData";
import InfoRow from "../ui/InfoRow";

function AgeIcon() { return <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>; }
function GenderIcon() { return <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>; }
function PhoneIcon() { return <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>; }
function EmailIcon() { return <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>; }

export default function PatientInfoCard({ patientId, onNameResolved }) {
  const patient = getPatient(patientId);

  useEffect(() => {
    if (patient?.name && onNameResolved) onNameResolved(patient.name);
  }, [patient?.name, onNameResolved]);

  if (!patient) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
      <p className="text-sm text-slate-500">No patient record found.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{patient.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="font-bold text-white text-base leading-tight">{patient.name}</p>
          <p className="text-teal-100 text-xs mt-0.5">Patient ID: {patientId}</p>
        </div>
      </div>
      <div className="px-5 py-2">
        <InfoRow label="Age"    value={patient.age ? `${patient.age} years` : null} icon={<AgeIcon />} />
        <InfoRow label="Gender" value={patient.gender}                               icon={<GenderIcon />} />
        <InfoRow label="Phone"  value={patient.phone}                                icon={<PhoneIcon />} />
        <InfoRow label="Email"  value={patient.email}                                icon={<EmailIcon />} />
      </div>
    </div>
  );
}
