import { Router } from 'express'
import {
  getLopHocPhanCuaSinhVien,
  taoYeuCauTuVan,
  getDanhSachYeuCauCuaSinhVien,
  getDanhSachYeuCauCuaGiangVien,
  getDanhSachYeuCauCuaAdmin,
  getChiTietYeuCau,
  capNhatTrangThai,
  phanHoiYeuCau,
  huyYeuCau,
  demYeuCauMoiCuaGiangVien,
  demPhanHoiMoiCuaSinhVien,
  demYeuCauMoiCuaAdmin
} from '../controllers/yeuCauTuVanController.js'

const router = Router()

// ========== STUDENT ROUTES ==========
// Lấy danh sách lớp học phần của sinh viên (để chọn lớp gửi yêu cầu)
router.get('/lop-hoc-phan/:sinhVienId', getLopHocPhanCuaSinhVien)

// Tạo yêu cầu tư vấn mới
router.post('/', taoYeuCauTuVan)

// Lấy danh sách yêu cầu của sinh viên
router.get('/sinh-vien/:sinhVienId', getDanhSachYeuCauCuaSinhVien)

// Đếm số phản hồi mới của sinh viên
router.get('/sinh-vien/:sinhVienId/count', demPhanHoiMoiCuaSinhVien)

// Hủy yêu cầu tư vấn (chỉ khi còn CHO_XU_LY)
router.delete('/:id', huyYeuCau)

// ========== TEACHER ROUTES ==========
// Lấy danh sách yêu cầu gửi đến giảng viên
router.get('/giang-vien/:giangVienId', getDanhSachYeuCauCuaGiangVien)

// Đếm số yêu cầu mới của giảng viên
router.get('/giang-vien/:giangVienId/count', demYeuCauMoiCuaGiangVien)

// Cập nhật trạng thái yêu cầu (giảng viên đánh dấu đang xử lý)
router.put('/:id/trang-thai', capNhatTrangThai)

// Phản hồi yêu cầu tư vấn
router.put('/:id/phan-hoi', phanHoiYeuCau)

// ========== ADMIN ROUTES ==========
// Lấy danh sách yêu cầu gửi đến Admin
router.get('/admin/all', getDanhSachYeuCauCuaAdmin)

// Đếm số yêu cầu mới của Admin
router.get('/admin/count', demYeuCauMoiCuaAdmin)

// ========== COMMON ROUTES ==========

// Lấy chi tiết yêu cầu
router.get('/:id', getChiTietYeuCau)

export default router
