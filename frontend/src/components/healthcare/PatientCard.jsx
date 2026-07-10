import Badge from "../shared/Badge";

/**
 * PatientCard — compact patient summary card.
 *
 * Props:
 *   patient  — { id, name, age, gender, phone, bloodGroup, status }
 *   onClick  — fn
 *   actions  — JSX (buttons placed at bottom)
 *   compact  — smaller horizontal layout
 */
export default function PatientCard({ patient = {}, onClick, actions, compact = false }) {
  const initial = patient.name?.charAt(0)?.toUpperCase() ?? "P";

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3
          flex items-center gap-3 ${onClick ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}`}
      >
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <span className="text-teal-700 font-bold text-sm">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{patient.name ?? "—"}</p>
          <p className="text-xs text-slate-400">
            {patient.age ? `${patient.age}y` : ""}{patient.gender ? ` · ${patient.gender}` : ""}
          </p>
        </div>
        {patient.status && <Badge variant={statusVariant(patient.status)}>{patient.status}</Badge>}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
      ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xl">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base leading-tight truncate">{patient.name ?? "—"}</p>
          <p className="text-teal-100 text-xs mt-0.5">ID: {patient.id ?? "—"}</p>
        </div>
        {patient.status && (
          <Badge variant={statusVariant(patient.status)} className="flex-shrink-0">
            {patient.status}
          </Badge>
        )}
      </div>

      {/* Info grid */}
      <div className="px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-slate-100">
        <InfoItem label="Age" value={patient.age ? `${patient.age} yrs` : null} />
        <InfoItem label="Gender" value={patient.gender} />
        <InfoItem label="Blood Group" value={patient.bloodGroup} />
        <InfoItem label="Phone" value={patient.phone} />
      </div>

      {actions && <div className="px-5 py-3">{actions}</div>}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value ?? "—"}</p>
    </div>
  );
}

function statusVariant(status) {
  const map = { active: "teal", inactive: "slate", critical: "red", discharged: "blue" };
  return map[status?.toLowerCase()] ?? "slate";
}
