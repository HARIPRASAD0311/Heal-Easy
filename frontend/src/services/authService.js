/**
 * authService.js
 *
 * Handles all authentication and session management calls
 * against the AWS API Gateway /auth resource.
 *
 * Endpoints map:
 *   POST   /auth/login              → loginPatient / loginDoctor
 *   POST   /auth/register           → registerPatient
 *   POST   /auth/logout             → logout
 *   POST   /auth/refresh            → refreshToken
 *   POST   /auth/forgot-password    → forgotPassword
 *   POST   /auth/reset-password     → resetPassword
 *   GET    /auth/me                 → getMe
 */

import { get, post } from "./api";

const BASE = import.meta.env.VITE_API_AUTH_PATH ?? "/auth";

// ─────────────────────────────────────────────────────────────────
// LOGIN / REGISTER
// ─────────────────────────────────────────────────────────────────

/**
 * Login as a patient.
 * @param {{ phone: string, otp?: string, password?: string }} credentials
 * @returns {Promise<{ token: string, patientId: string, name: string }>}
 */
export const loginPatient = (credentials) =>
  post(`${BASE}/login`, { ...credentials, role: "patient" });

/**
 * Login as a doctor.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, doctorId: string, name: string }>}
 */
export const loginDoctor = (credentials) =>
  post(`${BASE}/login`, { ...credentials, role: "doctor" });

/**
 * Register a new patient account.
 * @param {{ name: string, phone: string, email?: string, dob?: string, gender?: string }} data
 * @returns {Promise<{ patientId: string, message: string }>}
 */
export const registerPatient = (data) =>
  post(`${BASE}/register`, { ...data, role: "patient" });

// ─────────────────────────────────────────────────────────────────
// SESSION
// ─────────────────────────────────────────────────────────────────

/**
 * Invalidate the current token on the backend.
 * @returns {Promise<{ message: string }>}
 */
export const logout = () =>
  post(`${BASE}/logout`);

/**
 * Exchange a refresh token for a new access token.
 * @param {string} refreshToken
 * @returns {Promise<{ token: string, expiresIn: number }>}
 */
export const refreshToken = (refreshToken) =>
  post(`${BASE}/refresh`, { refreshToken });

/**
 * Get the currently authenticated user's profile.
 * @returns {Promise<{ id: string, name: string, role: string }>}
 */
export const getMe = () =>
  get(`${BASE}/me`);

// ─────────────────────────────────────────────────────────────────
// PASSWORD
// ─────────────────────────────────────────────────────────────────

/**
 * Trigger a password reset email / OTP.
 * @param {{ email?: string, phone?: string }} contact
 */
export const forgotPassword = (contact) =>
  post(`${BASE}/forgot-password`, contact);

/**
 * Submit the new password with the reset token.
 * @param {{ token: string, newPassword: string }} payload
 */
export const resetPassword = (payload) =>
  post(`${BASE}/reset-password`, payload);

// ─────────────────────────────────────────────────────────────────
// LOCAL HELPERS (no API call)
// ─────────────────────────────────────────────────────────────────

/**
 * Persist auth state to localStorage after a successful login.
 * @param {{ token: string, patientId?: string, doctorId?: string, role: string }} session
 */
export function saveSession(session) {
  localStorage.setItem("token", session.token);
  if (session.patientId) localStorage.setItem("patientId", session.patientId);
  if (session.doctorId)  localStorage.setItem("doctorId",  session.doctorId);
  if (session.role)      localStorage.setItem("role",      session.role);
}

/** Remove all auth data from localStorage. */
export function clearSession() {
  ["token", "patientId", "doctorId", "role"].forEach((k) =>
    localStorage.removeItem(k)
  );
}

/** Returns true if a token is stored (does NOT validate expiry). */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/** Returns the stored role string ("patient" | "doctor" | null). */
export function getRole() {
  return localStorage.getItem("role");
}
