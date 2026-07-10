/**
 * doctorService.js
 *
 * All doctor-related API calls against /doctors resource.
 *
 * Endpoints map:
 *   GET    /doctors/:id                          → getDoctorProfile
 *   GET    /doctors/:id/stats                    → getDoctorStats
 *   GET    /doctors/:id/notifications            → getDoctorNotifications
 *   PUT    /doctors/:id/notifications/:nid/read  → markNotificationRead
 *   GET    /doctors/:id/queue                    → getDoctorQueue
 *   PATCH  /doctors/:id                          → patchDoctorProfile
 *   GET    /patients/:id/details                 → getPatientDetails
 *   GET    /patients/:id/consultations           → getPatientHistory
 *   GET    /consultations/:id/ai-suggestions     → getAISuggestions
 *   PUT    /consultations/:id                    → saveConsultation
 *   POST   /consultations/:id/ai-suggestions/approve → approveAISuggestion
 *   POST   /consultations/:id/ai-suggestions/reject  → rejectAISuggestion
 *   GET    /consultations/:id/record             → getMedicalRecord
 *   PUT    /consultations/:id/record             → updateMedicalRecord
 */

import { get, post, put, patch } from "./api";

const BASE         = import.meta.env.VITE_API_DOCTORS_PATH        ?? "/doctors";
const PATIENTS     = import.meta.env.VITE_API_PATIENTS_PATH       ?? "/patients";
const CONSULTS     = import.meta.env.VITE_API_CONSULTATIONS_PATH  ?? "/consultations";

// ─────────────────────────────────────────────────────────────────
// DOCTOR PROFILE & DASHBOARD
// ─────────────────────────────────────────────────────────────────

/** @returns {Promise<{ id, name, department, specialization, experience }>} */
export const getDoctorProfile = (id) =>
  get(`${BASE}/${id}`);

/** @returns {Promise<{ todayPatients, totalConsultations, pendingApprovals, avgDuration }>} */
export const getDoctorStats = (id) =>
  get(`${BASE}/${id}/stats`);

/** @returns {Promise<Array<{ id, title, message, type, read, time }>>} */
export const getDoctorNotifications = (id) =>
  get(`${BASE}/${id}/notifications`);

/** @param {string} id doctorId, @param {string} notifId */
export const markNotificationRead = (id, notifId) =>
  put(`${BASE}/${id}/notifications/${notifId}/read`, {});

/** Partial profile update (e.g. availability toggle). */
export const patchDoctorProfile = (id, fields) =>
  patch(`${BASE}/${id}`, fields);

// ─────────────────────────────────────────────────────────────────
// PATIENT QUEUE (doctor's view)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch today's queue for a doctor.
 * @param {string} id  — doctor ID
 * @param {{ department?: string, status?: string, page?: number, limit?: number }} params
 * @returns {Promise<Array<{ id, name, tokenNumber, age, gender, department, status, waitTime }>>}
 */
export const getDoctorQueue = (id, params = {}) =>
  get(`${BASE}/${id}/queue`, params);

// ─────────────────────────────────────────────────────────────────
// PATIENT DETAILS (doctor's view)
// ─────────────────────────────────────────────────────────────────

/**
 * Extended patient record including vitals, allergies, symptoms.
 * @param {string} patientId
 * @returns {Promise<{ id, name, age, gender, phone, bloodGroup, allergies, vitals, symptoms, symptomTags }>}
 */
export const getPatientDetails = (patientId) =>
  get(`${PATIENTS}/${patientId}/details`);

/**
 * Consultation history list for a patient.
 * @param {string} patientId
 * @param {{ page?: number, limit?: number }} params
 */
export const getPatientHistory = (patientId, params = {}) =>
  get(`${PATIENTS}/${patientId}/consultations`, params);

// ─────────────────────────────────────────────────────────────────
// CONSULTATION
// ─────────────────────────────────────────────────────────────────

/**
 * Persist a consultation (notes, diagnosis, prescription, follow-up).
 * Sends a PUT — backend creates if consultationId is "new-*".
 * @param {string} consultationId
 * @param {{ notes, diagnosis, prescription, followUp, followUpNotes, patientId }} data
 */
export const saveConsultation = (consultationId, data) =>
  put(`${CONSULTS}/${consultationId}`, data);

// ─────────────────────────────────────────────────────────────────
// AI SUGGESTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch AI-generated suggestions for a consultation.
 * @param {string} consultationId
 * @returns {Promise<{ summary, confidence, urgency, department, diagnosis, treatment, prescription, notes }>}
 */
export const getAISuggestions = (consultationId) =>
  get(`${CONSULTS}/${consultationId}/ai-suggestions`);

/** Doctor approves the AI suggestion as-is. */
export const approveAISuggestion = (consultationId) =>
  post(`${CONSULTS}/${consultationId}/ai-suggestions/approve`, {});

/**
 * Doctor rejects the AI suggestion with a reason.
 * @param {string} consultationId
 * @param {string} reason
 */
export const rejectAISuggestion = (consultationId, reason) =>
  post(`${CONSULTS}/${consultationId}/ai-suggestions/reject`, { reason });

// ─────────────────────────────────────────────────────────────────
// MEDICAL RECORD
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the finalised medical record for a consultation.
 * @returns {Promise<{ aiSuggestions: {}, doctorEdits: {}, status }>}
 */
export const getMedicalRecord = (consultationId) =>
  get(`${CONSULTS}/${consultationId}/record`);

/**
 * Replace the doctor-edited section of a medical record.
 * @param {string} consultationId
 * @param {{ diagnosis, treatment, prescription, notes }} data
 */
export const updateMedicalRecord = (consultationId, data) =>
  put(`${CONSULTS}/${consultationId}/record`, data);
