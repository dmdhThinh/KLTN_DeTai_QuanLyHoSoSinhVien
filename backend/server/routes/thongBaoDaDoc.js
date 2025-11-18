import express from 'express'
import { 
  getUnreadCount, 
  markAsRead,
  getUnreadCountGiangVien,
  markAsReadGiangVien
} from '../controllers/thongBaoDaDocController.js'

const router = express.Router()

// Sinh viên
router.get('/:sinhVienId', getUnreadCount)
router.post('/read', markAsRead)

// Giảng viên
router.get('/giangvien/:giangVienId', getUnreadCountGiangVien)
router.post('/giangvien/read', markAsReadGiangVien)

export default router