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

  // Xóa tất cả token và role cũ để tránh xung đột
  Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key))
  Object.values(ROLE_KEYS).forEach(key => localStorage.removeItem(key))
  localStorage.removeItem(SV_ID_KEY)
  localStorage.removeItem(GV_ID_KEY)

  // Lưu token và role mới vào localStorage (persistent)
  localStorage.setItem(TOKEN_KEYS[role], token)
  localStorage.setItem(ROLE_KEYS[role], role)

  // Lưu ID user vào localStorage (để tab mới có thể lấy được)
  if (role === 'Sinh viên' && sinhVienId) {
    localStorage.setItem(SV_ID_KEY, sinhVienId.toString())
  }
  if (role === 'Giảng viên' && giangVienId) {
    localStorage.setItem(GV_ID_KEY, giangVienId.toString())
  }

  // 🔹 Lưu role & id riêng trong sessionStorage cho từng tab (để đồng bộ)
  sessionStorage.setItem(SESSION_ROLE_KEY, role)
  if (role === 'Sinh viên' && sinhVienId)
    sessionStorage.setItem(SESSION_ID_KEY, sinhVienId.toString())
  if (role === 'Giảng viên' && giangVienId)
    sessionStorage.setItem(SESSION_ID_KEY, giangVienId.toString())
}


// 🧩 Xóa token theo role (chỉ role đó)
export function clearAuth(role) {
  try {
    // Nếu có role cụ thể, chỉ xóa role đó
    if (role && TOKEN_KEYS[role]) {
      localStorage.removeItem(TOKEN_KEYS[role])
      localStorage.removeItem(ROLE_KEYS[role])
      if (role === 'Sinh viên') localStorage.removeItem(SV_ID_KEY)
      if (role === 'Giảng viên') localStorage.removeItem(GV_ID_KEY)
    } else {
      // Nếu không có role, xóa tất cả (logout)
      Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key))
      Object.values(ROLE_KEYS).forEach(key => localStorage.removeItem(key))
      localStorage.removeItem(SV_ID_KEY)
      localStorage.removeItem(GV_ID_KEY)
    }
    // Xóa sessionStorage
    sessionStorage.removeItem(SESSION_ROLE_KEY)
    sessionStorage.removeItem(SESSION_ID_KEY)
  } catch (_) {}
}

// 🧩 Lấy token đúng role hiện tại
export function getToken() {
  // Ưu tiên lấy từ sessionStorage (tab hiện tại)
  const sessionRole = sessionStorage.getItem(SESSION_ROLE_KEY)
  if (sessionRole) {
    const token = localStorage.getItem(TOKEN_KEYS[sessionRole])
    if (token) return token
  }

  // Fallback: tìm token từ localStorage (tab mới)
  const roles = ['Quản trị', 'Sinh viên', 'Giảng viên']
  for (const role of roles) {
    const roleValue = localStorage.getItem(ROLE_KEYS[role])
    const token = localStorage.getItem(TOKEN_KEYS[role])
    if (roleValue && token) {
      // Đồng bộ sessionStorage
      if (!sessionRole) {
        sessionStorage.setItem(SESSION_ROLE_KEY, roleValue)
      }
      return token
    }
  }

  return null
}

// 🧩 Lấy vai trò hiện tại (ưu tiên role_admin > role_gv > role_sv)

// 🧩 Lấy vai trò hiện tại
export function getRole() {
  // Ưu tiên lấy theo session (mỗi tab riêng biệt)
  const sessionRole = sessionStorage.getItem(SESSION_ROLE_KEY)
  if (sessionRole) {
    // Kiểm tra token có tồn tại không
    const token = localStorage.getItem(TOKEN_KEYS[sessionRole])
    if (token) {
      console.log('✅ getRole: Lấy từ sessionStorage', sessionRole)
      return sessionRole
    }
    // Nếu không có token, xóa sessionRole và tìm role khác
    console.warn('⚠️ getRole: sessionRole không có token, xóa và tìm lại', sessionRole)
    sessionStorage.removeItem(SESSION_ROLE_KEY)
  }

  // fallback nếu tab chưa lưu sessionRole (tab mới)
  // Kiểm tra từng role trong localStorage và chỉ lấy role có token hợp lệ
  const roles = ['Quản trị', 'Sinh viên', 'Giảng viên']
  for (const role of roles) {
    const roleValue = localStorage.getItem(ROLE_KEYS[role])
    const token = localStorage.getItem(TOKEN_KEYS[role])
    if (roleValue && token) {
      console.log('✅ getRole: Lấy từ localStorage (tab mới)', roleValue)
      // Đồng bộ sessionStorage
      sessionStorage.setItem(SESSION_ROLE_KEY, roleValue)
      // Đồng bộ ID nếu có
      if (roleValue === 'Sinh viên') {
        const svId = localStorage.getItem(SV_ID_KEY)
        if (svId) sessionStorage.setItem(SESSION_ID_KEY, svId)
      } else if (roleValue === 'Giảng viên') {
        const gvId = localStorage.getItem(GV_ID_KEY)
        if (gvId) sessionStorage.setItem(SESSION_ID_KEY, gvId)
      }
      return roleValue
    }
  }

  console.warn('⚠️ getRole: Không tìm thấy role hợp lệ')
  return null
}

export function getSinhVienId() {
  // Ưu tiên lấy từ sessionStorage (tab hiện tại)
  const sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (sessionId) {
    console.log('✅ getSinhVienId: Lấy từ sessionStorage', sessionId)
    return parseInt(sessionId, 10)
  }

  // Fallback về localStorage nếu tab mới chưa có sessionStorage
  const localId = localStorage.getItem(SV_ID_KEY)
  if (localId) {
    console.log('✅ getSinhVienId: Lấy từ localStorage (tab mới)', localId)
    // Đồng bộ vào sessionStorage để lần sau lấy nhanh hơn
    sessionStorage.setItem(SESSION_ID_KEY, localId)
    return parseInt(localId, 10)
  }

  console.warn('⚠️ getSinhVienId: Không tìm thấy ID')
  return null
}

export function getGiangVienId() {
  // Ưu tiên lấy từ sessionStorage (tab hiện tại)
  const sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (sessionId) return parseInt(sessionId, 10)

  // Fallback về localStorage nếu tab mới chưa có sessionStorage
  const localId = localStorage.getItem(GV_ID_KEY)
  if (localId) {
    // Đồng bộ vào sessionStorage để lần sau lấy nhanh hơn
    sessionStorage.setItem(SESSION_ID_KEY, localId)
    return parseInt(localId, 10)
  }

  return null
}

// 🧠 Fetch API — luôn dùng token tương ứng role hiện tại
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 
    'Content-Type': 'application/json',
    ...(token && !options.headers?.Authorization ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }
  const res = await fetch(path, { ...options, headers })
  if (!res.ok) {
    // Xử lý 401/403 - token không hợp lệ hoặc hết hạn
    if (res.status === 401 || res.status === 403) {
      const role = getRole()
      console.warn('⚠️ API trả về 401/403, clear auth và redirect về login')
      if (role) {
        clearAuth(role)
      }
      // Redirect về login nếu đang ở trang protected
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/change-password')) {
        window.location.href = '/login'
      }
    }
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

// Giảng viên
export async function getUnreadCountGiangVien(giangVienId) {
  const res = await fetch(`/api/thongbao-dadoc/giangvien/${giangVienId}`)
  return res.json()
}

export async function markThongBaoAsReadGiangVien(giangVienId, thongBaoId) {
  const res = await fetch('/api/thongbao-dadoc/giangvien/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ giangVienId, thongBaoId })
  })
  return res.json()
}
