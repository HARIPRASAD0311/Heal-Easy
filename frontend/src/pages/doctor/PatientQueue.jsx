import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import { getDoctorQueue } from "../../services/doctorService";

// ── Status Badge ──────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    waiting:          "bg-amber-100 text-amber-700",
    "in-progress":    "bg-blue-100 text-blue-700",
    in_consultation:  "bg-blue-100 text-blue-700",
    completed:        "bg-teal-100  text-teal-700",
    cancelled:        "bg-slate-100 text-slate-500",
    urgent:           "bg-red-100   text-red-700",
  };
  const labels = {
    waiting:          "Waiting",
    "in-progress":    "In Progress",
    in_consultation:  "In Consultation",
    completed:        "Completed",
    cancelled:        "Cancelled",
    urgent:           "Urgent",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
      ${map[status] ?? map.waiting}`}>
      {labels[status] ?? status}
    </span>
  );
}

const DEPARTMENTS = ["All", "General", "Cardiology", "Orthopedics", "Pediatrics", "Neurology"];

// ── Icons ─────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}
function RefreshIcon({ spinning }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export default function PatientQueue() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId") ?? "";

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueue = useCallback(
    () => (doctorId ? getDoctorQueue(doctorId) : Promise.resolve([])),
    [doctorId]
  );

  const { data, loading, error, refetch } = useFetch(fetchQueue, [doctorId]);
  const patients = Array.isArray(data) ? data : [];

  // Client-side filter — handle both DynamoDB field variants
  const filtered = patients.filter((p) => {
    const name = p.name ?? p.patient_name ?? "";
    const token = (p.tokenNumber ?? p.token_number ?? "").toString();
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      token.includes(search);
    const dept = p.department ?? "";
    const matchDept = department === "All" || dept === department;
    return matchSearch && matchDept;
  });

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function openConsultation(p) {
    navigate(`/doctor/consultation?patientId=${p.patientId ?? p.id}`);
  }

  function openDetails(p) {
    navigate(`/doctor/patient/${p.patientId ?? p.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Patient Queue</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? "Loading…" : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""} shown`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200
              text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshIcon spinning={refreshing} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or token…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          {/* Department filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium
              text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <Spinner message="Loading queue…" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState title="No patients found" subtitle="Try adjusting your search or filter." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Token</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Age / Gender</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Wait</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id ?? p.queueId ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="inline-flex w-9 h-9 rounded-xl bg-slate-100 items-center justify-center font-bold text-slate-700 text-sm">
                          {p.tokenNumber ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-teal-700 font-bold text-sm">
                              {(p.name ?? p.patientName ?? "P").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{p.name ?? p.patientName ?? "—"}</p>
                            <p className="text-xs text-slate-400">{p.patientId ?? p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {p.age ? `${p.age}y` : "—"} {p.gender ? `· ${p.gender}` : ""}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.department ?? "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {p.estimatedWait ? `~${p.estimatedWait} min` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openDetails(p)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold
                              text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => openConsultation(p)}
                            disabled={p.status === "completed" || p.status === "cancelled"}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold
                              hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Consult
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <div key={p.id ?? p.queueId ?? i} className="px-4 py-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm flex-shrink-0">
                    {p.tokenNumber ?? "—"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name ?? p.patientName ?? "—"}</p>
                    <p className="text-xs text-slate-400">{p.department} · {p.age}y</p>
                    <div className="mt-1"><StatusBadge status={p.status} /></div>
                  </div>
                  <button
                    onClick={() => openConsultation(p)}
                    disabled={p.status === "completed" || p.status === "cancelled"}
                    className="flex-shrink-0 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold
                      hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Consult
                  </button>
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
