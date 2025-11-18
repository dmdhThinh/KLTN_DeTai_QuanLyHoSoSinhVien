// server/routes/giangVien.js
import { Router } from 'express'
import {
  listGiangVien,
  getGiangVien,
  createGiangVien,
  updateGiangVien,
  deleteGiangVien,
  uploadTeacherPhoto
} from '../controllers/giangVienController.js'
import { uploadTeacherPhoto as uploadMiddleware } from '../config/multer-s3.js'

const router = Router()

router.get('/', listGiangVien)
router.get('/:id', getGiangVien)
router.post('/', createGiangVien)
router.put('/:id', updateGiangVien)

// Upload ảnh thẻ giảng viên
router.post('/:id/upload-photo', uploadMiddleware.single('photo'), uploadTeacherPhoto)

router.delete('/:id', deleteGiangVien)

export default router