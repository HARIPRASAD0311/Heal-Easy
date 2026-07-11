export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const ENDPOINTS = {
  // Hospital / doctor lookup
  doctors:          (hospitalId) => `/hospitals/${hospitalId}/doctors`,
  doctor:           (hospitalId, doctorId) => `/hospitals/${hospitalId}/doctors/${doctorId}`,
  updateDoctorStatus: (hospitalId, doctorId) => `/hospitals/${hospitalId}/doctors/${doctorId}/status`,

  // Queue — NOTE: your backend scopes queue by hospital+department, not
  // a generic "my queue" endpoint. The doctor's assigned department
  // needs to be known client-side (from the doctor's own record) to
  // call this correctly.
  departmentQueue:  (hospitalId, deptId) => `/hospitals/${hospitalId}/departments/${deptId}/queue`,
  updateQueueStatus: (hospitalId, deptId, tokenId) => `/queue-tokens/${hospitalId}/${deptId}/${tokenId}`,

  // Visits — this is your real "which patients are mine" source, via GSI1
  doctorVisits:     (doctorId) => `/doctors/${doctorId}/visits`,
  updateVisitStatus: (patientId, visitId) => `/visits/${patientId}/${visitId}`,
  assignDoctor:     (patientId, visitId) => `/visits/${patientId}/${visitId}/assign-doctor`,

  // Patient summary (AI intake result)
  patientSummary:   (visitId) => `/visits/${visitId}/summary`,

  // SOAP Notes
  soapNotes:        (visitId) => `/visits/${visitId}/soap`,
  approveSOAP:      (visitId) => `/visits/${visitId}/soap/approve`,
  rejectSOAP:        (visitId) => `/visits/${visitId}/soap/reject`, 
  
  // Emergency
  emergencyAlerts:  (doctorId) => `/doctors/${doctorId}/alerts`,
  acknowledgeAlert: (doctorId, alertId) => `/doctors/${doctorId}/alerts/${alertId}/acknowledge`,
  dismissAlert:     (doctorId, alertId) => `/doctors/${doctorId}/alerts/${alertId}`,

  // Notifications
  notifications:    (doctorId) => `/doctors/${doctorId}/notifications`,
  markNotifRead:    (doctorId, notificationId) => `/doctors/${doctorId}/notifications/${notificationId}/read`,
  markAllRead:      (doctorId) => `/doctors/${doctorId}/notifications/mark-all-read`,
  deleteNotif:      (doctorId, notificationId) => `/doctors/${doctorId}/notifications/${notificationId}`,

  // Consent audit trail
  consentEvents:    (visitId) => `/visits/${visitId}/consent-events`,

}