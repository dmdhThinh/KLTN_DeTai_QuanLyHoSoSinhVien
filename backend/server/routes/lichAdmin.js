// server/routes/lichAdmin.js
import { Router } from 'express'
import { 
  getAll, getById, create, update, remove,
  getLichHocAdmin, getLichThiAdmin, updateGiangVien,
  getKhoa, getNganh, getLop, getLopHocPhan
} from '../controllers/lichAdminController.js'

const router = Router()

// API combobox
router.get('/combo/khoa', getKhoa)
router.get('/combo/nganh', getNganh)
router.get('/combo/lop', getLop)
router.get('/combo/lophocphan', getLopHocPhan)

// API lịch
router.get('/thi', getLichThiAdmin)
router.get('/hoc', getLichHocAdmin) 
router.get('/', getAll)  // ⬅️ Đặt TRƯỚC `/:id` để không bị nuốt
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.put('/update-giangvien', updateGiangVien)
router.delete('/:id', remove)

export default router
