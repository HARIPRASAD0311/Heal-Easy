/**
 * aiService.js
 *
 * All AI pipeline API calls — transcript processing, clinical note generation,
 * suggestion retrieval, and feedback loops.
 *
 * Endpoints map:
 *   POST   /ai/transcribe                        → transcribeAudio
 *   POST   /ai/analyze                           → analyzeTranscript
 *   GET    /ai/suggestions/:consultationId        → getSuggestions
 *   POST   /ai/suggestions/:consultationId/approve → approveSuggestion
 *   POST   /ai/suggestions/:consultationId/reject  → rejectSuggestion
 *   POST   /ai/suggestions/:consultationId/feedback → sendFeedback
 *   GET    /ai/suggestions/:consultationId/status  → getSuggestionStatus
 *   POST   /ai/department                         → suggestDepartment
 *   POST   /ai/urgency                            → assessUrgency
 */

import { get, post, upload } from "./api";

const BASE = import.meta.env.VITE_API_AI_PATH ?? "/ai";

// ─────────────────────────────────────────────────────────────────
// TRANSCRIPTION
// ─────────────────────────────────────────────────────────────────

/**
 * Upload an audio file for server-side speech-to-text transcription.
 * The backend sends the file to Amazon Transcribe (or equivalent).
 * @param {File}    audioFile
 * @param {string}  consultationId  — links the transcript to a consultation
 * @param {string}  [language]      — BCP-47 language code, e.g. "en-IN", "ta-IN"
 * @returns {Promise<{ jobId: string, status: "pending"|"processing"|"completed" }>}
 */
export const transcribeAudio = (audioFile, consultationId, language = "en-IN") => {
  const fd = new FormData();
  fd.append("audio", audioFile);
  fd.append("consultationId", consultationId);
  fd.append("language", language);
  return upload(`${BASE}/transcribe`, fd);
};

/**
 * Poll the transcription job status.
 * @param {string} jobId
 * @returns {Promise<{ jobId, status, transcript?: string }>}
 */
export const getTranscriptionStatus = (jobId) =>
  get(`${BASE}/transcribe/${jobId}`);

// ─────────────────────────────────────────────────────────────────
// CLINICAL NOTE GENERATION
// ─────────────────────────────────────────────────────────────────

/**
 * Submit a text transcript to the AI pipeline for clinical note generation.
 * The backend invokes the LLM and stores the suggestions.
 * @param {{
 *   consultationId: string,
 *   transcript:     string,
 *   patientContext?: { age?, gender?, allergies?, existingConditions? }
 * }} payload
 * @returns {Promise<{ jobId: string, status: "pending"|"processing" }>}
 */
export const analyzeTranscript = (payload) =>
  post(`${BASE}/analyze`, payload);

/**
 * Check processing status of an AI analysis job.
 * Poll this after calling analyzeTranscript until status === "completed".
 * @param {string} consultationId
 * @returns {Promise<{ status: "pending"|"processing"|"completed"|"failed", progress?: number }>}
 */
export const getSuggestionStatus = (consultationId) =>
  get(`${BASE}/suggestions/${consultationId}/status`);

// ─────────────────────────────────────────────────────────────────
// SUGGESTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Retrieve the completed AI clinical suggestions.
 * Only returns data when status === "completed".
 * @param {string} consultationId
 * @returns {Promise<{
 *   consultationId:     string,
 *   confidence:         number,   // 0–1
 *   urgency:            "low"|"medium"|"high"|"critical",
 *   summary:            string,
 *   department:         string,
 *   chiefComplaint:     string,
 *   historyOfIllness:   string,
 *   symptomsDiscussed:  string,
 *   clinicalFindings:   string,
 *   assessment:         string,
 *   diagnosis:          string,
 *   treatmentPlan:      string,
 *   prescription:       string,
 *   followUpInstructions: string,
 *   generatedAt:        string
 * }>}
 */
export const getSuggestions = (consultationId) =>
  get(`${BASE}/suggestions/${consultationId}`);

/**
 * Doctor approves the AI suggestions — persists them as the final record.
 * @param {string} consultationId
 * @returns {Promise<{ message: string, approvedAt: string }>}
 */
export const approveSuggestion = (consultationId) =>
  post(`${BASE}/suggestions/${consultationId}/approve`, {});

/**
 * Doctor rejects the AI suggestions with a reason.
 * Used to improve the model over time.
 * @param {string} consultationId
 * @param {string} reason
 * @returns {Promise<{ message: string }>}
 */
export const rejectSuggestion = (consultationId, reason) =>
  post(`${BASE}/suggestions/${consultationId}/reject`, { reason });

/**
 * Send freeform feedback on a specific AI suggestion field.
 * Helps fine-tune the model.
 * @param {string} consultationId
 * @param {{ field: string, originalValue: string, correctedValue: string, comment?: string }} feedback
 */
export const sendFeedback = (consultationId, feedback) =>
  post(`${BASE}/suggestions/${consultationId}/feedback`, feedback);

// ─────────────────────────────────────────────────────────────────
// QUICK TRIAGE (standalone, before consultation starts)
// ─────────────────────────────────────────────────────────────────

/**
 * Suggest the most appropriate department based on a symptom description.
 * Used during the patient voice input flow.
 * @param {{ symptoms: string, patientAge?: number, patientGender?: string }} payload
 * @returns {Promise<{ department: string, confidence: number, alternatives: string[] }>}
 */
export const suggestDepartment = (payload) =>
  post(`${BASE}/department`, payload);

/**
 * Assess urgency from raw symptoms text.
 * @param {{ symptoms: string }} payload
 * @returns {Promise<{ urgency: "low"|"medium"|"high"|"critical", reasoning: string }>}
 */
export const assessUrgency = (payload) =>
  post(`${BASE}/urgency`, payload);
