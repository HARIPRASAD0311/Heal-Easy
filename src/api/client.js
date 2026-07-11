import { API_BASE } from './config';
import { getStoredSession } from './authService';

async function request(path, options = {}) {
  const session = await getStoredSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.idToken ? { Authorization: `Bearer ${session.idToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || `Request failed: ${response.status}`);
  }

  return body;
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};