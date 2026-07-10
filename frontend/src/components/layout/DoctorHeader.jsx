import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function BellIcon({ count }) {
  return (
    <div className="relative">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  );
}

export default function DoctorHeader({ doctorName = "", notifCount = 0, onNotifClick }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorId");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

        {/* Logo + role badge */}
        <div className="flex items-center gap-2.5">
          <Link to="/doctor/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">HealEasy</span>
          </Link>
          <span className="hidden sm:inline-flex text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Doctor
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/doctor/dashboard"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Dashboard
          </Link>
          <Link to="/doctor/queue"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Queue
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {doctorName && (
            <span className="hidden sm:block text-sm font-medium text-slate-600 truncate max-w-[140px]">
              Dr. {doctorName}
            </span>
          )}
          <button
            onClick={onNotifClick}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <BellIcon count={notifCount} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
              text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
