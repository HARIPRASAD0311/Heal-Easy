import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DoctorHeader from "../../components/layout/DoctorHeader";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import {
  getMedicalRecord,
  updateMedicalRecord,
  approveAISuggestion,
  rejectAISuggestion,
} from "../../services/doctorService";

// ── Diff row — shows AI vs Doctor side by side ────────────────────
function DiffRow({ label, aiValue, doctorValue, edited }) {
  const changed = edited || (aiValue !== doctorValue && doctorValue);
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI column */}
        <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
          <p className="text-xs font-bold text-purple-500 mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            AI Suggestion
          </p>
          <p className="text-sm text-slate-700 leading-snug">{aiValue ?? <span className="italic text-slate-400">—</span>}</p>
        </div>
        {/* Doctor column */}
        <div className={`rounded-xl border px-4 py-3 ${changed ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-100"}`}>
          <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${changed ? "text-teal-600" : "text-slate-400"}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
            </svg>
            {changed ? "Doctor Edit" : "Doctor (unchanged)"}
          </p>
          <p className="text-sm text-slate-700 leading-snug">{doctorValue ?? <span className="italic text-slate-400">—</span>}</p>
        </div>
      </div>
    </div>
  );
}

export default function MedicalRecord() {
  const { consultationId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") ?? "";
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [actionStatus, setActionStatus] = useState(null); // "approved" | "rejected" | null
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const { data: record, loading, error, refetch } = useFetch(
    () => getMedicalRecord(consultationId),
    [consultationId]
  );

  // Initialize editable copy once data loads
  const doctorEdits = editedRecord ?? record?.doctorEdits ?? {};

  function handleEdit() {
    setEditedRecord({ ...(record?.doctorEdits ?? {}) });
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditedRecord(null);
    setEditing(false);
    setSaveError("");
  }

  async function handleSaveEdit() {
    setSaving(true);
    setSaveError("");
    try {
      await updateMedicalRecord(consultationId, editedRecord);
      setEditing(false);
      refetch();
    } catch (e) {
      setSaveError(e?.message ?? "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    try {
      await approveAISuggestion(consultationId);
      setActionStatus("approved");
    } catch (e) {
      setSaveError(e?.message ?? "Approve failed.");
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setShowRejectInput(true);
      return;
    }
    try {
      await rejectAISuggestion(consultationId, rejectReason);
      setActionStatus("rejected");
      setShowRejectInput(false);
    } catch (e) {
      setSaveError(e?.message ?? "Reject failed.");
    }
  }

  const ai = record?.aiSuggestions ?? {};
  const doctor = doctorEdits;

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Medical Record Review</h1>
          <p className="text-sm text-slate-500 mt-1">Compare AI suggestions with doctor edits</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <Spinner message="Loading medical record…" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        ) : !record ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EmptyState title="No record found" subtitle="This consultation has no medical record yet." />
          </div>
        ) : (
          <>
            {/* Action status banner */}
            {actionStatus && (
              <div className={`rounded-2xl px-5 py-4 flex items-center gap-3
                ${actionStatus === "approved"
                  ? "bg-teal-50 border border-teal-200"
                  : "bg-red-50 border border-red-200"}`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${actionStatus === "approved" ? "text-teal-600" : "text-red-500"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {actionStatus === "approved"
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  }
                </svg>
                <p className={`text-sm font-semibold ${actionStatus === "approved" ? "text-teal-700" : "text-red-700"}`}>
                  AI suggestion {actionStatus === "approved" ? "approved" : "rejected"} successfully.
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-200" />
                AI suggestion
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-200" />
                Doctor edit
              </span>
            </div>

            {/* Diff comparison card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-2">
              <DiffRow
                label="Diagnosis"
                aiValue={ai.diagnosis}
                doctorValue={editing ? doctor.diagnosis : record?.doctorEdits?.diagnosis}
              />
              <DiffRow
                label="Treatment"
                aiValue={ai.treatment}
                doctorValue={editing ? doctor.treatment : record?.doctorEdits?.treatment}
              />
              <DiffRow
                label="Prescription"
                aiValue={ai.prescription}
                doctorValue={editing ? doctor.prescription : record?.doctorEdits?.prescription}
              />
              <DiffRow
                label="Notes"
                aiValue={ai.notes}
                doctorValue={editing ? doctor.notes : record?.doctorEdits?.notes}
              />
            </div>

            {/* Edit mode fields */}
            {editing && (
              <div className="bg-white rounded-2xl border border-teal-100 shadow-sm px-5 py-5 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Edit Doctor Record</p>
                {["diagnosis", "treatment", "prescription", "notes"].map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-slate-500 capitalize mb-1.5 block">{field}</label>
                    <textarea
                      rows={field === "notes" || field === "prescription" ? 4 : 2}
                      value={editedRecord?.[field] ?? ""}
                      onChange={(e) => setEditedRecord((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 text-sm
                        text-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                  </div>
                ))}
                {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                <div className="flex gap-3">
                  <button onClick={handleCancelEdit}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50">
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Reject reason input */}
            {showRejectInput && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm px-5 py-4 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reason for rejection</p>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why the AI suggestion is being rejected…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 text-sm p-3
                    text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={handleReject}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">
                    Confirm Reject
                  </button>
                </div>
              </div>
            )}

            {saveError && !editing && (
              <p className="text-sm text-red-500 text-center">{saveError}</p>
            )}

            {/* Action buttons */}
            {!actionStatus && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                    border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                  </svg>
                  Edit Record
                </button>
                <button
                  onClick={() => { setShowRejectInput(true); setEditing(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                    border border-red-200 text-red-600 bg-red-50 text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  Reject AI
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                    bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-bold
                    shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Approve AI
                </button>
              </div>
            )}
          </>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
