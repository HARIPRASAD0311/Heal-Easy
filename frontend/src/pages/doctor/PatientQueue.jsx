import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import EmptyState from "../../components/ui/EmptyState";
import { getDoctorQueueList } from "../../data/mockData";

export function StatusBadge({ status }) {
  const map = { waiting:"bg-amber-100 text-amber-700", "in-progress":"bg-blue-100 text-blue-700", in_consultation:"bg-blue-100 text-blue-700", completed:"bg-teal-100 text-teal-700", cancelled:"bg-slate-100 text-slate-500", urgent:"bg-red-100 text-red-700" };
  const labels = { waiting:"Waiting", "in-progress":"In Progress", in_consultation:"In Consultation", completed:"Completed", cancelled:"Cancelled", urgent:"Urgent" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${map[status] ?? map.waiting}`}>{labels[status] ?? status}</span>;
}

const DEPARTMENTS = ["All","General Medicine","Cardiology","Orthopedics","Pediatrics","Neurology"];

export default function PatientQueue() {
  const navigate  = useNavigate();
  const doctorId  = localStorage.getItem("doctorId") ?? "DOC-EE55FF66";
  const [search, setSearch]       = useState("");
  const [department, setDept]     = useState("All");

  const all      = getDoctorQueueList(doctorId);
  const filtered = all.filter(p => {
    const name  = (p.name ?? p.patient_name ?? "").toLowerCase();
    const token = String(p.tokenNumber ?? p.token_number ?? "");
    const ms = !search || name.includes(search.toLowerCase()) || token.includes(search);
    const md = department === "All" || (p.department ?? "") === department;
    return ms && md;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Patient Queue</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} patient{filtered.length !== 1 ? "s" : ""} shown</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or token…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <select value={department} onChange={e => setDept(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState title="No patients found" subtitle="Try adjusting your search or filter." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Token","Patient","Age / Gender","Department","Status","Wait","Actions"].map(h => (
                      <th key={h} className={`px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.queueId ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="inline-flex w-9 h-9 rounded-xl bg-slate-100 items-center justify-center font-bold text-slate-700 text-sm">{p.tokenNumber ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-teal-700 font-bold text-sm">{(p.name ?? "P").charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{p.name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{p.patientId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.age ? `${p.age}y` : "—"} {p.gender ? `· ${p.gender}` : ""}</td>
                      <td className="px-5 py-4 text-slate-600">{p.department ?? "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{p.estimatedWait > 0 ? `~${p.estimatedWait} min` : "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => navigate(`/doctor/patient/${p.patientId}`)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Details</button>
                          <button onClick={() => navigate(`/doctor/consultation?patientId=${p.patientId}`)} disabled={p.status === "completed" || p.status === "cancelled"} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed">Consult</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <div key={p.queueId ?? i} className="px-4 py-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm flex-shrink-0">{p.tokenNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.department} · {p.age}y</p>
                    <div className="mt-1"><StatusBadge status={p.status} /></div>
                  </div>
                  <button onClick={() => navigate(`/doctor/consultation?patientId=${p.patientId}`)} disabled={p.status === "completed" || p.status === "cancelled"} className="flex-shrink-0 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed">Consult</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="h-4" />
      </main>
    </div>
  );
}
