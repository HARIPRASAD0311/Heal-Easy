/**
 * DepartmentCard — department info card with queue count.
 *
 * Props:
 *   department — { name, description, queueCount, doctorsAvailable, icon? }
 *   onClick
 */
export default function DepartmentCard({ department = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-teal-200 transition-all" : ""}`}
    >
      {/* Icon + name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
          {department.icon ?? (
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-tight">{department.name ?? "—"}</p>
          {department.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{department.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-black text-amber-700">{department.queueCount ?? "—"}</p>
          <p className="text-xs text-amber-600 font-medium">In queue</p>
        </div>
        <div className="bg-teal-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-black text-teal-700">{department.doctorsAvailable ?? "—"}</p>
          <p className="text-xs text-teal-600 font-medium">Doctors</p>
        </div>
      </div>
    </div>
  );
}
