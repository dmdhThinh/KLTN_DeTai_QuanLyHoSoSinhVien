// server/routes/giangVien.js
import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/giangVienController.js'

const router = Router()

router.get('/', getAll)         // Lấy danh sách
router.get('/:id', getById)     // Lấy chi tiết
router.post('/', create)        // Thêm mới
router.put('/:id', update)      // Cập nhật
router.delete('/:id', remove)   // Xoá

export default router
