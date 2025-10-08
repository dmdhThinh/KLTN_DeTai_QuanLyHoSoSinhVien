const TOKEN_KEY = 'token'
const SV_ID_KEY = 'sinhVienId'
const GV_ID_KEY = 'giangVienId'
const ROLE_KEY = 'role'
// Allow overriding API base via env. When running without the CRA dev proxy,
// set REACT_APP_API_BASE=http://localhost:8080
const API_BASE = process.env.REACT_APP_API_BASE || ''

export function saveAuth({ token, sinhVienId, giangVienId, role }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (sinhVienId != null) localStorage.setItem(SV_ID_KEY, String(sinhVienId))
  if (giangVienId != null) localStorage.setItem(GV_ID_KEY, String(giangVienId))
  if (role) localStorage.setItem(ROLE_KEY, role)
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SV_ID_KEY)
    localStorage.removeItem(GV_ID_KEY)
    localStorage.removeItem(ROLE_KEY)
  } catch (_) {}
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getSinhVienId() {
  const v = localStorage.getItem(SV_ID_KEY)
  return v ? parseInt(v, 10) : null
}

export function getGiangVienId() {
  const v = localStorage.getItem(GV_ID_KEY)
  return v ? parseInt(v, 10) : null
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const url = `${API_BASE}${path}`
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) throw new Error(await res.text())
  if (res.status === 204) return null
  return res.json()
}

export async function login(username, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function getSinhVienById(id) {
  return apiFetch(`/api/sinhviens/${id}`)
}

export async function getGiangVienById(id) {
  return apiFetch(`/api/giangviens/${id}`)
}


