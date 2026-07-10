import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import EmptyState from "../../components/ui/EmptyState";
import { getPatientQueue } from "../../data/mockData";

function QueueProgress({ position, total }) {
  if (!position || !total) return null;
  const pct = Math.max(0, Math.min(100, Math.round(((total - position) / total) * 100)));
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Queue progress</span><span>{pct}% ahead of you</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Start</span><span>{total} total</span>
      </div>
    </div>
  );
}

export default function Queue() {
  const navigate  = useNavigate();
  const patientId = localStorage.getItem("patientId") ?? "";
  const queue     = getPatientQueue(patientId);
  const isNext    = queue?.position === 1 && queue?.status === "waiting";

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="max-w-md mx-auto px-4 py-8 space-y-5">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Queue Status</h1>
          <p className="text-sm text-slate-500 mt-1">Your position in the department queue.</p>
        </div>

        {!queue ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState
              title="Not in a queue"
              subtitle="Complete a voice consultation to get your token."
              action={{ label: "Start consultation", onClick: () => navigate("/patient/voice") }}
            />
          </div>
        ) : (
          <>
            {isNext && (
              <div className="bg-teal-600 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">You're next!</p>
                  <p className="text-teal-100 text-xs mt-0.5">Please proceed to the consultation room.</p>
                </div>
              </div>
            )}

            <div className={`rounded-2xl shadow-sm border overflow-hidden ${isNext ? "border-teal-200 bg-teal-50" : "bg-white border-slate-100"}`}>
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{queue.department}</p>
              </div>
              <div className="px-5 py-5 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${isNext ? "bg-gradient-to-br from-teal-500 to-teal-700" : "bg-gradient-to-br from-slate-600 to-slate-800"}`}>
                    <span className="font-black text-2xl text-white tabular-nums">{queue.tokenNumber}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Token</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
                    <span className="font-black text-2xl text-blue-600 tabular-nums">#{queue.position}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Position</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
                    <div className="text-center">
                      <p className="font-black text-lg text-amber-600 tabular-nums leading-none">{queue.estimatedWait > 0 ? queue.estimatedWait : "—"}</p>
                      {queue.estimatedWait > 0 && <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wide mt-0.5">min</p>}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Est. wait</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <QueueProgress position={queue.position} total={queue.totalInQueue} />
              </div>
            </div>

            {queue.doctorName && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold text-base">{queue.doctorName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Assigned Doctor</p>
                  <p className="font-bold text-slate-800 text-sm">{queue.doctorName}</p>
                  {queue.doctorSpecialty && <p className="text-xs text-slate-500">{queue.doctorSpecialty}</p>}
                </div>
              </div>
            )}
          </>
        )}
        <div className="h-4" />
      </main>
    </div>
  );
}
