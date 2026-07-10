/**
 * consultationService.js
 *
 * All consultation lifecycle API calls.
 *
 * Endpoints map:
 *   GET    /consultations                         → getConsultations
 *   GET    /consultations/:id                     → getConsultationById
 *   POST   /consultations                         → createConsultation
 *   PUT    /consultations/:id                     → updateConsultation
 *   PATCH  /consultations/:id/status              → updateConsultationStatus
 *   DELETE /consultations/:id                     → deleteConsultation
 *   GET    /consultations/:id/record              → getMedicalRecord
 *   PUT    /consultations/:id/record              → updateMedicalRecord
 *   POST   /consultations/:id/transcript          → submitTranscript
 *   GET    /consultations/:id/ai-suggestions      → getAISuggestions
 *   POST   /consultations/:id/ai-suggestions/approve → approveAISuggestion
 *   POST   /consultations/:id/ai-suggestions/reject  → rejectAISuggestion
 *   GET    /consultations/:id/prescription        → getPrescription
 *   POST   /consultations/:id/prescription        → savePrescription
 */

import { get, post, put, patch, del, upload } from "./api";

const BASE = import.meta.env.VITE_API_CONSULTATIONS_PATH ?? "/consultations";

// ─────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────

/**
 * List consultations with optional filters.
 * @param {{ patientId?, doctorId?, status?, date?, page?, limit? }} params
 */
export const getConsultations = (params = {}) =>
  get(BASE, params);

/**
 * Fetch a single consultation's full data.
 * @param {string} id
 */
export const getConsultationById = (id) =>
  get(`${BASE}/${id}`);

/**
 * Create a new consultation record.
 * @param {{ patientId: string, doctorId: string, department?: string }} data
 * @returns {Promise<{ consultationId: string }>}
 */
export const createConsultation = (data) =>
  post(BASE, data);

/**
 * Full update of a consultation (notes, diagnosis, prescription, follow-up).
 * @param {string} id
 * @param {{ notes, diagnosis, prescription, followUp, followUpNotes }} data
 */
export const updateConsultation = (id, data) =>
  put(`${BASE}/${id}`, data);

/**
 * Update only the status field.
 * @param {string} id
 * @param {"pending"|"in-progress"|"completed"|"cancelled"} status
 */
export const updateConsultationStatus = (id, status) =>
  patch(`${BASE}/${id}/status`, { status });

/** @param {string} id */
export const deleteConsultation = (id) =>
  del(`${BASE}/${id}`);

// ─────────────────────────────────────────────────────────────────
// TRANSCRIPT
// ─────────────────────────────────────────────────────────────────

/**
 * Submit the doctor-reviewed text transcript for AI processing.
 * Backend kicks off the AI clinical note generation pipeline.
 * @param {string} id  — consultation ID
 * @param {{ transcript: string }} payload
 */
export const submitTranscript = (id, payload) =>
  post(`${BASE}/${id}/transcript`, payload);

/**
 * Upload a raw audio file for server-side transcription.
 * @param {string} id  — consultation ID
 * @param {File}   file
 */
export const uploadAudio = (id, file) => {
  const fd = new FormData();
  fd.append("audio", file);
  return upload(`${BASE}/${id}/audio`, fd);
};

// ─────────────────────────────────────────────────────────────────
// AI SUGGESTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Retrieve AI-generated clinical suggestions.
 * @param {string} id
 * @returns {Promise<{
 *   summary: string,
 *   confidence: number,
 *   urgency: string,
 *   department: string,
 *   diagnosis: string,
 *   treatment: string,
 *   prescription: string,
 *   chiefComplaint: string,
 *   historyOfIllness: string,
 *   symptomsDiscussed: string,
 *   clinicalFindings: string,
 *   assessment: string,
 *   followUpInstructions: string
 * }>}
 */
export const getAISuggestions = (id) =>
  get(`${BASE}/${id}/ai-suggestions`);

/** Doctor accepts the AI suggestion without edits. */
export const approveAISuggestion = (id) =>
  post(`${BASE}/${id}/ai-suggestions/approve`, {});

/**
 * Doctor rejects the AI suggestion and provides a reason.
 * @param {string} id
 * @param {string} reason
 */
export const rejectAISuggestion = (id, reason) =>
  post(`${BASE}/${id}/ai-suggestions/reject`, { reason });

// ─────────────────────────────────────────────────────────────────
// MEDICAL RECORD
// ─────────────────────────────────────────────────────────────────

/**
 * Get the finalised medical record (AI draft + doctor edits side by side).
 * @param {string} id
 * @returns {Promise<{ aiSuggestions: object, doctorEdits: object, status: string, approvedAt?: string }>}
 */
export const getMedicalRecord = (id) =>
  get(`${BASE}/${id}/record`);

/**
 * Save the doctor's edited version of the medical record.
 * @param {string} id
 * @param {{ diagnosis, treatment, prescription, notes }} data
 */
export const updateMedicalRecord = (id, data) =>
  put(`${BASE}/${id}/record`, data);

// ─────────────────────────────────────────────────────────────────
// PRESCRIPTION
// ─────────────────────────────────────────────────────────────────

/** @param {string} id */
export const getPrescription = (id) =>
  get(`${BASE}/${id}/prescription`);

/**
 * @param {string} id
 * @param {{ medications: Array<{ name, dose, frequency, duration }> }} data
 */
export const savePrescription = (id, data) =>
  post(`${BASE}/${id}/prescription`, data);
