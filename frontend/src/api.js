// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || ''
const SESSION_ROLE_KEY = 'current_role'
const SESSION_ID_KEY = 'current_user_id'
// Mỗi role có key riêng biệt
const TOKEN_KEYS = {
  'Sinh viên': 'token_sv',
  'Giảng viên': 'token_gv',
  'Quản trị': 'token_admin',
}
const ROLE_KEYS = {
  'Sinh viên': 'role_sv',
  'Giảng viên': 'role_gv',
  'Quản trị': 'role_admin',
}

const SV_ID_KEY = 'sinhVienId'
const GV_ID_KEY = 'giangVienId'

// 🧩 Lưu auth theo role
export function saveAuth({ token, sinhVienId, giangVienId, role }) {
  if (!role || !token) return

  // Lưu token và role theo vai trò
  localStorage.setItem(TOKEN_KEYS[role], token)
  localStorage.setItem(ROLE_KEYS[role], role)

  // 🔹 Lưu role & id riêng trong sessionStorage cho từng tab
  sessionStorage.setItem(SESSION_ROLE_KEY, role)
  if (role === 'Sinh viên' && sinhVienId)
    sessionStorage.setItem(SESSION_ID_KEY, sinhVienId)
  if (role === 'Giảng viên' && giangVienId)
    sessionStorage.setItem(SESSION_ID_KEY, giangVienId)
}


// 🧩 Xóa token theo role (chỉ role đó)
export function clearAuth(role) {
  try {
    if (role && TOKEN_KEYS[role]) {
      localStorage.removeItem(TOKEN_KEYS[role])
      localStorage.removeItem(ROLE_KEYS[role])
      if (role === 'Sinh viên') localStorage.removeItem(SV_ID_KEY)
      if (role === 'Giảng viên') localStorage.removeItem(GV_ID_KEY)
    }
    sessionStorage.removeItem(SESSION_ROLE_KEY)
    sessionStorage.removeItem(SESSION_ID_KEY)
  } catch (_) {}
}

// 🧩 Lấy token đúng role hiện tại
export function getToken() {
  const role = getRole()
  return role ? localStorage.getItem(TOKEN_KEYS[role]) : null
}

// 🧩 Lấy vai trò hiện tại (ưu tiên role_admin > role_gv > role_sv)

// 🧩 Lấy vai trò hiện tại
export function getRole() {
  // Ưu tiên lấy theo session (mỗi tab riêng biệt)
  const sessionRole = sessionStorage.getItem(SESSION_ROLE_KEY)
  if (sessionRole) return sessionRole

  // fallback nếu tab chưa lưu sessionRole
  return (
    localStorage.getItem(ROLE_KEYS['Quản trị']) ||
    localStorage.getItem(ROLE_KEYS['Sinh viên']) ||
    localStorage.getItem(ROLE_KEYS['Giảng viên']) ||
    null
  )
}

export function getSinhVienId() {
  const v = sessionStorage.getItem(SESSION_ID_KEY)
  return v ? parseInt(v, 10) : null
}

export function getGiangVienId() {
  const v = sessionStorage.getItem(SESSION_ID_KEY)
  return v ? parseInt(v, 10) : null
}

// 🧠 Fetch API — luôn dùng token tương ứng role hiện tại
export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const res = await fetch(path, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

// === Login, get info, CRUD ===
export async function login(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại')
  return data
}

export async function getSinhVienById(id) {
  return apiFetch(`/api/sinhviens/${id}`)
}

export async function getGiangVienById(id) {
  return apiFetch(`/api/giangviens/${id}`)
}

export async function createSinhVien(payload) {
  return apiFetch('/api/sinhviens', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ================== TIN TỨC / THÔNG BÁO ===================
export async function getUnreadCount(sinhVienId) {
  const res = await fetch(`/api/thongbao-dadoc/${sinhVienId}`)
  return res.json()
}

export async function getThongBaoById(id) {
  const res = await fetch(`/api/thongbao/${id}`)
  return res.json()
}

export async function markThongBaoAsRead(sinhVienId, thongBaoId) {
  const res = await fetch('/api/thongbao-dadoc/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sinhVienId, thongBaoId })
  })
  return res.json()
}
