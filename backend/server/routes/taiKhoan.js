// server/routes/taiKhoan.js
import express from 'express'
import {
  listAccounts,
  deleteAccount,
  resetPassword,
  toggleStatus
} from '../controllers/taiKhoanController.js'

const router = express.Router()

// ✅ Danh sách
router.get('/', listAccounts)

// ✅ Đặt lại mật khẩu
router.put('/:id/reset', resetPassword)

// ✅ Chuyển đổi trạng thái
router.put('/:id/toggle', toggleStatus)

// ✅ Xóa tài khoản
router.delete('/:id', deleteAccount)

export default router
