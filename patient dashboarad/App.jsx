import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import GlobalEffects from './components/GlobalEffects';
import Toast from './components/Toast';
import RequireAuth from './components/RequireAuth';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import HospitalSearch from './pages/HospitalSearch';
import HospitalDetails from './pages/HospitalDetails';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import GetToken from './pages/GetToken';
import MyAppointments from './pages/MyAppointments';
import MyTokens from './pages/MyTokens';

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <GlobalEffects />
          <Toast />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hospital-search" element={<HospitalSearch />} />
            <Route path="/hospital-details/:id" element={<HospitalDetails />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/book-appointment"
              element={<RequireAuth reason="Book Appointment"><BookAppointment /></RequireAuth>}
            />
            <Route
              path="/get-token"
              element={<RequireAuth reason="Get Token"><GetToken /></RequireAuth>}
            />
            <Route
              path="/my-appointments"
              element={<RequireAuth reason="My Appointments"><MyAppointments /></RequireAuth>}
            />
            <Route
              path="/my-tokens"
              element={<RequireAuth reason="My Tokens"><MyTokens /></RequireAuth>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
