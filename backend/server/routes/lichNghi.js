import { Router } from 'express'
import { 
  themBuoiNghi, 
  xoaBuoiNghi, 
  getDanhSachBuoiNghi,
  themBuoiNghiToanKhoa,
} from '../controllers/lichNghiController.js'

const router = Router()

router.get('/', getDanhSachBuoiNghi)
router.post('/', themBuoiNghi)
router.delete('/:id', xoaBuoiNghi)
router.post('/khoa-nghi', themBuoiNghiToanKhoa)

export default router
