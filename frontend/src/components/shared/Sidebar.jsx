import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar — collapsible side navigation.
 *
 * Props:
 *   links       — [{ label, to, icon, badge? }]
 *   open        — controlled open state (for mobile overlay)
 *   onClose     — fn
 *   footer      — JSX placed at bottom of sidebar
 *   title       — section title shown at top
 */
export default function Sidebar({ links = [], open = true, onClose, footer, title }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col
        bg-white border-r border-slate-100 shadow-sm
        w-64 min-h-screen
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          {title ? (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          ) : (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                </svg>
              </div>
              <span className="font-bold text-slate-800">HealEasy</span>
            </Link>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = pathname === link.to || pathname.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  {link.icon && (
                    <span className={`w-5 h-5 flex-shrink-0 ${active ? "text-teal-600" : "text-slate-400"}`}>
                      {link.icon}
                    </span>
                  )}
                  {link.label}
                </div>
                {link.badge != null && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                    ${active ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer slot */}
        {footer && (
          <div className="flex-shrink-0 px-3 py-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
