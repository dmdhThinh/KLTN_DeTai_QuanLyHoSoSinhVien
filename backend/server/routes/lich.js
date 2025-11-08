import { Router } from 'express'
import { 
  getLichHoc, 
  getLichThi,
  getLichHocGiangVien,
  getLichThiGiangVien,
  getLichByLopHocPhan
} from '../controllers/lich.js'

const router = Router()

// Lịch sinh viên
router.get('/hoc', getLichHoc)
router.get('/thi', getLichThi)

// Lịch giảng viên
router.get('/giangvien/hoc', getLichHocGiangVien)
router.get('/giangvien/thi', getLichThiGiangVien)

// Lịch theo lớp học phần (cho điểm danh)
router.get('/lop-hoc-phan/:lopHocPhanId', getLichByLopHocPhan)

export default router
