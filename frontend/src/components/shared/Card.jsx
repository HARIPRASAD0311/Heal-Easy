/**
 * Card — generic container with optional header, footer, and padding control.
 *
 * Props:
 *   title, subtitle   — optional header text
 *   headerRight       — JSX placed at right of header
 *   footer            — JSX footer content
 *   noPadding         — skip body padding (useful for tables/lists)
 *   gradient          — "teal" | "blue" | "purple" applies gradient header strip
 */
export default function Card({
  children,
  title,
  subtitle,
  headerRight,
  footer,
  noPadding = false,
  gradient,
  className = "",
}) {
  const gradients = {
    teal:   "bg-gradient-to-r from-teal-600 to-teal-500",
    blue:   "bg-gradient-to-r from-blue-600 to-blue-500",
    purple: "bg-gradient-to-r from-purple-600 to-purple-500",
  };

  const hasHeader = title || subtitle || headerRight;

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      {hasHeader && (
        <div className={`flex items-start justify-between gap-3 px-5 py-3.5 border-b border-slate-100
          ${gradient ? gradients[gradient] : "bg-slate-50"}`}>
          <div>
            {title && (
              <p className={`text-sm font-bold leading-tight ${gradient ? "text-white" : "text-slate-700"}`}>
                {title}
              </p>
            )}
            {subtitle && (
              <p className={`text-xs mt-0.5 ${gradient ? "text-white/70" : "text-slate-400"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "px-5 py-4"}>{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          {footer}
        </div>
      )}
    </div>
  );
}
