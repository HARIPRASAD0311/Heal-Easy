import {
  authService,
  queueService,
  visitService,
  patientService,
  soapService,
  emergencyService,
  notificationService,
  profileService,
} from './services'

// ── Auth 
export const login  = authService.login
export const logout = authService.logout
export const getMe  = authService.getMe

const notImplemented = (name) => () =>
  Promise.reject(new Error(`${name} is not implemented on the backend yet`))

export const getDashboardStats = notImplemented('getDashboardStats')
export const getWeeklyData     = notImplemented('getWeeklyData')
export const getRecentPatients = notImplemented('getRecentPatients')
export const getAnnouncements  = notImplemented('getAnnouncements')
export const startConsultation = notImplemented('startConsultation') 
export const endConsultation   = notImplemented('endConsultation')
export const regenerateSOAP    = notImplemented('regenerateSOAP')
export const updateSettings    = notImplemented('updateSettings')

// ── Queue 
export const getQueue    = visitService.getMyVisits
export const callPatient = ({ patientId, visitId }) =>
  visitService.updateStatus(patientId, visitId, 'in_consult')
export const skipPatient = ({ patientId, visitId }) =>
  visitService.updateStatus(patientId, visitId, 'no_show')

// ── Patient ───────────────────────────────────────────────────────────────────

export const getPatientSummary = patientService.getSummary
export const getPatientHistory = notImplemented('getPatientHistory') 

// ── SOAP Notes ────────────────────────────────────────────────────────────────
// SHAPE CHANGE: all take visitId, not consultationId.
export const getSOAPNotes  = soapService.getNotes
export const approveSOAP   = soapService.approve
export const rejectSOAP    = soapService.reject  
export const saveSOAPDraft = soapService.saveDraft

// ── Emergency ─────────────────────────────────────────────────────────────────
export const getEmergencyAlerts = emergencyService.getAlerts
export const acknowledgeAlert   = emergencyService.acknowledge
export const dismissAlert       = emergencyService.dismiss

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = notificationService.getAll
export const markNotifRead    = notificationService.markRead
export const markAllRead      = notificationService.markAllRead
export const deleteNotif      = notificationService.delete

// ── Doctor Profile ────────────────────────────────────────────────────────────
export const getDoctorProfile = profileService.getProfile
export const updateProfile    = profileService.updateStatus