import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DoctorLogin from './pages/DoctorLogin'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import LiveQueue from './pages/LiveQueue'
import PatientSummary from './pages/PatientSummary'
import Consultation from './pages/Consultation'
import SOAPNotes from './pages/SOAPNotes'
import PatientHistory from './pages/PatientHistory'
import EmergencyAlerts from './pages/EmergencyAlerts'
import Notifications from './pages/Notifications'
import DoctorProfile from './pages/DoctorProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<DoctorLogin />} />
        <Route path="/doctor" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="queue" element={<LiveQueue />} />
          <Route path="patient/:id/summary" element={<PatientSummary />} />
          <Route path="consultation/:id" element={<Consultation />} />
          <Route path="soap/:id" element={<SOAPNotes />} />
          <Route path="patient/:id/history" element={<PatientHistory />} />
          <Route path="emergency" element={<EmergencyAlerts />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
