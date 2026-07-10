/**
 * Button — reusable button with variant, size, and loading support.
 *
 * Props:
 *   variant  — "primary" | "secondary" | "danger" | "ghost" | "outline"
 *   size     — "sm" | "md" | "lg"
 *   loading  — bool
 *   disabled — bool
 *   fullWidth — bool
 *   icon     — leading JSX icon
 *   iconRight — trailing JSX icon
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  type = "button",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.97] select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:shadow-md focus:ring-teal-400 disabled:from-slate-300 disabled:to-slate-300",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 disabled:opacity-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 disabled:opacity-50",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300 disabled:opacity-40",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300 disabled:opacity-50",
    "outline-teal":
      "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-300 disabled:opacity-50",
    "outline-danger":
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-300 disabled:opacity-50",
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
