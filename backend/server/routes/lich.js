import { Router } from 'express'
import { 
  getLichHoc, 
  getLichThi,
  getLichHocGiangVien,
  getLichThiGiangVien
} from '../controllers/lich.js'

const router = Router()

// Lịch sinh viên
router.get('/hoc', getLichHoc)
router.get('/thi', getLichThi)

// Lịch giảng viên
router.get('/giangvien/hoc', getLichHocGiangVien)
router.get('/giangvien/thi', getLichThiGiangVien)

export default router
