// server/controllers/taiKhoanController.js
import * as TaiKhoan from '../models/taikhoan.js'

// 🔹 Danh sách + tìm kiếm (CÓ LỌC THEO ROLE)
export const listAccounts = async (req, res) => {
  try {
    const { q = '', role = '' } = req.query   // ✅ thêm role
    const rows = await TaiKhoan.getAll({ q, role }) // ✅ truyền role vào model
    res.json({ data: rows })
  } catch (err) {
    console.error('listAccounts error:', err)
    res.status(500).json({ message: 'Không thể lấy danh sách tài khoản' })
  }
}

// 🔹 Reset mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params
    await TaiKhoan.resetPassword(id)
    res.json({ message: 'Đã đặt lại mật khẩu về 123456' })
  } catch (err) {
    console.error('resetPassword error:', err)
    res.status(500).json({ message: 'Không thể reset mật khẩu' })
  }
}

// 🔹 Chuyển trạng thái
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params
    await TaiKhoan.toggleStatus(id)
    res.json({ message: 'Đã thay đổi trạng thái tài khoản' })
  } catch (err) {
    console.error('toggleStatus error:', err)
    res.status(500).json({ message: 'Không thể thay đổi trạng thái' })
  }
}

// 🔹 Xoá tài khoản
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params
    await TaiKhoan.deleteAccount(id)
    res.status(204).end()
  } catch (err) {
    console.error('deleteAccount error:', err)
    res.status(500).json({ message: 'Không thể xoá tài khoản' })
  }
}