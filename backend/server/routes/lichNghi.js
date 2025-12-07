import { Router } from 'express'
import { 
  themBuoiNghi, 
  xoaBuoiNghi, 
  getDanhSachBuoiNghi,
  themBuoiNghiToanKhoa,
  xoaBuoiNghiToanKhoa,
  getDanhSachNghiToanKhoa,
} from '../controllers/lichNghiController.js'

const router = Router()

router.get('/', getDanhSachBuoiNghi)
router.post('/', themBuoiNghi)
// Các route cụ thể phải đứng trước route có parameter
router.get('/khoa-nghi', getDanhSachNghiToanKhoa)
router.post('/khoa-nghi', themBuoiNghiToanKhoa)
router.delete('/khoa-nghi', xoaBuoiNghiToanKhoa)
router.delete('/:id', xoaBuoiNghi)

export default router
