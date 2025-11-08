import { Router } from 'express'
import {
  guiTinNhan,
  getDanhSachTinNhan,
  danhDauDaDocTinNhan,
  demTinNhanChuaDocCuaGiangVien,
  demTinNhanChuaDocCuaSinhVien
} from '../controllers/tinNhanTuVanController.js'

const router = Router()

// Gửi tin nhắn mới
router.post('/', guiTinNhan)

// Lấy danh sách tin nhắn của một yêu cầu
router.get('/:yeuCauId', getDanhSachTinNhan)

// Đánh dấu đã đọc tin nhắn
router.put('/:yeuCauId/danh-dau-da-doc', danhDauDaDocTinNhan)

// Đếm tin nhắn chưa đọc của giảng viên
router.get('/giang-vien/:giangVienId/count', demTinNhanChuaDocCuaGiangVien)

// Đếm tin nhắn chưa đọc của sinh viên
router.get('/sinh-vien/:sinhVienId/count', demTinNhanChuaDocCuaSinhVien)

export default router
