// server/routes/lichAdmin.js
import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/lichAdminController.js'
import { getLichHocAdmin } from '../controllers/lichAdminController.js'
import { getLichThiAdmin } from '../controllers/lichAdminController.js'
import { updateGiangVien } from '../controllers/lichAdminController.js'
import { overrideLichHoc } from '../controllers/lichAdminController.js';


const router = Router()
router.get('/thi', getLichThiAdmin)
router.get('/hoc', getLichHocAdmin) 
router.get('/', getAll)  // ⬅️ Đặt TRƯỚC `/:id` để không bị nuốt
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.put('/update-giangvien', updateGiangVien)
router.delete('/:id', remove)
router.post('/override', overrideLichHoc);

export default router
