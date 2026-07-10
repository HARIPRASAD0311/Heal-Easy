import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { submitTranscript } from "../../services/patientService";
import { post } from "../../services/api";

const MAX_CHARS = 2000;

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

// Priority badge colours
const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-700 border border-red-200",
  high:     "bg-orange-100 text-orange-700 border border-orange-200",
  medium:   "bg-amber-100 text-amber-700 border border-amber-200",
  low:      "bg-teal-100 text-teal-700 border border-teal-200",
};

export default function TranscriptReview() {
  const navigate   = useNavigate();
  const patientId  = localStorage.getItem("patientId") ?? "";

  // Prefill from sessionStorage (set by VoiceInput)
  const [text, setText]           = useState(() => sessionStorage.getItem("voiceTranscript") ?? "");
  const [editing, setEditing]     = useState(false);
  const [original, setOriginal]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // AI analysis state
  const [analysis, setAnalysis]   = useState(null);   // { summary, priority, department, advice }
  const [analyzing, setAnalyzing] = useState(false);

  const chars   = text.length;
  const isEmpty = text.trim().length === 0;

  // ── Run AI analysis whenever text changes (debounced) ──────────
  useEffect(() => {
    if (isEmpty) { setAnalysis(null); return; }
    const t = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const res = await post("/ai/analyze", { symptoms: text.trim() });
        // res is already unwrapped by api.js normaliseResponse
        setAnalysis(res);
      } catch {
        // Silently ignore — analysis is supplementary
      } finally {
        setAnalyzing(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [text]);

  function handleEdit() { setOriginal(text); setEditing(true); }
  function handleCancel() { setText(original); setEditing(false); }
  function handleConfirmEdit() { if (!isEmpty) setEditing(false); }

  async function handleSubmit() {
    if (isEmpty || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitTranscript(patientId, {
        transcript: text,
        symptoms:   text,
        department: analysis?.department ?? "General Medicine",
        priority:   analysis?.priority   ?? "medium",
      });
      sessionStorage.removeItem("voiceTranscript");
      navigate("/patient/queue");
    } catch (err) {
      setSubmitError(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Back + title */}
        <div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-4 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Review Transcript</h1>
          <p className="text-sm text-slate-500 mt-1">
            Check and correct before submission.
          </p>
        </div>

        {/* Transcript card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Symptom Transcript
            </p>
            {!editing && !isEmpty && (
              <button onClick={handleEdit}
                className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700">
                <EditIcon /> Edit
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              readOnly={!editing}
              rows={8}
              placeholder="Your symptoms will appear here after recording…"
              className={`w-full resize-none rounded-xl text-sm leading-relaxed p-3 transition-colors
                focus:outline-none
                ${editing
                  ? "bg-teal-50 border border-teal-200 text-slate-800 focus:ring-2 focus:ring-teal-300"
                  : "bg-slate-50 border border-slate-100 text-slate-700 cursor-default"}`}
            />
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs font-medium ${chars >= MAX_CHARS ? "text-red-500" : "text-slate-400"}`}>
                {chars} / {MAX_CHARS}
              </p>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
                <XIcon /> Cancel
              </button>
              <button onClick={handleConfirmEdit} disabled={isEmpty}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  text-sm font-semibold transition-colors
                  ${isEmpty ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                             : "bg-teal-600 text-white hover:bg-teal-700"}`}>
                <CheckIcon /> Confirm
              </button>
            </div>
          )}
        </div>

        {/* AI Analysis card — appears after text is entered */}
        {!isEmpty && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                AI Triage Analysis
              </p>
              {analyzing && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </span>
              )}
            </div>

            {analysis && !analyzing && (
              <div className="px-5 py-4 space-y-3">
                {/* Department + Priority row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">Suggested Dept:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {analysis.department}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-2">Priority:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                    ${PRIORITY_COLORS[analysis.priority] ?? PRIORITY_COLORS.medium}`}>
                    {analysis.priority}
                  </span>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Advice */}
                <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Advice</p>
                  <p className="text-sm text-teal-800 leading-relaxed">{analysis.advice}</p>
                </div>
              </div>
            )}

            {!analysis && !analyzing && (
              <p className="text-sm text-slate-400 text-center py-6">
                Analysis will appear here…
              </p>
            )}
          </div>
        )}

        {/* Info note */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            Your transcript will be reviewed by a doctor. The AI analysis is for guidance only.
          </p>
        </div>

        {submitError && (
          <p className="text-sm text-red-500 text-center font-medium">{submitError}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isEmpty || editing || submitting}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200
            ${!isEmpty && !editing && !submitting
              ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          {submitting ? "Submitting…" : "Submit & Join Queue →"}
        </button>

        <div className="h-4" />
      </main>
    </div>
  );
}
