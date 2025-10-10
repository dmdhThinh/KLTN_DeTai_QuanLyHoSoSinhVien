import { findAccountByUsername } from '../models/auth.js'
import { comparePassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'

export async function login(req, res) {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ message: 'Thiếu username hoặc password' })
    }

    const acc = await findAccountByUsername(username)
    if (!acc) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' })
    if (acc.trang_thai && acc.trang_thai !== 'Hoạt động') {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu' })
    }

    const ok = await comparePassword(password, acc.password_hash)
    if (!ok) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' })

    // role giữ nguyên chuỗi tiếng Việt để khớp frontend
    const payload = {
      sub: acc.id,
      role: acc.role,
      sv: acc.sv_id || null,
      gv: acc.gv_id || null
    }
    const token = signToken(payload)

    // Trả ra đúng schema frontend api.js.saveAuth mong đợi
    return res.json({
      token,
      role: acc.role,
      sinhVienId: acc.sv_id || null,
      giangVienId: acc.gv_id || null
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
