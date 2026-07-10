import { getPatientQueue } from "../../data/mockData";
import EmptyState from "../ui/EmptyState";

export default function QueueStatusCard({ patientId }) {
  const q = getPatientQueue(patientId);

  if (!q) return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <EmptyState title="Not in any queue" subtitle="Start a voice consultation to get your token." />
    </div>
  );

  const isNext = q.position === 1 && q.status === "waiting";

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${isNext ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-white"}`}>
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Queue Status</p>
        {isNext && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white animate-pulse">YOUR TURN NEXT</span>}
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${isNext ? "bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg" : "bg-slate-100"}`}>
            <span className={`font-bold text-xl ${isNext ? "text-white" : "text-slate-700"}`}>{q.tokenNumber}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium text-center">Token</p>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-tight">{q.department}</p>
          <p className="text-xs text-slate-400 mt-0.5">Department</p>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-tight">{q.estimatedWait > 0 ? `~${q.estimatedWait} min` : "Done"}</p>
          <p className="text-xs text-slate-400 mt-0.5">Est. wait</p>
        </div>
      </div>
      <div className="px-5 pb-4">
        <div className="rounded-xl bg-slate-100 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">Position in queue</p>
          <p className="text-sm font-bold text-slate-800">#{q.position}</p>
        </div>
      </div>
    </div>
  );
}
