// ─── HealEasy Doctor Dashboard — API Layer ───────────────────────────────────
//
// All data calls live here. Pages import from this file only.
// Backend team: set VITE_API_URL in .env (default: http://localhost:8000/api)
//
// Expected response shapes are documented in /src/api/README.md
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function token() {
  return localStorage.getItem('healeasy_doctor_token') ?? ''
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`)
  return data
}

const get    = (path)        => req('GET',    path)
const post   = (path, body)  => req('POST',   path, body)
const put    = (path, body)  => req('PUT',    path, body)
const patch  = (path, body)  => req('PATCH',  path, body)
const del    = (path)        => req('DELETE', path)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login    = (email, password) => post('/auth/doctor/login', { email, password })
export const logout   = ()                => post('/auth/doctor/logout')
export const getMe    = ()                => get('/auth/doctor/me')

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats   = ()  => get('/doctor/dashboard/stats')
export const getWeeklyData       = ()  => get('/doctor/dashboard/weekly')
export const getRecentPatients   = ()  => get('/doctor/dashboard/recent-patients')
export const getAnnouncements    = ()  => get('/hospital/announcements')

// ── Queue ─────────────────────────────────────────────────────────────────────
export const getQueue      = ()   => get('/doctor/queue')
export const callPatient   = (id) => post(`/doctor/queue/${id}/call`)
export const skipPatient   = (id) => post(`/doctor/queue/${id}/skip`)

// ── Patient ───────────────────────────────────────────────────────────────────
export const getPatientSummary = (id) => get(`/patients/${id}/summary`)
export const getPatientHistory = (id) => get(`/patients/${id}/history`)

// ── Consultation ──────────────────────────────────────────────────────────────
export const startConsultation = (patientId)       => post(`/consultations/${patientId}/start`)
export const endConsultation   = (consultationId)  => post(`/consultations/${consultationId}/end`)

// ── SOAP Notes ────────────────────────────────────────────────────────────────
export const getSOAPNotes     = (consultationId)        => get(`/consultations/${consultationId}/soap`)
export const approveSOAP      = (consultationId, notes) => post(`/consultations/${consultationId}/soap/approve`, notes)
export const rejectSOAP       = (consultationId)        => post(`/consultations/${consultationId}/soap/reject`)
export const regenerateSOAP   = (consultationId)        => post(`/consultations/${consultationId}/soap/regenerate`)
export const saveSOAPDraft    = (consultationId, notes) => put(`/consultations/${consultationId}/soap`, notes)

// ── Emergency ─────────────────────────────────────────────────────────────────
export const getEmergencyAlerts  = ()   => get('/doctor/emergency-alerts')
export const acknowledgeAlert    = (id) => post(`/doctor/emergency-alerts/${id}/acknowledge`)
export const dismissAlert        = (id) => del(`/doctor/emergency-alerts/${id}`)

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = ()   => get('/doctor/notifications')
export const markNotifRead    = (id) => patch(`/doctor/notifications/${id}/read`)
export const markAllRead      = ()   => patch('/doctor/notifications/read-all')
export const deleteNotif      = (id) => del(`/doctor/notifications/${id}`)

// ── Doctor Profile ────────────────────────────────────────────────────────────
export const getDoctorProfile  = ()      => get('/doctor/profile')
export const updateProfile     = (data)  => put('/doctor/profile', data)
export const updateSettings    = (data)  => put('/doctor/settings', data)
