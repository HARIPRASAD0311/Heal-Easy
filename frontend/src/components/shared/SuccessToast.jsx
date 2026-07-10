import { useEffect, useState } from "react";

/**
 * SuccessToast — auto-dismissing notification toast.
 *
 * Props:
 *   message  — string
 *   type     — "success" | "error" | "info" | "warning"
 *   duration — ms before auto-dismiss (default 3500)
 *   onClose  — fn
 *   position — "top-right" | "top-center" | "bottom-right" | "bottom-center"
 */
export default function SuccessToast({
  message,
  type = "success",
  duration = 3500,
  onClose,
  position = "top-right",
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => { setVisible(false); onClose?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  const configs = {
    success: {
      bar: "bg-teal-500",
      icon: "bg-teal-100 text-teal-600",
      text: "text-teal-800",
      border: "border-teal-100",
      svg: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ),
    },
    error: {
      bar: "bg-red-500",
      icon: "bg-red-100 text-red-600",
      text: "text-red-800",
      border: "border-red-100",
      svg: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      ),
    },
    warning: {
      bar: "bg-amber-500",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-800",
      border: "border-amber-100",
      svg: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      ),
    },
    info: {
      bar: "bg-blue-500",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-800",
      border: "border-blue-100",
      svg: (
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      ),
    },
  };

  const positions = {
    "top-right":     "top-4 right-4",
    "top-center":    "top-4 left-1/2 -translate-x-1/2",
    "bottom-right":  "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  const cfg = configs[type] ?? configs.success;

  return (
    <div className={`fixed z-50 ${positions[position] ?? positions["top-right"]}`}>
      <div className={`flex items-start gap-3 bg-white border shadow-lg rounded-2xl px-4 py-3 max-w-sm
        ${cfg.border}`}>
        {/* Colored left bar */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${cfg.bar}`} />

        <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {cfg.svg}
          </svg>
        </span>

        <p className={`flex-1 text-sm font-semibold leading-snug ${cfg.text}`}>{message}</p>

        <button
          onClick={() => { setVisible(false); onClose?.(); }}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
