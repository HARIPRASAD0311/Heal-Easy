/**
 * patientService.js
 *
 * All patient-related API calls against /patients resource.
 *
 * Endpoints map:
 *   GET    /patients                       → getPatients
 *   GET    /patients/:id                   → getPatientById
 *   GET    /patients/:id/details           → getPatientDetails
 *   GET    /patients/:id/consultations     → getPatientConsultations
 *   GET    /patients/:id/queue             → getPatientQueueStatus
 *   GET    /patients/:id/vitals            → getPatientVitals
 *   POST   /patients                       → createPatient
 *   PUT    /patients/:id                   → updatePatient
 *   PATCH  /patients/:id                   → patchPatient
 *   DELETE /patients/:id                   → deletePatient
 *   POST   /patients/:id/transcript        → submitTranscript
 */

import { get, post, put, patch, del } from "./api";

const BASE = import.meta.env.VITE_API_PATIENTS_PATH ?? "/patients";

// ─────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────

/**
 * List all patients (paginated).
 * @param {{ page?: number, limit?: number, search?: string, department?: string }} params
 */
export const getPatients = (params = {}) => get(BASE, params);

/**
 * Fetch basic patient profile.
 * @param {string} id
 */
export const getPatientById = (id) => get(`${BASE}/${id}`);

/**
 * Fetch extended patient details including allergies, blood group, current symptoms.
 * @param {string} id
 */
export const getPatientDetails = (id) => get(`${BASE}/${id}/details`);

/**
 * Fetch full consultation history for a patient.
 * @param {string} id
 * @param {{ page?: number, limit?: number }} params
 */
export const getPatientConsultations = (id, params = {}) =>
  get(`${BASE}/${id}/consultations`, params);

/**
 * Fetch the patient's current queue position and wait time.
 * @param {string} id
 */
export const getPatientQueueStatus = (id) => get(`${BASE}/${id}/queue`);

/**
 * Fetch the latest recorded vitals for a patient.
 * @param {string} id
 */
export const getPatientVitals = (id) => get(`${BASE}/${id}/vitals`);

// ─────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────

/**
 * Register a new patient.
 * @param {{ name: string, phone: string, email?: string, dob?: string, gender?: string }} data
 */
export const createPatient = (data) => post(BASE, data);

/**
 * Full profile update.
 * @param {string} id
 * @param {object} data
 */
export const updatePatient = (id, data) => put(`${BASE}/${id}`, data);

/**
 * Partial profile update (only changed fields).
 * @param {string} id
 * @param {object} fields
 */
export const patchPatient = (id, fields) => patch(`${BASE}/${id}`, fields);

/**
 * Delete a patient record.
 * @param {string} id
 */
export const deletePatient = (id) => del(`${BASE}/${id}`);

/**
 * Submit a voice transcript for AI processing.
 * The backend will create a pending consultation and trigger the AI pipeline.
 * @param {string} id  — patient ID
 * @param {{ transcript: string, audioUrl?: string }} payload
 */
export const submitTranscript = (id, payload) =>
  post(`${BASE}/${id}/transcript`, payload);
