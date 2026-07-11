/**
 * Prototype persistence layer. No backend — everything lives in localStorage
 * so appointments and tokens survive a refresh but stay entirely client-side.
 * Swapping these for fetch() calls to a real API later is a drop-in change,
 * since the shapes mirror typical REST responses.
 */
const APPOINTMENTS_KEY = 'healeasy_appointments';
const TOKENS_KEY = 'healeasy_tokens';

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage unavailable (e.g. private mode) — fail silently, prototype-only.
  }
}

function randomDigits(count) {
  let out = '';
  for (let i = 0; i < count; i += 1) out += Math.floor(Math.random() * 10);
  return out;
}

/* ---------------- Appointments ---------------- */

export function getAppointments() {
  return readList(APPOINTMENTS_KEY).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addAppointment(appointment) {
  const list = readList(APPOINTMENTS_KEY);
  const record = {
    id: `APT-${randomDigits(6)}`,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    ...appointment,
  };
  list.push(record);
  writeList(APPOINTMENTS_KEY, list);
  return record;
}

export function updateAppointmentStatus(id, status) {
  const list = readList(APPOINTMENTS_KEY);
  const next = list.map((a) => (a.id === id ? { ...a, status } : a));
  writeList(APPOINTMENTS_KEY, next);
  return next.find((a) => a.id === id);
}

export function rescheduleAppointment(id, { date, time }) {
  const list = readList(APPOINTMENTS_KEY);
  const next = list.map((a) => (a.id === id ? { ...a, date, time, status: 'upcoming' } : a));
  writeList(APPOINTMENTS_KEY, next);
  return next.find((a) => a.id === id);
}

/* ---------------- Queue Tokens ---------------- */

export function getTokens() {
  return readList(TOKENS_KEY).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addToken(token) {
  const list = readList(TOKENS_KEY);
  const queuePosition = Math.max(1, Math.floor(Math.random() * 10) + 3);
  const record = {
    id: `TKN-${randomDigits(6)}`,
    tokenNumber: `${token.departmentCode || 'GN'}-${randomDigits(3)}`,
    queuePosition,
    estimatedWait: `${queuePosition * 4} min`,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...token,
  };
  list.push(record);
  writeList(TOKENS_KEY, list);
  return record;
}

export function advanceToken(id) {
  const list = readList(TOKENS_KEY);
  const next = list.map((t) => {
    if (t.id !== id || t.status !== 'active') return t;
    const queuePosition = Math.max(0, t.queuePosition - 1);
    return {
      ...t,
      queuePosition,
      estimatedWait: `${queuePosition * 4} min`,
      status: queuePosition === 0 ? 'completed' : 'active',
    };
  });
  writeList(TOKENS_KEY, next);
  return next.find((t) => t.id === id);
}

export function cancelToken(id) {
  const list = readList(TOKENS_KEY);
  const next = list.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t));
  writeList(TOKENS_KEY, next);
  return next.find((t) => t.id === id);
}
