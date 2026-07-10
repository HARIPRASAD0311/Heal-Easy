import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login    from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Patient
import PatientDashboard  from "../pages/patient/Dashboard";
import VoiceInput        from "../pages/patient/VoiceInput";
import TranscriptReview  from "../pages/patient/TranscriptReview";
import Queue             from "../pages/patient/Queue";
import Profile           from "../pages/patient/Profile";

// Doctor
import DoctorDashboard  from "../pages/doctor/Dashboard";
import PatientQueue     from "../pages/doctor/PatientQueue";
import PatientDetails   from "../pages/doctor/PatientDetails";
import Consultation     from "../pages/doctor/Consultation";
import AIAssistant      from "../pages/doctor/AIAssistant";
import MedicalRecord    from "../pages/doctor/MedicalRecord";

// Shared
import NotFound from "../pages/shared/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/"         element={<Login />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient */}
        <Route path="/patient/dashboard"  element={<PatientDashboard />} />
        <Route path="/patient/voice"      element={<VoiceInput />} />
        <Route path="/patient/transcript" element={<TranscriptReview />} />
        <Route path="/patient/queue"      element={<Queue />} />
        <Route path="/patient/profile"    element={<Profile />} />

        {/* Doctor */}
        <Route path="/doctor/dashboard"               element={<DoctorDashboard />} />
        <Route path="/doctor/queue"                   element={<PatientQueue />} />
        <Route path="/doctor/patient/:patientId"      element={<PatientDetails />} />
        <Route path="/doctor/consultation"            element={<Consultation />} />
        <Route path="/doctor/ai-assistant"            element={<AIAssistant />} />
        <Route path="/doctor/record/:consultationId"  element={<MedicalRecord />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
