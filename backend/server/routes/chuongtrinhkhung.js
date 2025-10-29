// routes/chuongtrinhkhung.js
import { Router } from 'express'
import { getByHocKyNganh } from '../controllers/chuongTrinhKhungController.js'

const router = Router()

// GET /api/chuongtrinhkhung/:hoc_ky/:nam_hoc/:nganh_id?sinh_vien_id=1
router.get('/:hoc_ky/:nganh_id', getByHocKyNganh)

export default router