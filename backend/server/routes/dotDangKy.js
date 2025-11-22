import { Router } from 'express'
import * as QuanLyDotDangKyController from '../controllers/quanLyDotDangKyController.js'

const router = Router()

// GET /api/dot-dang-ky - Lấy tất cả đợt đăng ký
router.get('/', QuanLyDotDangKyController.getAll)

// POST /api/dot-dang-ky/auto-generate - Tạo tự động theo năm
router.post('/auto-generate', QuanLyDotDangKyController.autoGenerate)

// POST /api/dot-dang-ky - Tạo đợt mới
router.post('/', QuanLyDotDangKyController.create)

// PUT /api/dot-dang-ky/:id - Cập nhật đợt
router.put('/:id', QuanLyDotDangKyController.update)

// DELETE /api/dot-dang-ky/:id - Xóa đợt
router.delete('/:id', QuanLyDotDangKyController.remove)

export default router