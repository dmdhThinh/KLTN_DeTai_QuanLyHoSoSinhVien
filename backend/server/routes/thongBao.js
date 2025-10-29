// server/controllers/thongBaoController.js
import express from 'express'
import {
  getThongBao,
  addThongBao,
  getThongBaoById,
  updateThongBao,
  deleteThongBao,
  upload
} from '../controllers/thongBaoController.js'

const router = express.Router()

router.get('/', getThongBao)
router.get('/:id', getThongBaoById)

// ✅ route thêm mới với upload nhiều loại file
router.post(
  '/',
  upload.fields([
    { name: 'hinh_anh', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'tep_dinh_kem', maxCount: 1 }
  ]),
  addThongBao
)

// ✅ Cập nhật
router.put(
  '/:id',
  upload.fields([
    { name: 'hinh_anh', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'tep_dinh_kem', maxCount: 1 }
  ]),
  updateThongBao
)

// ✅ Xóa
router.delete('/:id', deleteThongBao)

export default router
