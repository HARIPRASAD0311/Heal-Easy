import { useState } from "react";
import { Link } from "react-router-dom";
import { loginPatient, loginDoctor, saveSession } from "../../services/authService";
import useMutation from "../../hooks/useMutation";

// ── Logo ──────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex flex-col items-center mb-7">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
        flex items-center justify-center mb-3 shadow-sm">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
        </svg>
      </div>
      <h1 className="font-bold text-xl text-slate-800">HealEasy</h1>
      <p className="text-sm text-slate-500 mt-0.5">Find your way. Tell your story once.</p>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, accentColor = "teal" }) {
  const ring = accentColor === "blue" ? "focus:ring-blue-300" : "focus:ring-teal-300";
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
          text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:border-transparent ${ring} transition-colors`}
      />
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <p className="text-xs text-red-600 font-medium leading-snug">{message}</p>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState(null); // null | "patient" | "doctor"

  // Patient form state
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");

  // Doctor form state
  const [email,   setEmail]   = useState("");
  const [docPass, setDocPass] = useState("");

  // ── Patient login mutation ────────────────────────────────────
  const patientMutation = useMutation(
    (creds) => loginPatient(creds),
    {
      onSuccess: (data) => {
        // Backend returns: { token, patientId, name, role }
        saveSession({
          token:     data.token,
          patientId: data.patientId,
          role:      data.role ?? "patient",
        });
        window.location.href = "/patient/dashboard";
      },
    }
  );

  // ── Doctor login mutation ─────────────────────────────────────
  const doctorMutation = useMutation(
    (creds) => loginDoctor(creds),
    {
      onSuccess: (data) => {
        // Backend returns: { token, doctorId, name, role }
        saveSession({
          token:    data.token,
          doctorId: data.doctorId,
          role:     data.role ?? "doctor",
        });
        window.location.href = "/doctor/dashboard";
      },
    }
  );

  // ── Demo shortcuts — bypass backend ──────────────────────────
  function demoPatient() {
    // PAT-A1B2C3D4 = Rajesh Sharma — first patient in healeasy.db
    saveSession({ token: "demo-patient-token", patientId: "PAT-A1B2C3D4", role: "patient" });
    window.location.href = "/patient/dashboard";
  }
  function demoDoctor() {
    // DOC-EE55FF66 = Dr. Arjun Reddy — busiest doctor in healeasy.db
    saveSession({ token: "demo-doctor-token", doctorId: "DOC-EE55FF66", role: "doctor" });
    window.location.href = "/doctor/dashboard";
  }

  // ── Submit handlers ───────────────────────────────────────────
  async function handlePatientSubmit(e) {
    e.preventDefault();
    await patientMutation.mutate({ phone, password }).catch(() => {});
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    await doctorMutation.mutate({ email, password: docPass }).catch(() => {});
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-sm">

        <Logo />

        {/* ── Role selector ─────────────────────────────────── */}
        {!mode && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("patient")}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold
                hover:bg-teal-700 transition-colors"
            >
              Continue as Patient
            </button>
            <button
              onClick={() => setMode("doctor")}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
                hover:bg-blue-700 transition-colors"
            >
              Continue as Doctor
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or demo</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={demoPatient}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                  text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Demo Patient
              </button>
              <button
                onClick={demoDoctor}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                  text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Demo Doctor
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 pt-1">
              New patient?{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        )}

        {/* ── Patient login form ─────────────────────────────── */}
        {mode === "patient" && (
          <form onSubmit={handlePatientSubmit} className="space-y-4" noValidate>
            <h2 className="font-bold text-slate-700">Patient Login</h2>

            <Field
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+91 9876543210"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <ErrorBanner message={patientMutation.error} />

            <button
              type="submit"
              disabled={patientMutation.loading}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold
                hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
              {patientMutation.loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setMode(null); patientMutation.reset(); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back
              </button>
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Create account
              </Link>
            </div>
          </form>
        )}

        {/* ── Doctor login form ──────────────────────────────── */}
        {mode === "doctor" && (
          <form onSubmit={handleDoctorSubmit} className="space-y-4" noValidate>
            <h2 className="font-bold text-slate-700">Doctor Login</h2>

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="doctor@hospital.com"
              accentColor="blue"
            />
            <Field
              label="Password"
              type="password"
              value={docPass}
              onChange={setDocPass}
              placeholder="••••••••"
              accentColor="blue"
            />

            <ErrorBanner message={doctorMutation.error} />

            <button
              type="submit"
              disabled={doctorMutation.loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
                hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {doctorMutation.loading ? "Signing in…" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => { setMode(null); doctorMutation.reset(); }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
