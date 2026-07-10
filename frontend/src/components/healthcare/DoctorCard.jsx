import Badge from "../shared/Badge";

/**
 * DoctorCard — doctor profile card.
 *
 * Props:
 *   doctor — { id, name, department, specialization, experience, available }
 *   onClick
 *   actions
 */
export default function DoctorCard({ doctor = {}, onClick, actions }) {
  const initial = doctor.name?.charAt(0)?.toUpperCase() ?? "D";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
        ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xl">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base leading-tight truncate">Dr. {doctor.name ?? "—"}</p>
          <p className="text-blue-100 text-xs mt-0.5">{doctor.specialization ?? doctor.department ?? "—"}</p>
        </div>
        <Badge variant={doctor.available ? "teal" : "slate"} dot pulse={doctor.available}>
          {doctor.available ? "Available" : "Busy"}
        </Badge>
      </div>

      {/* Info */}
      <div className="px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-slate-100">
        <InfoItem label="Department" value={doctor.department} />
        <InfoItem label="Experience" value={doctor.experience ? `${doctor.experience} yrs` : null} />
        <InfoItem label="Patients Today" value={doctor.todayPatients} />
        <InfoItem label="ID" value={doctor.id} />
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
