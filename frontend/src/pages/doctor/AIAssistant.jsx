import { useNavigate, useSearchParams } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import { getAISuggestions } from "../../services/doctorService";

// ── Confidence bar ────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  const color =
    pct >= 80 ? "from-teal-400 to-teal-600" :
    pct >= 60 ? "from-amber-400 to-amber-600" :
                "from-red-400 to-red-600";
  const label =
    pct >= 80 ? "High confidence" :
    pct >= 60 ? "Moderate confidence" :
                "Low confidence";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-xs font-semibold text-slate-500">AI Confidence</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{pct}%</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
            ${pct >= 80 ? "bg-teal-100 text-teal-700" :
              pct >= 60 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"}`}>
            {label}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── AI Suggestion Card ────────────────────────────────────────────
function SuggestionCard({ label, value, accent = "blue", icon }) {
  const colors = {
    blue:   "bg-blue-50   border-blue-100",
    teal:   "bg-teal-50   border-teal-100",
    amber:  "bg-amber-50  border-amber-100",
    purple: "bg-purple-50 border-purple-100",
    red:    "bg-red-50    border-red-100",
  };
  const iconColors = {
    blue:   "bg-blue-100   text-blue-600",
    teal:   "bg-teal-100   text-teal-600",
    amber:  "bg-amber-100  text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    red:    "bg-red-100    text-red-600",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[accent]}`}>
          {icon}
        </span>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-snug">
        {value ?? <span className="text-slate-400 font-normal italic">Not available</span>}
      </p>
    </div>
  );
}

// ── Urgency badge ─────────────────────────────────────────────────
function UrgencyBadge({ level }) {
  const map = {
    low:      "bg-teal-100  text-teal-700",
    medium:   "bg-amber-100 text-amber-700",
    high:     "bg-orange-100 text-orange-700",
    critical: "bg-red-100   text-red-700 animate-pulse",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize
      ${map[level?.toLowerCase()] ?? map.medium}`}>
      {level ?? "Unknown"}
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────────
function DeptIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
function DiagIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function TreatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}
function PillIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId") ?? "";
  const patientId = searchParams.get("patientId") ?? "";

  const { data: ai, loading, error, refetch } = useFetch(
    () => (consultationId ? getAISuggestions(consultationId) : Promise.resolve(null)),
    [consultationId]
  );

  function goBackToConsultation() {
    navigate(`/doctor/consultation?patientId=${patientId}&consultationId=${consultationId}`);
  }

  function goToRecord() {
    navigate(`/doctor/record/${consultationId}?patientId=${patientId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Consultation
            </button>
            <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
            <p className="text-sm text-slate-500 mt-1">AI-generated suggestions based on patient data</p>
          </div>
          <button
            onClick={goToRecord}
            className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold
              hover:bg-teal-700 transition-colors shadow-sm"
          >
            Review Record →
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <Spinner message="Generating AI suggestions…" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        ) : !ai ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState
              title="No AI suggestions available"
              subtitle="AI analysis requires a consultation to be started first."
              action={{ label: "Go to Consultation", onClick: goBackToConsultation }}
            />
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl px-6 py-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
                  <SparkIcon />
                </span>
                <div>
                  <p className="text-purple-100 text-xs font-semibold uppercase tracking-widest mb-1">
                    AI Summary
                  </p>
                  <p className="text-white text-sm leading-relaxed">
                    {ai.summary ?? "No summary available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <ConfidenceBar value={ai.confidence} />
            </div>

            {/* Urgency */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Urgency</p>
              <UrgencyBadge level={ai.urgency} />
            </div>

            {/* Suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SuggestionCard
                label="Suggested Department"
                value={ai.department}
                accent="blue"
                icon={<DeptIcon />}
              />
              <SuggestionCard
                label="Suggested Diagnosis"
                value={ai.diagnosis}
                accent="teal"
                icon={<DiagIcon />}
              />
              <SuggestionCard
                label="Suggested Treatment"
                value={ai.treatment}
                accent="purple"
                icon={<TreatIcon />}
              />
              <SuggestionCard
                label="Suggested Prescription"
                value={ai.prescription}
                accent="amber"
                icon={<PillIcon />}
              />
            </div>

            {/* Disclaimer */}
            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                AI suggestions are for reference only and must be reviewed by a qualified doctor before any clinical decision.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={goBackToConsultation}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold
                  hover:bg-slate-50 transition-colors"
              >
                Back to Consultation
              </button>
              <button
                onClick={goToRecord}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-bold
                  shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                Review Record →
              </button>
            </div>
          </>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
