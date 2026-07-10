export default function EmptyState({ title = "No data found", subtitle = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-700 mb-1">{title}</p>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
