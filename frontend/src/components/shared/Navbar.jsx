import { Link, useLocation } from "react-router-dom";

/**
 * Navbar — top navigation bar.
 *
 * Props:
 *   links        — [{ label, to, icon? }]
 *   rightContent — JSX placed on the right side
 *   logo         — custom logo JSX (defaults to HealEasy logo)
 */
export default function Navbar({ links = [], rightContent, logo }) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <div className="flex-shrink-0">
          {logo ?? (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
                flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-800 tracking-tight">HealEasy</span>
            </Link>
          )}
        </div>

        {/* Nav links */}
        {links.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {links.map((link) => {
              const active = pathname === link.to || pathname.startsWith(link.to + "/");
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                    ${active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
                >
                  {link.icon && <span className="w-4 h-4">{link.icon}</span>}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right slot */}
        {rightContent && (
          <div className="ml-auto flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
