/**
 * TextArea — reusable textarea with label, char counter, and error support.
 */
export default function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  id,
  name,
  className = "",
}) {
  const inputId = id ?? name ?? label?.toLowerCase().replace(/\s+/g, "-");
  const chars = value?.length ?? 0;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={[
          "w-full resize-none rounded-xl border text-sm text-slate-800 placeholder-slate-400",
          "p-3 leading-relaxed",
          "focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent",
          "transition-colors duration-150",
          error
            ? "border-red-300 bg-red-50"
            : disabled
            ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
            : "border-slate-200 bg-white hover:border-slate-300",
        ].join(" ")}
      />
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-slate-400">{hint}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className={`text-xs font-medium ${chars >= maxLength ? "text-red-500" : "text-slate-400"}`}>
            {chars}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
