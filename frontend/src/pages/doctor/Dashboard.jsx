import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import useFetch from "../../hooks/useFetch";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import {
  getDoctorStats,
  getDoctorProfile,
  getDoctorNotifications,
  markNotificationRead,
} from "../../services/doctorService";

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = "teal", sub }) {
  const colors = {
    teal:   "bg-teal-50  text-teal-700  border-teal-100",
    blue:   "bg-blue-50  text-blue-700  border-blue-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  const iconColors = {
    teal:   "bg-teal-100  text-teal-600",
    blue:   "bg-blue-100  text-blue-600",
    amber:  "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${colors[accent]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">{value ?? "—"}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Notification Item ─────────────────────────────────────────────
function NotifItem({ notif, onRead }) {
  const typeColors = {
    info:    "bg-blue-100 text-blue-600",
    warning: "bg-amber-100 text-amber-600",
    success: "bg-teal-100 text-teal-600",
    urgent:  "bg-red-100 text-red-600",
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 transition-colors
      ${notif.read ? "opacity-60" : "bg-white"}`}>
      <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
        ${typeColors[notif.type] ?? typeColors.info}`}>
        {notif.type === "urgent" ? "!" : notif.type === "warning" ? "⚠" : "i"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{notif.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
      </div>
      {!notif.read && (
        <button
          onClick={() => onRead(notif.id)}
          className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-1.5"
          aria-label="Mark as read"
        />
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────
function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId") ?? "";
  const [showNotifs, setShowNotifs] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  const { data: profile } = useFetch(
    () => getDoctorProfile(doctorId),
    [doctorId],
    { skip: !doctorId }
  );

  const { data: stats, loading: statsLoading, error: statsError } = useFetch(
    () => getDoctorStats(doctorId),
    [doctorId],
    { skip: !doctorId }
  );

  const { data: notifs, refetch: refetchNotifs } = useFetch(
    () => getDoctorNotifications(doctorId),
    [doctorId],
    { skip: !doctorId }
  );

  const notifications = Array.isArray(notifs) ? notifs : [];
  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;

  async function handleMarkRead(id) {
    setReadIds((prev) => new Set([...prev, id]));
    try {
      await markNotificationRead(doctorId, id);
      refetchNotifs();
    } catch {
      // optimistic update stays
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader
        doctorName={profile?.name}
        notifCount={unreadCount}
        onNotifClick={() => setShowNotifs((v) => !v)}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 text-white shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm mb-0.5">Good morning 👨‍⚕️</p>
            <h1 className="font-bold text-xl leading-tight">
              Dr. {profile?.name ?? "Doctor"}
            </h1>
            <p className="text-teal-200 text-xs mt-1">
              {profile?.department ?? "General Medicine"} · City General Hospital
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <p className="text-teal-100 text-xs">Today</p>
            <p className="font-bold text-white text-lg">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Notifications panel */}
        {showNotifs && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notifications</p>
              <button onClick={() => setShowNotifs(false)}
                className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={{ ...n, read: n.read || readIds.has(n.id) }}
                  onRead={handleMarkRead}
                />
              ))
            )}
          </div>
        )}

        {/* Stats grid */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Today's Overview
          </h2>
          {statsLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <Spinner message="Loading stats…" />
            </div>
          ) : statsError ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <ErrorMessage message={statsError} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Today's Patients"
                value={stats?.todayPatients}
                icon={<UsersIcon />}
                accent="teal"
                sub="Scheduled today"
              />
              <StatCard
                label="Total Consultations"
                value={stats?.totalConsultations}
                icon={<ClipboardIcon />}
                accent="blue"
                sub="All time"
              />
              <StatCard
                label="Pending Approvals"
                value={stats?.pendingApprovals}
                icon={<ClockIcon />}
                accent="amber"
                sub="Awaiting review"
              />
              <StatCard
                label="Avg. Duration"
                value={stats?.avgDuration ? `${stats.avgDuration}m` : null}
                icon={<ChartIcon />}
                accent="purple"
                sub="Per consultation"
              />
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/doctor/queue")}
              className="flex items-center gap-4 p-4 rounded-xl border border-teal-100 bg-teal-50
                hover:bg-teal-100 transition-colors text-left active:scale-[0.98]"
            >
              <span className="w-11 h-11 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                <UsersIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">View Patient Queue</p>
                <p className="text-xs text-slate-500 mt-0.5">See today's waiting patients</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate("/doctor/consultation")}
              className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50
                hover:bg-blue-100 transition-colors text-left active:scale-[0.98]"
            >
              <span className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <ClipboardIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">Start Consultation</p>
                <p className="text-xs text-slate-500 mt-0.5">Open next patient in queue</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        <div className="h-4" />
      </main>
    </div>
  );
}
