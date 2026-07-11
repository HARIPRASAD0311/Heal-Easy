export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  
  hospitals:        '/hospitals',
  hospital:         (hospitalId) => `/hospitals/${hospitalId}`,
  departments:      (hospitalId) => `/hospitals/${hospitalId}/departments`,
  doctors:          (hospitalId) => `/hospitals/${hospitalId}/doctors`,

  
  patient:          (patientId) => `/patients/${patientId}`,
  savedHospital:    (patientId) => `/patients/${patientId}/saved-hospitals`,
  unsaveHospital:   (patientId, hospitalId) => `/patients/${patientId}/saved-hospitals/${hospitalId}`,

  
  patientVisits:    (patientId) => `/patients/${patientId}/visits`,
  createVisit:      '/visits',

  
  createQueueToken: '/queue-tokens',
  departmentQueue:  (hospitalId, deptId) => `/hospitals/${hospitalId}/departments/${deptId}/queue`,

  
  startIntake:      '/intake',
  summary:          (visitId) => `/visits/${visitId}/summary`,
  approveSummary:   (visitId) => `/visits/${visitId}/summary/approve`,

 
  consentEvents:    (visitId) => `/visits/${visitId}/consent-events`,
};