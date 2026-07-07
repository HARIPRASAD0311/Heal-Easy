/**
 * HealEasy — API Service Functions
 *
 * One function per API call. Pages import from here — never from mockData.
 * Backend team: adjust ENDPOINTS in config.js or add transformations here.
 */

import { api } from './client'
import { ENDPOINTS } from './config'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    api.post(ENDPOINTS.login, { email, password }),

  logout: () =>
    api.post(ENDPOINTS.logout),

  getMe: () =>
    api.get(ENDPOINTS.me),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () =>
    api.get(ENDPOINTS.dashboardStats),

  getWeeklyData: () =>
    api.get(ENDPOINTS.weeklyStats),

  getRecentPatients: () =>
    api.get(ENDPOINTS.recentPatients),

  getAnnouncements: () =>
    api.get(ENDPOINTS.announcements),
}

// ── Queue ─────────────────────────────────────────────────────────────────────
export const queueService = {
  getQueue: () =>
    api.get(ENDPOINTS.queue),

  callPatient: (id) =>
    api.post(ENDPOINTS.callPatient(id)),

  skipPatient: (id) =>
    api.post(ENDPOINTS.skipPatient(id)),
}

// ── Patient ───────────────────────────────────────────────────────────────────
export const patientService = {
  getSummary: (id) =>
    api.get(ENDPOINTS.patientSummary(id)),

  getHistory: (id) =>
    api.get(ENDPOINTS.patientHistory(id)),
}

// ── Consultation ──────────────────────────────────────────────────────────────
export const consultationService = {
  start: (patientId) =>
    api.post(ENDPOINTS.startConsult(patientId)),

  end: (consultationId) =>
    api.post(ENDPOINTS.endConsult(consultationId)),
}

// ── SOAP Notes ────────────────────────────────────────────────────────────────
export const soapService = {
  getNotes: (consultationId) =>
    api.get(ENDPOINTS.soapNotes(consultationId)),

  approve: (consultationId, notes) =>
    api.post(ENDPOINTS.approveSOAP(consultationId), notes),

  reject: (consultationId) =>
    api.post(ENDPOINTS.rejectSOAP(consultationId)),

  regenerate: (consultationId) =>
    api.post(ENDPOINTS.regenerateSOAP(consultationId)),

  saveDraft: (consultationId, notes) =>
    api.put(ENDPOINTS.soapNotes(consultationId), notes),

  exportPDF: (consultationId) =>
    api.get(ENDPOINTS.exportSOAP(consultationId)),
}

// ── Emergency ─────────────────────────────────────────────────────────────────
export const emergencyService = {
  getAlerts: () =>
    api.get(ENDPOINTS.emergencyAlerts),

  acknowledge: (id) =>
    api.post(ENDPOINTS.acknowledgeAlert(id)),

  dismiss: (id) =>
    api.delete(ENDPOINTS.dismissAlert(id)),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: () =>
    api.get(ENDPOINTS.notifications),

  markRead: (id) =>
    api.patch(ENDPOINTS.markNotifRead(id)),

  markAllRead: () =>
    api.patch(ENDPOINTS.markAllRead),

  delete: (id) =>
    api.delete(ENDPOINTS.deleteNotif(id)),
}

// ── Doctor Profile ────────────────────────────────────────────────────────────
export const profileService = {
  getProfile: () =>
    api.get(ENDPOINTS.profile),

  update: (data) =>
    api.put(ENDPOINTS.updateProfile, data),

  updateSettings: (settings) =>
    api.put(ENDPOINTS.updateSettings, settings),
}
