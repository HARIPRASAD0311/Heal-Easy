import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";

// ── Icons ─────────────────────────────────────────────────────────
function MicIcon({ active }) {
  return (
    <svg className={`w-10 h-10 transition-colors ${active ? "text-white" : "text-teal-600"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

const STATUS = {
  idle:       { label: "Ready to record",    color: "bg-slate-100 text-slate-500" },
  listening:  { label: "Listening…",         color: "bg-red-100 text-red-600 animate-pulse" },
  processing: { label: "Processing…",        color: "bg-amber-100 text-amber-700" },
  done:       { label: "Recording complete", color: "bg-teal-100 text-teal-700" },
  error:      { label: "Mic not supported",  color: "bg-red-100 text-red-600" },
};

export default function VoiceInput() {
  const navigate = useNavigate();
  const [status, setStatus]         = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim]       = useState("");
  const [elapsed, setElapsed]       = useState(0);

  const recognitionRef = useRef(null);
  const timerRef       = useRef(null);

  // ── Cleanup on unmount ─────────────────────────────────────────
  useEffect(() => () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
  }, []);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "listening") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // ── Start listening ────────────────────────────────────────────
  function handleStart() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("error");
      return;
    }

    setTranscript("");
    setInterim("");
    setElapsed(0);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous    = true;
    recognition.interimResults = true;
    recognition.lang          = "en-IN";   // good for Indian English

    recognition.onresult = (e) => {
      let final = "";
      let inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else                      inter += t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterim(inter);
    };

    recognition.onerror = (e) => {
      // "aborted" fires when we stop manually — not a real error
      if (e.error !== "aborted") {
        console.error("Speech recognition error:", e.error);
        setStatus("done");
      }
    };

    recognition.onend = () => {
      setInterim("");
      setStatus(prev => prev === "listening" ? "done" : prev);
    };

    recognition.start();
    setStatus("listening");
  }

  // ── Stop ───────────────────────────────────────────────────────
  function handleStop() {
    recognitionRef.current?.stop();
    setInterim("");
    setStatus("done");
  }

  // ── Proceed to review ──────────────────────────────────────────
  function handleContinue() {
    const full = (transcript + " " + interim).trim();
    // Store transcript in sessionStorage so TranscriptReview can read it
    sessionStorage.setItem("voiceTranscript", full);
    navigate("/patient/transcript");
  }

  const cfg         = STATUS[status];
  const isListening = status === "listening";
  const canContinue = status === "done" && (transcript + interim).trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-md mx-auto px-4 py-8 space-y-6">

        {/* Title */}
        <div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-4 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Voice Symptoms</h1>
          <p className="text-sm text-slate-500 mt-1">Describe how you're feeling in your own words.</p>
        </div>

        {/* Recorder card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center gap-5">

          {/* Status badge */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>

          {/* Mic button */}
          <button
            onClick={isListening ? handleStop : handleStart}
            disabled={status === "processing" || status === "error"}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center
              shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300
              ${isListening
                ? "bg-gradient-to-br from-red-500 to-red-600 scale-110 shadow-red-200"
                : status === "done"
                ? "bg-slate-200 cursor-not-allowed"
                : status === "error"
                ? "bg-red-100 cursor-not-allowed"
                : "bg-gradient-to-br from-teal-500 to-teal-700 hover:scale-105 active:scale-95"}`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
            )}
            {isListening
              ? <StopIcon />
              : <MicIcon active={false} />}
          </button>

          {/* Timer */}
          <p className={`text-4xl font-bold tabular-nums tracking-tight
            ${isListening ? "text-red-500" : "text-slate-700"}`}>
            {formatTime(elapsed)}
          </p>

          {status === "error" && (
            <p className="text-xs text-red-500 text-center">
              Your browser does not support speech recognition.<br />
              Please use Chrome or Edge.
            </p>
          )}
        </div>

        {/* Live transcript */}
        {(transcript || interim) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Transcript</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {transcript}
              {interim && <span className="text-teal-500 italic">{interim}</span>}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            Tap the microphone and speak your symptoms clearly. Tap again to stop.
            The transcript will be reviewed before submission.
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200
            ${canContinue
              ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          Review Transcript →
        </button>

        <div className="h-4" />
      </main>
    </div>
  );
}
