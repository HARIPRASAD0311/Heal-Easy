/**
 * queueService.js
 *
 * Patient queue management API calls.
 *
 * Endpoints map:
 *   GET    /queue                          → getQueue
 *   GET    /queue/:tokenId                 → getQueueEntry
 *   POST   /queue                          → joinQueue
 *   PATCH  /queue/:tokenId/status          → updateQueueStatus
 *   DELETE /queue/:tokenId                 → leaveQueue
 *   GET    /queue/patient/:patientId       → getPatientQueueStatus
 *   GET    /queue/department/:dept         → getDepartmentQueue
 *   POST   /queue/:tokenId/call            → callNextPatient
 *   GET    /queue/stats                    → getQueueStats
 */

import { get, post, patch, del } from "./api";

const BASE = import.meta.env.VITE_API_QUEUE_PATH ?? "/queue";

// ─────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────

/**
 * Get the full active queue list.
 * @param {{ department?: string, status?: string, doctorId?: string, date?: string }} params
 * @returns {Promise<Array<{
 *   tokenId, tokenNumber, patientId, patientName, department,
 *   status, position, estimatedWait, doctorId, registeredAt
 * }>>}
 */
export const getQueue = (params = {}) =>
  get(BASE, params);

/**
 * Get a single queue entry by token ID.
 * @param {string} tokenId
 */
export const getQueueEntry = (tokenId) =>
  get(`${BASE}/${tokenId}`);

/**
 * Get the queue status for a specific patient.
 * Returns null / 404 if the patient is not currently in any queue.
 * @param {string} patientId
 * @returns {Promise<{
 *   tokenId, tokenNumber, position, department,
 *   estimatedWait, totalInQueue, doctorName, status
 * } | null>}
 */
export const getPatientQueueStatus = (patientId) =>
  get(`${BASE}/patient/${patientId}`);

/**
 * Get all entries for a specific department.
 * @param {string} department
 * @param {{ status?: string }} params
 */
export const getDepartmentQueue = (department, params = {}) =>
  get(`${BASE}/department/${encodeURIComponent(department)}`, params);

/**
 * Summary statistics for the queue dashboard.
 * @returns {Promise<{ total, waiting, inProgress, completed, avgWaitTime }>}
 */
export const getQueueStats = () =>
  get(`${BASE}/stats`);

// ─────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────

/**
 * Add a patient to the queue after transcript submission.
 * @param {{ patientId: string, department: string, consultationId?: string }} data
 * @returns {Promise<{ tokenId: string, tokenNumber: number, position: number, estimatedWait: number }>}
 */
export const joinQueue = (data) =>
  post(BASE, data);

/**
 * Update the status of a queue entry.
 * @param {string} tokenId
 * @param {"waiting"|"called"|"in-progress"|"completed"|"no-show"} status
 */
export const updateQueueStatus = (tokenId, status) =>
  patch(`${BASE}/${tokenId}/status`, { status });

/**
 * Remove a patient from the queue (patient-initiated or admin).
 * @param {string} tokenId
 */
export const leaveQueue = (tokenId) =>
  del(`${BASE}/${tokenId}`);

/**
 * Doctor calls the next patient in their queue.
 * Returns the called patient's queue entry.
 * @param {string} tokenId — the token being called
 */
export const callNextPatient = (tokenId) =>
  post(`${BASE}/${tokenId}/call`, {});
