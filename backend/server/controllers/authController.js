// server/controllers/authController.js
import { findAccountByUsername } from '../models/auth.js'
import { comparePassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'
import { pool } from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function login(req, res) {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ message: 'Thiếu username hoặc password' })
    }

    const acc = await findAccountByUsername(username)
    if (!acc) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' })
    }

    // ✅ Kiểm tra trạng thái hoạt động (chặn tài khoản bị khóa/vô hiệu)
    if (acc.trang_thai && acc.trang_thai.toLowerCase() !== 'hoạt động') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa hoặc ngừng hoạt động.' })
    }

    const ok = await comparePassword(password, acc.password_hash)
    if (!ok) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' })
    }

    // Kiểm tra nếu chưa đổi mật khẩu
    if (!Number(acc.da_doi_mat_khau)) {
      const tempToken = jwt.sign(
        { sub: acc.id, forceChangePassword: true },
        process.env.JWT_SECRET || 'dev',
        { expiresIn: '10m' }
      )
      return res.json({
        requireChangePassword: true,
        token: tempToken,
        message: 'Bạn cần đổi mật khẩu trước khi đăng nhập lần đầu.'
      })
    }

    // ✅ Nếu đã đổi mật khẩu thì cho đăng nhập bình thường
    const payload = {
      sub: acc.id,
      role: acc.role,
      sv: acc.sv_id || null,
      gv: acc.gv_id || null
    }
    const token = signToken(payload)

    return res.json({
      token,
      role: acc.role,
      sinhVienId: acc.sv_id || null,
      giangVienId: acc.gv_id || null
    })
  } catch (err) {
    console.error('❌ LOGIN ERROR:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập' })
  }
}

// ✅ API đổi mật khẩu lần đầu (giữ nguyên)
export async function changePassword(req, res) {
  try {
    const { newPassword } = req.body
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Thiếu token' })

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev')

    if (!decoded.sub) return res.status(401).json({ message: 'Token không hợp lệ' })
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự trở lên' })

    const hash = await bcrypt.hash(newPassword, 10)
    await pool.query(
      `UPDATE TaiKhoan SET password_hash = ?, da_doi_mat_khau = 1 WHERE id = ?`,
      [hash, decoded.sub]
    )

    res.json({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại.' })
  } catch (err) {
    console.error('❌ changePassword error:', err)
    res.status(500).json({ message: 'Không thể đổi mật khẩu' })
  }
}

// ✅ API đổi mật khẩu khi đã đăng nhập (yêu cầu mật khẩu cũ)
export async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body
    const auth = req.headers.authorization
    
    if (!auth) {
      return res.status(401).json({ message: 'Thiếu token xác thực' })
    }

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev')

    if (!decoded.sub) {
      return res.status(401).json({ message: 'Token không hợp lệ' })
    }

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    }

    // Lấy thông tin tài khoản hiện tại
    const [rows] = await pool.query(
      'SELECT id, password_hash FROM TaiKhoan WHERE id = ?',
      [decoded.sub]
    )

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
    }

    const account = rows[0]

    // Kiểm tra mật khẩu cũ
    const isValidOldPassword = await comparePassword(oldPassword, account.password_hash)
    if (!isValidOldPassword) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' })
    }

    // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
    const isSamePassword = await comparePassword(newPassword, account.password_hash)
    if (isSamePassword) {
      return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ' })
    }

    // Hash mật khẩu mới và cập nhật
    const newHash = await bcrypt.hash(newPassword, 10)
    await pool.query(
      'UPDATE TaiKhoan SET password_hash = ? WHERE id = ?',
      [newHash, decoded.sub]
    )

    res.json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' })
  } catch (err) {
    console.error('❌ updatePassword error:', err)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
    }
    res.status(500).json({ message: 'Không thể đổi mật khẩu' })
  }
}