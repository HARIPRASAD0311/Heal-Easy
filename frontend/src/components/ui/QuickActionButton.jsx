import { useNavigate } from "react-router-dom";

export default function QuickActionButton({ icon, label, description, to, onClick, accent = "teal" }) {
  const navigate = useNavigate();

  const accentMap = {
    teal:   "bg-teal-50   hover:bg-teal-100   border-teal-100   text-teal-700",
    blue:   "bg-blue-50   hover:bg-blue-100   border-blue-100   text-blue-700",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700",
  };

  const iconMap = {
    teal:   "bg-teal-100   text-teal-600",
    blue:   "bg-blue-100   text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  function handleClick() {
    if (onClick) { onClick(); return; }
    if (to) navigate(to);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
        active:scale-[0.98] text-left ${accentMap[accent]}`}
    >
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconMap[accent]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-tight">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>}
      </div>
      <svg className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
