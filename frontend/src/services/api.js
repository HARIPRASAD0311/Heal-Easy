/**
 * api.js — Axios instance for HealEasy.
 * Talks directly to the Flask backend at VITE_API_BASE_URL.
 */

import axios from "axios";
import { increment, decrement } from "./loadingStore";

// ── Auth helpers ──────────────────────────────────────────────────
function forceLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("patientId");
  localStorage.removeItem("doctorId");
  window.location.replace("/login");
}

// ── Response normaliser ───────────────────────────────────────────
// Flask returns { success: true, data: ... }.
// This unwraps that envelope and maps snake_case → camelCase,
// while keeping the original keys so URL construction still works.

const FIELD_MAP = {
  blood_group:         "bloodGroup",
  medical_history:     "medicalHistory",
  license_number:      "licenseNumber",
  experience_years:    "experience",
  consultation_fee:    "consultationFee",
  token_number:        "tokenNumber",
  arrival_time:        "arrivalTime",
  estimated_wait_time: "estimatedWait",
  patient_name:        "patientName",
  doctor_name:         "doctorName",
  chief_complaint:     "chiefComplaint",
  consultation_date:   "consultationDate",
  follow_up_required:  "followUpRequired",
  follow_up_date:      "followUpDate",
  created_at:          "createdAt",
  updated_at:          "updatedAt",
};

function remapKeys(obj) {
  if (Array.isArray(obj)) return obj.map(remapKeys);
  if (obj === null || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    // Keep the original key
    out[k] = remapKeys(v);
    // Also add camelCase alias if there is one
    const alias = FIELD_MAP[k];
    if (alias) out[alias] = remapKeys(v);
  }
  return out;
}

function normaliseResponse(raw) {
  // Unwrap Flask { success, data } envelope
  if (raw && typeof raw === "object" && "success" in raw) {
    raw = raw.data ?? raw;
  }
  return remapKeys(raw);
}

// ── Axios instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    increment();
    return config;
  },
  (error) => { decrement(); return Promise.reject(error); }
);

// ── Response interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    decrement();
    return normaliseResponse(response.data);
  },
  (error) => {
    decrement();
    const status = error.response?.status ?? null;
    const body   = error.response?.data ?? {};

    const normalised = {
      status,
      message:
        body.error || body.message || body.detail ||
        error.message || "An unexpected error occurred.",
      code: body.code ?? null,
      raw:  error,
    };

    if (status === 401) forceLogout();

    if (error.code === "ECONNABORTED")
      normalised.message = "Request timed out. Please check your connection.";

    if (!error.response)
      normalised.message = "Cannot reach the server. Is the backend running?";

    return Promise.reject(normalised);
  }
);

// ── HTTP helpers ──────────────────────────────────────────────────
export const get    = (url, params = {}) => api.get(url, { params });
export const post   = (url, body   = {}) => api.post(url, body);
export const put    = (url, body   = {}) => api.put(url, body);
export const patch  = (url, body   = {}) => api.patch(url, body);
export const del    = (url, params = {}) => api.delete(url, { params });
export const upload = (url, fd)          =>
  api.post(url, fd, { headers: { "Content-Type": "multipart/form-data" } });

export default api;
