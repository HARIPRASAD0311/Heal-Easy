import Badge from "../shared/Badge";

/**
 * AISummaryCard — displays AI-generated suggestions with confidence.
 *
 * Props:
 *   summary, confidence (0–1), urgency, department, diagnosis, treatment, prescription
 *   onApprove, onReject, onViewFull — action callbacks
 */
export default function AISummaryCard({
  summary,
  confidence,
  urgency,
  department,
  diagnosis,
  treatment,
  prescription,
  onApprove,
  onReject,
  onViewFull,
}) {
  const pct = Math.round((confidence ?? 0) * 100);
  const confColor =
    pct >= 80 ? "from-teal-400 to-teal-600" :
    pct >= 60 ? "from-amber-400 to-amber-600" :
                "from-red-400 to-red-600";
  const urgencyVariant = {
    low: "teal", medium: "amber", high: "orange", critical: "red",
  }[urgency?.toLowerCase()] ?? "amber";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">AI Analysis</p>
          <p className="text-white text-sm leading-snug mt-0.5 line-clamp-2">
            {summary ?? "No summary available."}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Confidence bar */}
        {confidence != null && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-medium">Confidence</span>
              <span className="font-bold text-slate-700">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${confColor} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Urgency + Department */}
        <div className="flex items-center justify-between gap-3">
          {urgency && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Urgency</span>
              <Badge variant={urgencyVariant}>{urgency}</Badge>
            </div>
          )}
          {department && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Dept.</span>
              <Badge variant="blue">{department}</Badge>
            </div>
          )}
        </div>

        {/* Suggestion rows */}
        {diagnosis && <SuggRow label="Diagnosis" value={diagnosis} />}
        {treatment  && <SuggRow label="Treatment" value={treatment} />}
        {prescription && <SuggRow label="Prescription" value={prescription} />}
      </div>

      {/* Action footer */}
      {(onApprove || onReject || onViewFull) && (
        <div className="px-5 pb-4 flex gap-2">
          {onViewFull && (
            <button onClick={onViewFull}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
              View Full
            </button>
          )}
          {onReject && (
            <button onClick={onReject}
              className="flex-1 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
              Reject
            </button>
          )}
          {onApprove && (
            <button onClick={onApprove}
              className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors">
              Approve
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SuggRow({ label, value }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-xs font-bold text-slate-400 w-24 flex-shrink-0 pt-0.5">{label}</span>
      <p className="text-xs text-slate-700 leading-snug flex-1">{value}</p>
    </div>
  );
}
