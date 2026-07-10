/**
 * QueueCard — patient's queue position card.
 *
 * Props:
 *   tokenNumber, position, department, estimatedWait, totalInQueue
 *   isNext — bool, highlights as "your turn next"
 */
export default function QueueCard({
  tokenNumber,
  position,
  department,
  estimatedWait,
  totalInQueue,
  isNext = false,
}) {
  const pct = position && totalInQueue
    ? Math.max(0, Math.min(100, Math.round(((totalInQueue - position) / totalInQueue) * 100)))
    : null;

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm
      ${isNext ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-white"}`}>

      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">{department ?? "Queue"}</p>
        {isNext && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-600 text-white animate-pulse">
            YOUR TURN
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4">
        <Stat
          label="Token"
          value={tokenNumber ?? "—"}
          accent={isNext ? "teal" : "slate"}
          large
        />
        <Stat label="Position" value={position ? `#${position}` : "—"} accent="blue" />
        <Stat label="Est. wait" value={estimatedWait ? `~${estimatedWait}m` : "—"} accent="amber" />
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <div className="px-5 pb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{pct}% ahead</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent, large }) {
  const bg = {
    teal:  "bg-teal-100  text-teal-700",
    blue:  "bg-blue-100  text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`${large ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg"} rounded-xl flex items-center justify-center font-black ${bg[accent] ?? bg.slate}`}>
        {value}
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}
