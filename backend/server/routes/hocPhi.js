// server/routes/hocPhi.js
import { Router } from 'express'
import { 
  getCongNoSinhVien, 
  getTongCongNo, 
  getCongNoTheoHocKy,
  capNhatTrangThaiThanhToan,
  getAllHocPhiAdmin,
  capNhatHanNopTheoDot,
  getThongKeHocPhi
} from '../controllers/hocPhiController.js'

const router = Router()

// ========== STUDENT ROUTES ==========
// Lấy danh sách công nợ của sinh viên kèm thống kê
router.get('/sinh-vien/:sinhVienId', getCongNoSinhVien)

// Lấy tổng công nợ của sinh viên
router.get('/tong-cong-no/:sinhVienId', getTongCongNo)

// Lấy công nợ theo học kỳ
router.get('/hoc-ky/:sinhVienId', getCongNoTheoHocKy)

// ========== ADMIN ROUTES ==========
// Lấy tất cả học phí (admin)
router.get('/admin/all', getAllHocPhiAdmin)

// Lấy thống kê học phí (admin)
router.get('/admin/thong-ke', getThongKeHocPhi)

// Cập nhật hạn nộp theo đợt đăng ký (admin)
router.post('/admin/han-nop-dot', capNhatHanNopTheoDot)

// Cập nhật trạng thái thanh toán (admin/kế toán)
router.put('/:dangKyId/trang-thai', capNhatTrangThaiThanhToan)

export default router