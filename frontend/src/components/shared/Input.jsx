/**
 * Input — reusable text input with label, error, and icon support.
 *
 * Props:
 *   label, placeholder, value, onChange, type,
 *   error, hint, disabled, required,
 *   icon (leading), iconRight (trailing)
 */
export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  hint,
  disabled = false,
  required = false,
  icon,
  iconRight,
  id,
  name,
  className = "",
  ...rest
}) {
  const inputId = id ?? name ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={[
            "w-full rounded-xl border text-sm text-slate-800 placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent",
            "transition-colors duration-150",
            icon ? "pl-9" : "pl-4",
            iconRight ? "pr-9" : "pr-4",
            "py-2.5",
            error
              ? "border-red-300 bg-red-50"
              : disabled
              ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
              : "border-slate-200 bg-white hover:border-slate-300",
          ].join(" ")}
          {...rest}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
