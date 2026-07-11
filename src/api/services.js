import { apiClient } from './client';
import { ENDPOINTS } from './config';

// --- Hospitals ---
export const getHospitals = () => apiClient.get(ENDPOINTS.hospitals);
export const getHospitalById = (hospitalId) => apiClient.get(ENDPOINTS.hospital(hospitalId));
export const getDepartments = (hospitalId) => apiClient.get(ENDPOINTS.departments(hospitalId));
export const getDoctors = (hospitalId) => apiClient.get(ENDPOINTS.doctors(hospitalId));

// --- Patient profile ---
export const getPatientProfile = (patientId) => apiClient.get(ENDPOINTS.patient(patientId));
export const updatePatientProfile = (patientId, updates) =>
  apiClient.patch(ENDPOINTS.patient(patientId), updates);
export const saveHospital = (patientId, hospitalId) =>
  apiClient.post(ENDPOINTS.savedHospital(patientId), { hospitalId });
export const unsaveHospital = (patientId, hospitalId) =>
  apiClient.delete(ENDPOINTS.unsaveHospital(patientId, hospitalId));

// --- Visits (medical records) ---
export const getPatientVisits = (patientId) => apiClient.get(ENDPOINTS.patientVisits(patientId));
export const createVisit = (visitData) => apiClient.post(ENDPOINTS.createVisit, visitData);

// --- Queue / "Book token" ---
export const bookQueueToken = (hospitalId, deptId, patientId, visitId) =>
  apiClient.post(ENDPOINTS.createQueueToken, { hospitalId, deptId, patientId, visitId });
export const getDepartmentQueue = (hospitalId, deptId) =>
  apiClient.get(ENDPOINTS.departmentQueue(hospitalId, deptId));


export const startIntake = (payload) => apiClient.post(ENDPOINTS.startIntake, payload);
export const getSummary = (visitId) => apiClient.get(ENDPOINTS.summary(visitId));
export const approveSummary = (visitId) => apiClient.post(ENDPOINTS.approveSummary(visitId));

export const getConsentEvents = (visitId) => apiClient.get(ENDPOINTS.consentEvents(visitId));