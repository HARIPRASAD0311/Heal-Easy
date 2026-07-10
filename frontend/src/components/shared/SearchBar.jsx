/**
 * SearchBar — controlled search input with clear button.
 *
 * Props:
 *   value, onChange, onClear, placeholder, disabled
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  disabled = false,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
          text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent
          disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
      />

      {/* Clear button */}
      {value && !disabled && (
        <button
          onClick={() => { onChange(""); onClear?.(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
