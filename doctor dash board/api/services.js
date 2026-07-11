import { api } from './client'
import { ENDPOINTS } from './config'
import { cognitoSignIn, cognitoSignOut, cognitoGetStoredSession } from './cognitoAuth'

function storeDoctorContext({ hospitalId, doctorId }) {
  localStorage.setItem('doctor_hospitalId', hospitalId || '')
  localStorage.setItem('doctor_doctorId', doctorId || '')
}

function getDoctorContext() {
  return {
    hospitalId: localStorage.getItem('doctor_hospitalId'),
    doctorId: localStorage.getItem('doctor_doctorId'),
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  login: async (email, password) => {
    const session = await cognitoSignIn(email, password)
    storeDoctorContext(session)

    let profile = null
    if (session.hospitalId && session.doctorId) {
      profile = await api.get(ENDPOINTS.doctor(session.hospitalId, session.doctorId)).catch(() => null)
    }

    return {
      token: session.idToken,
      doctor: { ...session, ...profile },
    }
  },

  logout: () => {
    cognitoSignOut()
    localStorage.removeItem('doctor_hospitalId')
    localStorage.removeItem('doctor_doctorId')
  },

  getMe: async () => {
    const session = await cognitoGetStoredSession()
    if (!session) throw new Error('No active session')
    storeDoctorContext(session)

    let profile = null
    if (session.hospitalId && session.doctorId) {
      profile = await api.get(ENDPOINTS.doctor(session.hospitalId, session.doctorId)).catch(() => null)
    }

    return { ...session, ...profile }
  },
}

// ── Queue ─────────────────────────────────────────────────────────────────────

export const queueService = {
  getQueue: (deptId) => {
    const { hospitalId } = getDoctorContext()
    return api.get(ENDPOINTS.departmentQueue(hospitalId, deptId))
  },

  callPatient: (deptId, tokenId) => {
    const { hospitalId } = getDoctorContext()
    return api.patch(ENDPOINTS.updateQueueStatus(hospitalId, deptId, tokenId), { status: 'called' })
  },

  skipPatient: (deptId, tokenId) => {
    const { hospitalId } = getDoctorContext()
    return api.patch(ENDPOINTS.updateQueueStatus(hospitalId, deptId, tokenId), { status: 'no_show' })
  },
}

// ── Visits — your real "my patients" source ────────────────────────────────────
export const visitService = {
  getMyVisits: () => {
    const { doctorId } = getDoctorContext()
    return api.get(ENDPOINTS.doctorVisits(doctorId))
  },

  updateStatus: (patientId, visitId, status) =>
    api.patch(ENDPOINTS.updateVisitStatus(patientId, visitId), { status }),
}

// ── Patient ───────────────────────────────────────────────────────────────────
export const patientService = {
  getSummary: (visitId) =>
    api.get(ENDPOINTS.patientSummary(visitId)),
}

// ── SOAP Notes ────────────────────────────────────────────────────────────────
export const soapService = {
  getNotes: (visitId) =>
    api.get(ENDPOINTS.soapNotes(visitId)),

  approve: (visitId) =>
    api.post(ENDPOINTS.approveSOAP(visitId)),

  reject: (visitId) =>
    
    api.post(ENDPOINTS.rejectSOAP(visitId)),

  saveDraft: (visitId, notes) =>
    api.patch(ENDPOINTS.soapNotes(visitId), notes),

 
}

// ── Emergency ─────────────────────────────────────────────────────────────────
export const emergencyService = {
  getAlerts: () => {
    const { doctorId } = getDoctorContext()
    return api.get(ENDPOINTS.emergencyAlerts(doctorId))
  },

  acknowledge: (alertId) => {
    const { doctorId } = getDoctorContext()
    return api.post(ENDPOINTS.acknowledgeAlert(doctorId, alertId))
  },

  dismiss: (alertId) => {
    const { doctorId } = getDoctorContext()
    return api.delete(ENDPOINTS.dismissAlert(doctorId, alertId))
  },
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: () => {
    const { doctorId } = getDoctorContext()
    return api.get(ENDPOINTS.notifications(doctorId))
  },

  markRead: (notificationId) => {
    const { doctorId } = getDoctorContext()
    return api.post(ENDPOINTS.markNotifRead(doctorId, notificationId))
  },

  markAllRead: () => {
    const { doctorId } = getDoctorContext()
    return api.post(ENDPOINTS.markAllRead(doctorId))
  },

  delete: (notificationId) => {
    const { doctorId } = getDoctorContext()
    return api.delete(ENDPOINTS.deleteNotif(doctorId, notificationId))
  },
}

// ── Doctor Profile ────────────────────────────────────────────────────────────
export const profileService = {
  getProfile: () => {
    const { hospitalId, doctorId } = getDoctorContext()
    return api.get(ENDPOINTS.doctor(hospitalId, doctorId))
  },

  updateStatus: (status) => {
    const { hospitalId, doctorId } = getDoctorContext()
    return api.patch(ENDPOINTS.updateDoctorStatus(hospitalId, doctorId), { status })
  },

}