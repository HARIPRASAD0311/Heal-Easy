/**
 * HealEasy — API Client
 *
 * Thin fetch wrapper. Attaches Authorization header from localStorage,
 * handles JSON parsing and error normalisation.
 */

import { API_BASE } from './config'

function getToken() {
  return localStorage.getItem('doctor_token') || ''
}

async function request(method, path, body = undefined) {
  const headers = {
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  // 204 No Content
  if (res.status === 204) return null

  return res.json()
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
}
