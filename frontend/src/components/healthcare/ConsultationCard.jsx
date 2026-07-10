import Badge from "../shared/Badge";

/**
 * ConsultationCard — summary card for a single consultation.
 *
 * Props:
 *   consultation — { id, date, patientName, doctorName, diagnosis, status, department }
 *   onClick
 *   actions
 */
export default function ConsultationCard({ consultation = {}, onClick, actions }) {
  const statusMap = {
    completed:    "teal",
    pending:      "amber",
    "in-progress": "blue",
    cancelled:    "slate",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4
        ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight truncate">
            {consultation.patientName ?? "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{consultation.date ?? "—"}</p>
        </div>
        <Badge variant={statusMap[consultation.status] ?? "slate"} className="flex-shrink-0">
          {consultation.status ?? "—"}
        </Badge>
      </div>

      {/* Diagnosis */}
      {consultation.diagnosis && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-3 leading-snug">
          {consultation.diagnosis}
        </p>
      )}

      {/* Bottom meta */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{consultation.department ?? ""}</span>
        <span>Dr. {consultation.doctorName ?? "—"}</span>
      </div>

      {actions && <div className="mt-3 pt-3 border-t border-slate-100">{actions}</div>}
    </div>
  );
}
