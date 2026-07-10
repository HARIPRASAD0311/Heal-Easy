import { useEffect } from "react";

/**
 * Modal — accessible overlay dialog.
 *
 * Props:
 *   open       — bool
 *   onClose    — fn
 *   title      — string
 *   size       — "sm" | "md" | "lg" | "xl"
 *   hideClose  — bool
 */
export default function Modal({ open, onClose, title, children, size = "md", hideClose = false }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size] ?? sizes.md}
        animate-[fadeInUp_0.2s_ease-out]`}>

        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            {title && <h2 className="text-base font-bold text-slate-800">{title}</h2>}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
