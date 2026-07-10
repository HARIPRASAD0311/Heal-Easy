import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import useFetch from "../../hooks/useFetch";
import { getPatientDetails, saveConsultation } from "../../services/doctorService";

// ─────────────────────────────────────────────────────────────────
// AI STATUS CONFIG
// ─────────────────────────────────────────────────────────────────
const AI_STATUS = {
  idle:       { label: "Ready",       color: "bg-slate-100 text-slate-500",   dot: "bg-slate-400" },
  listening:  { label: "Listening…",  color: "bg-blue-100  text-blue-700",    dot: "bg-blue-500"  },
  paused:     { label: "Paused",      color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  processing: { label: "Processing…", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500"},
  completed:  { label: "Completed",   color: "bg-teal-100  text-teal-700",    dot: "bg-teal-500"  },
};

// Empty AI clinical notes template
const EMPTY_NOTES = {
  chiefComplaint:    "",
  historyOfIllness:  "",
  symptomsDiscussed: "",
  clinicalFindings:  "",
  assessment:        "",
  diagnosisDraft:    "",
  treatmentPlan:     "",
  prescriptionDraft: "",
  followUpInstructions: "",
};

// ─────────────────────────────────────────────────────────────────
// SMALL REUSABLE PIECES
// ─────────────────────────────────────────────────────────────────

/** Existing form section card — untouched */
function FormSection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <span className="text-teal-600">{icon}</span>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/** Existing form textarea — untouched */
function FormTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 text-sm
        text-slate-800 placeholder-slate-400 p-3 leading-relaxed
        focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-colors"
    />
  );
}

/** AI-themed textarea — blue ring, white bg */
function AiTextarea({ value, onChange, placeholder, rows = 3, aiGenerated }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none rounded-xl border text-sm text-slate-800
          placeholder-slate-400 p-3 leading-relaxed
          focus:outline-none focus:ring-2 focus:border-transparent transition-colors
          ${aiGenerated && value
            ? "border-blue-200 bg-blue-50/40 focus:ring-blue-300"
            : "border-slate-200 bg-white focus:ring-blue-300"}`}
      />
      {aiGenerated && value && (
        <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded
          bg-blue-100 text-blue-600 uppercase tracking-wide pointer-events-none">
          AI Draft
        </span>
      )}
    </div>
  );
}

/** Section wrapper for AI clinical notes */
function AiSection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
        <span className="text-blue-500">{icon}</span>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────
function NotesIcon()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.55 2.8a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>; }
function PillIcon()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>; }
function DiagIcon()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" /></svg>; }
function CalIcon()    { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>; }
function MicIcon({ active }) { return <svg className={`w-8 h-8 ${active ? "text-white" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="9" y="2" width="6" height="12" rx="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>; }
function SparkIcon()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>; }
function ClipboardIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>; }

const FOLLOW_UP_OPTIONS = ["1 week", "2 weeks", "1 month", "3 months", "6 months", "As needed"];

