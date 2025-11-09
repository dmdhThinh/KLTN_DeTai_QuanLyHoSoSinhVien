import { Router } from 'express'
import { 
  getTienDoHocTap,
  getLopHocPhanDaDangKy,
  getDanhSachHocKy
} from '../controllers/hocTapController.js'

const router = Router()

// Lấy tiến độ học tập của sinh viên
router.get('/tien-do/:sinhVienId', getTienDoHocTap)

// Lấy danh sách lớp học phần đã đăng ký
router.get('/lop-hoc-phan/:sinhVienId', getLopHocPhanDaDangKy)

// Lấy danh sách học kỳ - năm học
router.get('/hoc-ky/:sinhVienId', getDanhSachHocKy)

export default router
