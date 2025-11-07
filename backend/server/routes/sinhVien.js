// server/routes/sinhVien.js
import { Router } from 'express'
import { getAll, getById, create, update, remove, removeMany, uploadStudentPhoto, checkDuplicate } from '../controllers/sinhVienController.js'
import { uploadStudentPhoto as uploadMiddleware } from '../config/multer-s3.js'

const router = Router()

router.get('/', getAll)
router.get('/check-duplicate', checkDuplicate)  // ✅ Route check trùng lặp (phải đặt TRƯỚC /:id)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)

// Upload ảnh thẻ sinh viên
router.post('/:id/upload-photo', uploadMiddleware.single('photo'), uploadStudentPhoto)

router.delete('/:id', remove)
router.post('/bulk-delete', removeMany)

export default router 