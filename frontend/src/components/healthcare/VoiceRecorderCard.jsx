import { useState, useRef, useEffect } from "react";

/**
 * VoiceRecorderCard — self-contained voice recording widget.
 *
 * Props:
 *   onStop  — fn(blob) called when recording is stopped
 *   onUpload — fn(file) called when a file is uploaded
 *   disabled
 */
export default function VoiceRecorderCard({ onStop, onUpload, disabled = false }) {
  const [status, setStatus]   = useState("idle"); // idle | recording | paused | stopped | uploaded
  const [elapsed, setElapsed] = useState(0);
  const [fileName, setFileName] = useState("");
  const timerRef = useRef(null);
  const fileRef  = useRef(null);

  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleMainBtn() {
    if (disabled) return;
    if (status === "idle" || status === "paused") {
      if (status === "idle") setElapsed(0);
      setStatus("recording");
    } else if (status === "recording") {
      setStatus("paused");
    }
  }

  function handleStop() {
    setStatus("stopped");
    onStop?.(null); // pass recorded blob when Web API is wired
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploaded");
    setElapsed(0);
    onUpload?.(file);
  }

  const isActive   = status === "recording";
  const isPaused   = status === "paused";
  const isDone     = status === "stopped" || status === "uploaded";

  const btnStyle = isActive
    ? "bg-gradient-to-br from-red-500 to-red-600 scale-110 shadow-red-200"
    : isPaused
    ? "bg-gradient-to-br from-amber-400 to-amber-500"
    : isDone
    ? "bg-slate-200 cursor-not-allowed"
    : "bg-gradient-to-br from-teal-500 to-teal-700 hover:scale-105 active:scale-95";

  const statusLabels = {
    idle:      { text: "Ready to record",    cls: "bg-slate-100 text-slate-500" },
    recording: { text: "Recording…",         cls: "bg-red-100 text-red-600 animate-pulse" },
    paused:    { text: "Paused",             cls: "bg-amber-100 text-amber-600" },
    stopped:   { text: "Recording complete", cls: "bg-teal-100 text-teal-700" },
    uploaded:  { text: "File selected",      cls: "bg-blue-100 text-blue-700" },
  };
  const badge = statusLabels[status];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-5">
      {/* Status badge */}
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>{badge.text}</span>

      {/* Big mic button */}
      <button
        onClick={handleMainBtn}
        disabled={isDone || disabled}
        aria-label={isActive ? "Pause" : isPaused ? "Resume" : "Start recording"}
        className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg
          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300 ${btnStyle}`}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
        )}
        <svg className={`w-9 h-9 ${isActive || isPaused ? "text-white" : isDone ? "text-slate-400" : "text-teal-600"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          {isActive ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          ) : (
            <>
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </>
          )}
        </svg>
      </button>

      {/* Timer */}
      <p className={`text-3xl font-bold tabular-nums tracking-tight ${isActive ? "text-red-500" : "text-slate-700"}`}>
        {fmt(elapsed)}
      </p>

      {/* Secondary controls */}
      {(isActive || isPaused) && (
        <button onClick={handleStop}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
          Stop
        </button>
      )}

      {fileName && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 truncate max-w-full">
          📎 {fileName}
        </p>
      )}

      {/* Upload */}
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed
          border-slate-200 text-slate-500 text-sm font-semibold
          hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-40"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Upload audio file
      </button>
    </div>
  );
}
