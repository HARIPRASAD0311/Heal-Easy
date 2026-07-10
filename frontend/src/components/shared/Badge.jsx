/**
 * Badge — small status/label chip.
 *
 * variant — "teal" | "blue" | "amber" | "red" | "purple" | "slate" | "green" | "orange"
 * dot     — show a colored dot prefix
 * pulse   — animate the dot
 */
export default function Badge({ children, variant = "slate", dot = false, pulse = false, className = "" }) {
  const variants = {
    teal:   "bg-teal-100   text-teal-700",
    blue:   "bg-blue-100   text-blue-700",
    amber:  "bg-amber-100  text-amber-700",
    red:    "bg-red-100    text-red-700",
    purple: "bg-purple-100 text-purple-700",
    slate:  "bg-slate-100  text-slate-600",
    green:  "bg-green-100  text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };
  const dotColors = {
    teal:   "bg-teal-500",
    blue:   "bg-blue-500",
    amber:  "bg-amber-500",
    red:    "bg-red-500",
    purple: "bg-purple-500",
    slate:  "bg-slate-400",
    green:  "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold
      ${variants[variant] ?? variants.slate} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] ?? dotColors.slate}
          ${pulse ? "animate-pulse" : ""}`} />
      )}
      {children}
    </span>
  );
}
