import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import useFetch        from "../../hooks/useFetch";
import { getPatientById } from "../../services/patientService";
import Spinner      from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import InfoRow      from "../../components/ui/InfoRow";

// ── Icons ─────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
function GenderIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

// ── Section card wrapper ──────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{title}</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-2">
        {children}
      </div>
    </section>
  );
}

export default function Profile() {
  const navigate  = useNavigate();
  const patientId = localStorage.getItem("patientId") ?? "";

  const { data: patient, loading, error, refetch } = useFetch(
    () => getPatientById(patientId),
    [patientId],
    { skip: !patientId }
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("patientId");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader patientName={patient?.name} />

      <main className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Back + title */}
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-4 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <Spinner message="Loading profile…" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        ) : (
          <>
            {/* Avatar strip */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl px-5 py-5 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-2xl">
                  {patient?.name?.charAt(0)?.toUpperCase() ?? "P"}
                </span>
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">{patient?.name ?? "—"}</p>
                <p className="text-teal-100 text-xs mt-0.5">Patient ID: {patientId || "—"}</p>
              </div>
            </div>

            {/* Personal details */}
            <Section title="Personal Details">
              <InfoRow label="Full name"    value={patient?.name}                     icon={<UserIcon />} />
              <InfoRow label="Date of birth" value={patient?.dob}                     icon={<CalIcon />} />
              <InfoRow label="Age"          value={patient?.age ? `${patient.age} yrs` : null} icon={<CalIcon />} />
              <InfoRow label="Gender"       value={patient?.gender}                   icon={<GenderIcon />} />
            </Section>

            {/* Contact info */}
            <Section title="Contact Information">
              <InfoRow label="Phone"   value={patient?.phone}   icon={<PhoneIcon />} />
              <InfoRow label="Email"   value={patient?.email}   icon={<EmailIcon />} />
              <InfoRow label="Address" value={patient?.address} icon={<LocationIcon />} />
            </Section>

            {/* Medical history placeholder */}
            <Section title="Medical History">
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium text-center">No medical records available.</p>
              </div>
            </Section>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full bg-white text-rose-600 border border-slate-200 py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                Log Out
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}