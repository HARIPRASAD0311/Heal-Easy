import { useState, useEffect } from "react";
import { subscribe, isLoading } from "../../services/loadingStore";

/**
 * GlobalLoadingBar — thin progress bar at the top of the page.
 * Automatically shows/hides based on in-flight API requests
 * tracked by loadingStore (incremented/decremented by api.js interceptors).
 *
 * Mount once in App.jsx or main layout.
 */
export default function GlobalLoadingBar() {
  const [busy, setBusy] = useState(isLoading());

  useEffect(() => subscribe(setBusy), []);

  if (!busy) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-teal-100 overflow-hidden"
    >
      <div className="h-full bg-teal-500 animate-[loadBar_1.4s_ease-in-out_infinite]" />
      <style>{`
        @keyframes loadBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%);    }
          100% { transform: translateX(100%);  }
        }
      `}</style>
    </div>
  );
}
