export default function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      {icon && (
        <span className="mt-0.5 w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}
