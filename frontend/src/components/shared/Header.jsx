/**
 * Header — page-level section header with back button, title, subtitle and actions.
 *
 * Props:
 *   title, subtitle
 *   onBack       — fn, shows back button if provided
 *   backLabel    — defaults to "Back"
 *   actions      — JSX placed on the right side
 */
export default function Header({ title, subtitle, onBack, backLabel = "Back", actions, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </button>
        )}
        {title && <h1 className="text-2xl font-bold text-slate-800 leading-tight">{title}</h1>}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {actions}
        </div>
      )}
    </div>
  );
}
