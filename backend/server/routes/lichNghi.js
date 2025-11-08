import { Router } from 'express'
import { 
  themBuoiNghi, 
  xoaBuoiNghi, 
  getDanhSachBuoiNghi 
} from '../controllers/lichNghiController.js'

const router = Router()

router.get('/', getDanhSachBuoiNghi)
router.post('/', themBuoiNghi)
router.delete('/:id', xoaBuoiNghi)

export default router