// ─────────────────────────────────────────────────────────────────
// AUDIO WAVEFORM — animated bars while recording
// ─────────────────────────────────────────────────────────────────
function Waveform({ active }) {
  const bars = [3, 5, 8, 6, 10, 7, 9, 5, 8, 4, 6, 9, 7, 5, 8];
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            height: active ? `${h * 3}px` : "4px",
            animationDelay: `${i * 60}ms`,
            animationDuration: `${500 + (i % 4) * 120}ms`,
          }}
          className={`w-1 rounded-full transition-all
            ${active
              ? "bg-blue-500 animate-[waveBar_0.8s_ease-in-out_infinite_alternate]"
              : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LIVE TRANSCRIPT PANEL
// ─────────────────────────────────────────────────────────────────
function TranscriptPanel({ transcript, newChunk, aiStatus }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, newChunk]);

  return (
    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Live Transcript</p>
        </div>
        {aiStatus === "processing" && (
          <span className="text-xs text-purple-600 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing…
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="px-4 py-3 h-40 overflow-y-auto text-sm text-slate-700 leading-relaxed space-y-1"
      >
        {!transcript && aiStatus === "idle" && (
          <p className="text-slate-400 italic text-xs text-center mt-6">
            Start AI listening to see real-time transcript here
          </p>
        )}
        {transcript && (
          <p className="text-slate-700">{transcript}</p>
        )}
        {newChunk && aiStatus === "listening" && (
          <p className="text-blue-600 font-medium animate-pulse">{newChunk}</p>
        )}
        {aiStatus === "processing" && !newChunk && (
          <span className="inline-flex items-center gap-1 text-purple-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AI ASSISTANT PANEL (left side panel)
// ─────────────────────────────────────────────────────────────────
function AIAssistantPanel({ aiStatus, elapsed, transcript, newChunk, onStart, onPause, onStop, onRestart }) {
  const cfg = AI_STATUS[aiStatus];
  const isListening  = aiStatus === "listening";
  const isPaused     = aiStatus === "paused";
  const isProcessing = aiStatus === "processing";
  const isCompleted  = aiStatus === "completed";
  const isActive     = isListening || isPaused;

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-3 sticky top-20">

      {/* Header card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-5 py-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <SparkIcon />
            </span>
            <p className="text-white font-bold text-sm">AI Assistant</p>
          </div>
          {/* Status badge */}
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isListening ? "animate-pulse" : ""}`} />
            {cfg.label}
          </span>
        </div>

        {/* Big mic button */}
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            onClick={isListening ? onPause : isPaused ? onStart : isCompleted || isProcessing ? undefined : onStart}
            disabled={isProcessing || isCompleted}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg
              transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30
              ${isListening
                ? "bg-white/20 hover:bg-white/30 scale-110"
                : isPaused
                ? "bg-amber-400 hover:bg-amber-300"
                : isProcessing || isCompleted
                ? "bg-white/10 cursor-not-allowed"
                : "bg-white hover:scale-105 active:scale-95"}`}
            aria-label={isListening ? "Pause AI" : "Start AI listening"}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
            )}
            <MicIcon active={isListening || isPaused} />
          </button>

          {/* Timer */}
          <p className={`text-2xl font-black tabular-nums tracking-tight
            ${isListening ? "text-white" : "text-white/60"}`}>
            {fmt(elapsed)}
          </p>

          {/* Waveform */}
          <div className="w-full px-2">
            <Waveform active={isListening} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-2">
          {!isActive && !isProcessing && !isCompleted && (
            <button onClick={onStart}
              className="flex-1 py-2 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors">
              Start Listening
            </button>
          )}
          {isActive && (
            <>
              <button onClick={onPause}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors
                  ${isListening ? "bg-white/20 text-white hover:bg-white/30" : "bg-amber-400 text-white hover:bg-amber-300"}`}>
                {isListening ? "Pause" : "Resume"}
              </button>
              <button onClick={onStop}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">
                Stop
              </button>
            </>
          )}
          {(isCompleted || isProcessing) && (
            <button onClick={onRestart}
              className="flex-1 py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-colors">
              Restart
            </button>
          )}
        </div>
      </div>

      {/* Live transcript */}
      <TranscriptPanel transcript={transcript} newChunk={newChunk} aiStatus={aiStatus} />

      {/* Disclaimer */}
      <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
        <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          AI drafts require doctor review before saving. You remain responsible for all medical decisions.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AI CLINICAL NOTES PANEL
