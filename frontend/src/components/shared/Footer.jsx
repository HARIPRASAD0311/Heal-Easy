/**
 * Footer — app footer with optional links and branding.
 *
 * Props:
 *   links   — [{ label, href }]
 *   minimal — single-line minimal version
 */
export default function Footer({ links = [], minimal = false }) {
  const year = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="border-t border-slate-100 bg-white py-4 px-4 text-center">
        <p className="text-xs text-slate-400">
          © {year} HealEasy. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
            </svg>
          </div>
          <span className="font-bold text-slate-700 text-sm">HealEasy</span>
          <span className="text-slate-300 text-sm">·</span>
          <span className="text-xs text-slate-400">© {year}</span>
        </div>

        {/* Links */}
        {links.length > 0 && (
          <nav className="flex items-center gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-slate-500 hover:text-teal-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
