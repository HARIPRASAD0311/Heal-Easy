/**
 * Pagination — page navigation controls.
 *
 * Props:
 *   page       — current page (1-indexed)
 *   totalPages — total page count
 *   onChange   — fn(page)
 *   showInfo   — show "Page X of Y" label
 */
export default function Pagination({ page, totalPages, onChange, showInfo = true, className = "" }) {
  if (totalPages <= 1) return null;

  // Build visible page numbers (window of 5)
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  function PageBtn({ num }) {
    const active = num === page;
    return (
      <button
        onClick={() => onChange(num)}
        aria-current={active ? "page" : undefined}
        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors
          ${active
            ? "bg-teal-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"}`}
      >
        {num}
      </button>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {showInfo && (
        <p className="text-xs text-slate-400 font-medium hidden sm:block">
          Page {page} of {totalPages}
        </p>
      )}
      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30
            disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {start > 1 && (
          <>
            <PageBtn num={1} />
            {start > 2 && <span className="w-9 text-center text-slate-400 text-sm">…</span>}
          </>
        )}

        {pages.map((n) => <PageBtn key={n} num={n} />)}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="w-9 text-center text-slate-400 text-sm">…</span>}
            <PageBtn num={totalPages} />
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30
            disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