// ─────────────────────────────────────────────────────────────────
function AIClinicalNotesPanel({ notes, onChange, aiStatus, onApproveAll, onDiscard, isApproved }) {
  const hasContent = Object.values(notes).some((v) => v.trim());
  const isGenerating = aiStatus === "processing";

  const fields = [
    { key: "chiefComplaint",       label: "Chief Complaint",                icon: "🩺", rows: 2 },
    { key: "historyOfIllness",     label: "History of Present Illness",     icon: "📋", rows: 3 },
    { key: "symptomsDiscussed",    label: "Symptoms Discussed",             icon: "💬", rows: 2 },
    { key: "clinicalFindings",     label: "Clinical Findings",              icon: "🔍", rows: 2 },
    { key: "assessment",           label: "Assessment",                     icon: "📊", rows: 2 },
    { key: "diagnosisDraft",       label: "Diagnosis (AI Draft)",           icon: "⚕️", rows: 2 },
    { key: "treatmentPlan",        label: "Treatment Plan (AI Draft)",      icon: "💊", rows: 3 },
    { key: "prescriptionDraft",    label: "Prescription Draft",             icon: "📝", rows: 3 },
    { key: "followUpInstructions", label: "Follow-up Instructions",         icon: "📅", rows: 2 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-200">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <ClipboardIcon />
          </span>
          <div>
            <p className="text-sm font-bold text-white">AI Clinical Notes</p>
            <p className="text-xs text-blue-100">Generated from consultation recording</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isApproved && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500 text-white">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Approved
            </span>
          )}
          {isGenerating && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating…
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Empty / generating state */}
        {!hasContent && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <SparkIcon />
            </div>
            <p className="text-sm font-semibold text-slate-600">AI notes will appear here</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Start AI listening and the system will auto-generate structured clinical documentation from the conversation.
            </p>
          </div>
        )}

        {/* Generating skeleton */}
        {isGenerating && !hasContent && (
          <div className="space-y-3 animate-pulse">
            {[80, 60, 95, 70, 50].map((w, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 bg-blue-100 rounded" />
                <div className={`h-8 bg-slate-100 rounded-xl`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {/* Actual note fields */}
        {(hasContent || isGenerating) && fields.map((f) => (
          <AiSection key={f.key} title={`${f.icon} ${f.label}`} icon={null}>
            <AiTextarea
              value={notes[f.key]}
              onChange={(v) => onChange(f.key, v)}
              placeholder={isGenerating ? "Generating…" : `${f.label} will appear here after recording`}
              rows={f.rows}
              aiGenerated={!!notes[f.key]}
            />
          </AiSection>
        ))}

        {/* Action buttons — only when there's content and not yet approved */}
        {hasContent && !isApproved && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onDiscard}
              className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600
                text-sm font-bold hover:bg-red-100 transition-colors"
            >
              Discard AI Draft
            </button>
            <button
              onClick={onApproveAll}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500
                text-white text-sm font-bold hover:shadow-md transition-all active:scale-[0.98]"
            >
              Approve & Copy to Record
            </button>
          </div>
        )}

        {/* Post-approval note */}
        {isApproved && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-xs text-teal-700 font-semibold">
              AI notes approved and copied to consultation record. Review the fields below before saving.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function Consultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId      = searchParams.get("patientId") ?? "";
  const consultationId = searchParams.get("consultationId") ?? "";

  // ── Existing consultation form state (untouched) ───────────────
  const [notes, setNotes]               = useState("");
  const [diagnosis, setDiagnosis]       = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUp, setFollowUp]         = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState("");
  const [saved, setSaved]               = useState(false);

  // ── AI assistant state ─────────────────────────────────────────
  const [aiStatus, setAiStatus]         = useState("idle");   // idle | listening | paused | processing | completed
  const [elapsed, setElapsed]           = useState(0);
  const [transcript, setTranscript]     = useState("");
  const [newChunk, setNewChunk]         = useState("");
  const [aiNotes, setAiNotes]           = useState({ ...EMPTY_NOTES });
  const [aiApproved, setAiApproved]     = useState(false);

  const timerRef    = useRef(null);
  const chunkRef    = useRef(null);
  const processingRef = useRef(null);

  // Timer while listening
  useEffect(() => {
    if (aiStatus === "listening") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [aiStatus]);

  // Simulate live transcript chunks while listening (placeholder)
  useEffect(() => {
    if (aiStatus !== "listening") { clearInterval(chunkRef.current); return; }
    const chunks = [
      "Doctor: Good morning, how are you feeling today?",
      "Patient: I've had a headache for three days and some fever.",
      "Doctor: Any nausea or sensitivity to light?",
      "Patient: Yes, light sensitivity and mild nausea.",
      "Doctor: Let me check your temperature and blood pressure…",
    ];
    let idx = 0;
    chunkRef.current = setInterval(() => {
      if (idx < chunks.length) {
        const chunk = chunks[idx++];
        setNewChunk(chunk);
        setTranscript((prev) => prev ? `${prev}\n${chunk}` : chunk);
      }
    }, 3000);
    return () => clearInterval(chunkRef.current);
  }, [aiStatus]);

  // Simulate AI processing after stop (placeholder — replace with real API)
  useEffect(() => {
    if (aiStatus !== "processing") return;
    processingRef.current = setTimeout(() => {
      setAiNotes({
        chiefComplaint:       "Persistent headache for 3 days with associated fever.",
        historyOfIllness:     "Patient reports onset 3 days ago, gradual worsening. No prior similar episodes. No recent travel.",
        symptomsDiscussed:    "Headache (frontal), fever (38.2°C), photophobia, mild nausea. Denies vomiting, neck stiffness.",
        clinicalFindings:     "BP: 118/76 mmHg · Temp: 38.2°C · HR: 88 bpm · SpO2: 98%. Alert, oriented. No meningeal signs.",
        assessment:           "Tension-type headache with low-grade fever. Viral etiology likely. No red flag symptoms.",
        diagnosisDraft:       "Tension headache with viral fever (ICD-10: G44.2, R50.9)",
        treatmentPlan:        "Rest and adequate hydration. Symptomatic relief with analgesics and antipyretics. Monitor for worsening.",
        prescriptionDraft:    "Tab. Paracetamol 500mg — TDS × 5 days\nTab. Ibuprofen 400mg — BD × 3 days (after food)\nORS sachets — as needed",
        followUpInstructions: "Return if fever persists beyond 5 days, or if headache worsens or new symptoms develop. Follow up in 1 week.",
      });
      setAiStatus("completed");
    }, 3000);
    return () => clearTimeout(processingRef.current);
  }, [aiStatus]);

  // ── AI controls ────────────────────────────────────────────────
  function handleAiStart() {
    setElapsed(0);
    setTranscript("");
    setNewChunk("");
    setAiNotes({ ...EMPTY_NOTES });
    setAiApproved(false);
    setAiStatus("listening");
  }
  function handleAiPause() { setAiStatus(aiStatus === "listening" ? "paused" : "listening"); }
  function handleAiStop()  { setNewChunk(""); setAiStatus("processing"); }
  function handleAiRestart() {
    clearTimeout(processingRef.current);
    clearInterval(chunkRef.current);
    setAiStatus("idle");
    setElapsed(0);
    setTranscript("");
    setNewChunk("");
    setAiNotes({ ...EMPTY_NOTES });
    setAiApproved(false);
  }

  function handleAiNoteChange(key, value) {
    setAiNotes((prev) => ({ ...prev, [key]: value }));
  }

  // Approve: copy AI fields into the doctor's own form fields
  function handleApproveAll() {
    setNotes(
      [
        aiNotes.chiefComplaint       && `Chief Complaint:\n${aiNotes.chiefComplaint}`,
        aiNotes.historyOfIllness     && `History:\n${aiNotes.historyOfIllness}`,
        aiNotes.clinicalFindings     && `Findings:\n${aiNotes.clinicalFindings}`,
        aiNotes.assessment           && `Assessment:\n${aiNotes.assessment}`,
      ].filter(Boolean).join("\n\n")
    );
    setDiagnosis(aiNotes.diagnosisDraft);
    setPrescription(aiNotes.prescriptionDraft);
    setFollowUpNotes(aiNotes.followUpInstructions);
    setAiApproved(true);
  }

  function handleDiscard() {
    setAiNotes({ ...EMPTY_NOTES });
    setAiApproved(false);
    setAiStatus("idle");
    setElapsed(0);
    setTranscript("");
  }

  // ── Existing save logic (untouched) ───────────────────────────
  async function handleSave() {
    if (!notes.trim() && !diagnosis.trim()) {
      setSaveError("Please add at least notes or a diagnosis.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await saveConsultation(consultationId || `new-${patientId}`, {
        notes, diagnosis, prescription, followUp, followUpNotes, patientId,
      });
      setSaved(true);
      setTimeout(() => navigate(`/doctor/patient/${patientId}`), 1200);
    } catch (e) {
      setSaveError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const { data: patient, loading, error } = useFetch(
    () => (patientId ? getPatientDetails(patientId) : Promise.resolve(null)),
    [patientId]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Page header — existing, untouched */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Consultation</h1>
            {loading ? (
              <p className="text-sm text-slate-400 mt-1">Loading patient…</p>
            ) : patient ? (
              <p className="text-sm text-slate-500 mt-1">
                {patient.name} · {patient.age ? `${patient.age}y` : ""} {patient.gender ?? ""}
              </p>
            ) : null}
          </div>

          {/* AI status pill in header */}
          <div className="mt-6 flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
              ${AI_STATUS[aiStatus].color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${AI_STATUS[aiStatus].dot}
                ${aiStatus === "listening" ? "animate-pulse" : ""}`} />
              AI · {AI_STATUS[aiStatus].label}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">

          {/* LEFT — AI Assistant column */}
          <div className="space-y-5">
            <AIAssistantPanel
              aiStatus={aiStatus}
              elapsed={elapsed}
              transcript={transcript}
              newChunk={newChunk}
              onStart={handleAiStart}
              onPause={handleAiPause}
              onStop={handleAiStop}
              onRestart={handleAiRestart}
            />
          </div>

          {/* RIGHT — Consultation form + AI notes */}
          <div className="space-y-5">

            {/* AI Clinical Notes — shown once recording starts */}
            {aiStatus !== "idle" && (
              <AIClinicalNotesPanel
                notes={aiNotes}
                onChange={handleAiNoteChange}
                aiStatus={aiStatus}
                onApproveAll={handleApproveAll}
                onDiscard={handleDiscard}
                isApproved={aiApproved}
              />
            )}

            {/* ── Existing consultation form sections — untouched ── */}

            <FormSection title="Doctor Notes" icon={<NotesIcon />}>
              <FormTextarea
                value={notes}
                onChange={setNotes}
                placeholder="Enter your clinical observations and examination notes…"
                rows={5}
              />
            </FormSection>

            <FormSection title="Diagnosis" icon={<DiagIcon />}>
              <FormTextarea
                value={diagnosis}
                onChange={setDiagnosis}
                placeholder="Primary and secondary diagnosis…"
                rows={3}
              />
            </FormSection>

            <FormSection title="Prescription" icon={<PillIcon />}>
              <FormTextarea
                value={prescription}
                onChange={setPrescription}
                placeholder="Medication name · Dosage · Frequency · Duration (one per line)"
                rows={5}
              />
              <p className="text-xs text-slate-400 mt-2">
                Format: Drug name · Dose · Frequency · Duration
              </p>
            </FormSection>

            <FormSection title="Follow-up" icon={<CalIcon />}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Follow-up in</p>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOW_UP_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFollowUp(followUp === opt ? "" : opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                          ${followUp === opt
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <FormTextarea
                  value={followUpNotes}
                  onChange={setFollowUpNotes}
                  placeholder="Additional follow-up instructions…"
                  rows={2}
                />
              </div>
            </FormSection>

            {/* Save — existing logic untouched */}
            {saveError && (
              <p className="text-sm text-red-500 text-center font-medium">{saveError}</p>
            )}
            {saved && (
              <p className="text-sm text-teal-600 text-center font-semibold">
                ✓ Consultation saved — redirecting…
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200
                ${!saving && !saved
                  ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Consultation"}
            </button>

            <div className="h-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
