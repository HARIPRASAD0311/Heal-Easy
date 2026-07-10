import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "aws-amplify/auth";
// ── Step indicator ────────────────────────────────────────────────
function Steps({ current }) {
  const labels = ["Account", "Personal", "Medical"];
  return (
    <div className="flex items-center gap-1 mb-7">
      {labels.map((label, i) => {
        const step  = i + 1;
        const done  = current > step;
        const active = current === step;
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className={`flex flex-col items-center gap-1 flex-1`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                transition-colors
                ${done   ? "bg-teal-600 text-white"
                : active ? "bg-teal-600 text-white ring-2 ring-teal-200"
                         : "bg-slate-100 text-slate-400"}`}>
                {done
                  ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  : step}
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-teal-600" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-px flex-1 mb-4 transition-colors ${done ? "bg-teal-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable field ────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 block mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS = `w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
  text-slate-800 placeholder-slate-400
  focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent
  transition-colors`;

const SELECT_CLS = `w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
  text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent
  transition-colors cursor-pointer`;

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

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // ── Step 1: Account ───────────────────────────────────────────
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  // ── Step 2: Personal ──────────────────────────────────────────
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [age,    setAge]    = useState("");
  const [gender, setGender] = useState("");

  // ── Step 3: Medical ───────────────────────────────────────────
  const [bloodGroup,     setBloodGroup]     = useState("");
  const [medicalHistory, setMedicalHistory] = useState("None");

  // ── Inline validation ─────────────────────────────────────────
  const [validationError, setValidationError] = useState("");

  // ── Register mutation ─────────────────────────────────────────
  
  // ── Step 1 validation ─────────────────────────────────────────
  function validateStep1() {
    if (!phone.trim()) return "Phone number is required.";
    if (!/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, "")))
      return "Enter a valid phone number (10–13 digits).";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  }

  function handleStep1(e) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setValidationError(err); return; }
    setValidationError("");
    setStep(2);
  }

  // ── Step 2 validation ─────────────────────────────────────────
  function validateStep2() {
    if (!name.trim()) return "Full name is required.";
    if (age && (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120))
      return "Enter a valid age (1–120).";
    return "";
  }

  function handleStep2(e) {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setValidationError(err); return; }
    setValidationError("");
    setStep(3);
  }

  // ── Step 3 — submit ───────────────────────────────────────────
  async function handleSubmit(e) {
  e.preventDefault();
  setValidationError("");

  try {
    const result = await signUp({
      username: phone.trim(),
      password: password,
      options: {
        userAttributes: {
          phone_number: phone.trim(),
          name: name.trim(),
          email: email.trim() || undefined,
        },
      },
    });

    console.log(result);

    alert("OTP sent successfully!");

    navigate("/verify-otp", {
      state: {
        phone: phone.trim(),
      },
    });

  } catch (err) {
  console.error("FULL ERROR:", err);

  alert(`
Name: ${err.name}
Message: ${err.message}
Code: ${err.code ?? "N/A"}
`);
}
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
              flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-800">HealEasy</span>
          </div>
          <Link to="/login"
            className="text-xs font-semibold text-teal-600 hover:underline">
            Sign in
          </Link>
        </div>

        <h2 className="font-bold text-xl text-slate-800 mb-1">Create account</h2>
        <p className="text-sm text-slate-500 mb-5">Register as a patient to get started.</p>

        <Steps current={step} />

        {/* ── Step 1: Account ──────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4" noValidate>
            <Field label="Phone Number" required>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210" className={INPUT_CLS} />
            </Field>
            <Field label="Password" required>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" className={INPUT_CLS} />
            </Field>
            <Field label="Confirm Password" required>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password" className={INPUT_CLS} />
            </Field>

            <ErrorBanner message={validationError} />

            <button type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold
                hover:bg-teal-700 transition-colors">
              Continue →
            </button>

            <p className="text-center text-xs text-slate-400">
              Already registered?{" "}
              <Link to="/login" className="text-teal-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {/* ── Step 2: Personal ─────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4" noValidate>
            <Field label="Full Name" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Kumar" className={INPUT_CLS} />
            </Field>
            <Field label="Email (optional)">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" className={INPUT_CLS} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  placeholder="30" min="1" max="120" className={INPUT_CLS} />
              </Field>
              <Field label="Gender">
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  className={SELECT_CLS}>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <ErrorBanner message={validationError} />

            <div className="flex gap-2">
              <button type="button" onClick={() => { setStep(1); setValidationError(""); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600
                  text-sm font-semibold hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button type="submit"
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold
                  hover:bg-teal-700 transition-colors">
                Continue →
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Medical ───────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Blood Group">
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                className={SELECT_CLS}>
                <option value="">Select blood group</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </Field>
            <Field label="Existing Medical Conditions">
              <select value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)}
                className={SELECT_CLS}>
                {["None","Hypertension","Diabetes","Asthma","Allergies","Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <ErrorBanner message={error || validationError} />

            <div className="flex gap-2">
              <button type="button" onClick={() => { setStep(2); reset(); setValidationError(""); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600
                  text-sm font-semibold hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold
                  hover:bg-teal-700 disabled:opacity-60 transition-colors">
                {loading ? "Registering…" : "Create Account"}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              Blood group and medical history can be updated later from your profile.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
