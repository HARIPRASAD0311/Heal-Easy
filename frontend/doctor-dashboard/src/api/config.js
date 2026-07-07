/**
 * HealEasy Doctor Dashboard — API Configuration
 *
 * Set VITE_API_BASE_URL in your .env file:
 *   VITE_API_BASE_URL=http://localhost:8000/api
 *
 * All endpoints follow REST conventions. The backend team can adjust
 * paths in the ENDPOINTS map below without touching any page component.
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const ENDPOINTS = {
  // Auth
  login:            '/auth/doctor/login',
  logout:           '/auth/doctor/logout',
  me:               '/auth/doctor/me',

  // Dashboard
  dashboardStats:   '/doctor/dashboard/stats',
  weeklyStats:      '/doctor/dashboard/weekly',
  recentPatients:   '/doctor/dashboard/recent-patients',
  announcements:    '/hospital/announcements',

  // Queue
  queue:            '/doctor/queue',
  queuePatient:     (id) => `/doctor/queue/${id}`,
  callPatient:      (id) => `/doctor/queue/${id}/call`,
  skipPatient:      (id) => `/doctor/queue/${id}/skip`,

  // Patient
  patientSummary:   (id) => `/patients/${id}/summary`,
  patientHistory:   (id) => `/patients/${id}/history`,

  // Consultation
  startConsult:     (id) => `/consultations/${id}/start`,
  endConsult:       (id) => `/consultations/${id}/end`,
  transcriptStream: (id) => `/consultations/${id}/transcript`,

  // SOAP Notes
  soapNotes:        (id) => `/consultations/${id}/soap`,
  approveSOAP:      (id) => `/consultations/${id}/soap/approve`,
  rejectSOAP:       (id) => `/consultations/${id}/soap/reject`,
  regenerateSOAP:   (id) => `/consultations/${id}/soap/regenerate`,
  exportSOAP:       (id) => `/consultations/${id}/soap/export`,

  // Emergency
  emergencyAlerts:  '/doctor/emergency-alerts',
  acknowledgeAlert: (id) => `/doctor/emergency-alerts/${id}/acknowledge`,
  dismissAlert:     (id) => `/doctor/emergency-alerts/${id}/dismiss`,

  // Notifications
  notifications:    '/doctor/notifications',
  markNotifRead:    (id) => `/doctor/notifications/${id}/read`,
  markAllRead:      '/doctor/notifications/read-all',
  deleteNotif:      (id) => `/doctor/notifications/${id}`,

  // Doctor profile
  profile:          '/doctor/profile',
  updateProfile:    '/doctor/profile',
  updateSettings:   '/doctor/settings',
}
