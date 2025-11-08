import * as YeuCauTuVanModel from '../models/yeuCauTuVan.js'
import * as TinNhanTuVanModel from '../models/tinNhanTuVan.js'

/**
 * Lấy danh sách lớp học phần của sinh viên (để chọn lớp khi gửi yêu cầu)
 * GET /api/yeu-cau-tu-van/lop-hoc-phan/:sinhVienId
 */
export const getLopHocPhanCuaSinhVien = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const data = await YeuCauTuVanModel.getLopHocPhanCuaSinhVien(Number(sinhVienId))
    
    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách lớp học phần:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lớp học phần'
    })
  }
}

/**
 * Tạo yêu cầu tư vấn mới (sinh viên)
 * POST /api/yeu-cau-tu-van
 * Body: { sinh_vien_id, loai_nguoi_nhan, giang_vien_id?, lop_hoc_phan_id?, tieu_de, noi_dung }
 */
export const taoYeuCauTuVan = async (req, res) => {
  try {
    const { sinh_vien_id, loai_nguoi_nhan, giang_vien_id, lop_hoc_phan_id, tieu_de, noi_dung } = req.body

    // Validate: sinh viên, tiêu đề, nội dung luôn bắt buộc
    if (!sinh_vien_id || !tieu_de || !noi_dung || !loai_nguoi_nhan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      })
    }

    // Nếu gửi tới giảng viên, phải có giang_vien_id và lop_hoc_phan_id
    if (loai_nguoi_nhan === 'GIANG_VIEN' && (!giang_vien_id || !lop_hoc_phan_id)) {
      return res.status(400).json({
        success: false,
        message: 'Gửi tới giảng viên phải có thông tin lớp học phần và giảng viên'
      })
    }

    const result = await YeuCauTuVanModel.taoYeuCauTuVan({
      sinh_vien_id: Number(sinh_vien_id),
      giang_vien_id: giang_vien_id ? Number(giang_vien_id) : null,
      lop_hoc_phan_id: lop_hoc_phan_id ? Number(lop_hoc_phan_id) : null,
      loai_nguoi_nhan,
      tieu_de,
      noi_dung
    })

    // Tự động tạo tin nhắn đầu tiên trong conversation
    await TinNhanTuVanModel.guiTinNhan(
      result.id,
      'SINH_VIEN',
      noi_dung
    )

    return res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu tư vấn thành công',
      data: result
    })
  } catch (err) {
    console.error('❌ Lỗi khi tạo yêu cầu tư vấn:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi yêu cầu tư vấn'
    })
  }
}

/**
 * Lấy danh sách yêu cầu của sinh viên
 * GET /api/yeu-cau-tu-van/sinh-vien/:sinhVienId
 */
export const getDanhSachYeuCauCuaSinhVien = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const data = await YeuCauTuVanModel.getDanhSachYeuCauCuaSinhVien(Number(sinhVienId))
    
    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của sinh viên:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách yêu cầu'
    })
  }
}

/**
 * Lấy danh sách yêu cầu gửi đến giảng viên
 * GET /api/yeu-cau-tu-van/giang-vien/:giangVienId
 */
export const getDanhSachYeuCauCuaGiangVien = async (req, res) => {
  try {
    const { giangVienId } = req.params
    const data = await YeuCauTuVanModel.getDanhSachYeuCauCuaGiangVien(Number(giangVienId))
    
    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của giảng viên:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách yêu cầu'
    })
  }
}

/**
 * Lấy danh sách yêu cầu gửi đến Admin
 * GET /api/yeu-cau-tu-van/admin
 */
export const getDanhSachYeuCauCuaAdmin = async (req, res) => {
  try {
    const data = await YeuCauTuVanModel.getDanhSachYeuCauCuaAdmin()
    
    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của giảng viên:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách yêu cầu'
    })
  }
}

/**
 * Đếm số tin nhắn chưa đọc gửi tới Admin
 * GET /api/yeu-cau-tu-van/admin/count
 */
export const demYeuCauMoiCuaAdmin = async (req, res) => {
  try {
    const count = await YeuCauTuVanModel.demYeuCauMoiCuaAdmin()
    
    return res.json({
      success: true,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi khi đếm yêu cầu mới của admin:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}

/**
 * Lấy chi tiết yêu cầu
 * GET /api/yeu-cau-tu-van/:id
 */
export const getChiTietYeuCau = async (req, res) => {
  try {
    const { id } = req.params
    const data = await YeuCauTuVanModel.getChiTietYeuCau(Number(id))
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn'
      })
    }

    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy chi tiết yêu cầu:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết yêu cầu'
    })
  }
}

/**
 * Cập nhật trạng thái yêu cầu (giảng viên đánh dấu đang xử lý)
 * PUT /api/yeu-cau-tu-van/:id/trang-thai
 */
export const capNhatTrangThai = async (req, res) => {
  try {
    const { id } = req.params
    const { trang_thai } = req.body

    if (!['CHO_XU_LY', 'DANG_XU_LY', 'DA_TRA_LOI', 'DA_HUY'].includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      })
    }

    const result = await YeuCauTuVanModel.capNhatTrangThai(Number(id), trang_thai)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn'
      })
    }

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    })
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật trạng thái:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái'
    })
  }
}

/**
 * Phản hồi yêu cầu tư vấn (giảng viên)
 * PUT /api/yeu-cau-tu-van/:id/phan-hoi
 */
export const phanHoiYeuCau = async (req, res) => {
  try {
    const { id } = req.params
    const { phan_hoi } = req.body

    if (!phan_hoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập nội dung phản hồi'
      })
    }

    const result = await YeuCauTuVanModel.phanHoiYeuCau(Number(id), phan_hoi)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn'
      })
    }

    // Tự động tạo tin nhắn phản hồi trong conversation
    await TinNhanTuVanModel.guiTinNhan(
      Number(id),
      'GIANG_VIEN',
      phan_hoi
    )

    return res.json({
      success: true,
      message: 'Phản hồi thành công'
    })
  } catch (err) {
    console.error('❌ Lỗi khi phản hồi yêu cầu:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi phản hồi yêu cầu'
    })
  }
}

/**
 * Hủy yêu cầu tư vấn (sinh viên)
 * DELETE /api/yeu-cau-tu-van/:id
 */
export const huyYeuCau = async (req, res) => {
  try {
    const { id } = req.params
    const { sinh_vien_id } = req.body

    if (!sinh_vien_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sinh viên'
      })
    }

    const result = await YeuCauTuVanModel.huyYeuCau(Number(id), Number(sinh_vien_id))

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không thể hủy yêu cầu (không tìm thấy hoặc yêu cầu đã được xử lý)'
      })
    }

    return res.json({
      success: true,
      message: 'Hủy yêu cầu thành công'
    })
  } catch (err) {
    console.error('❌ Lỗi khi hủy yêu cầu:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy yêu cầu'
    })
  }
}

/**
 * Đếm số yêu cầu mới của giảng viên
 * GET /api/yeu-cau-tu-van/giang-vien/:giangVienId/count
 */
export const demYeuCauMoiCuaGiangVien = async (req, res) => {
  try {
    const { giangVienId } = req.params
    const count = await YeuCauTuVanModel.demYeuCauMoiCuaGiangVien(Number(giangVienId))
    
    return res.json({
      success: true,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi khi đếm yêu cầu mới:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đếm yêu cầu'
    })
  }
}

/**
 * Đếm số phản hồi mới của sinh viên
 * GET /api/yeu-cau-tu-van/sinh-vien/:sinhVienId/count
 */
export const demPhanHoiMoiCuaSinhVien = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const count = await YeuCauTuVanModel.demPhanHoiMoiCuaSinhVien(Number(sinhVienId))
    
    return res.json({
      success: true,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi khi đếm phản hồi mới:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đếm phản hồi'
    })
  }
}

/**
 * ⚠️ DEPRECATED CONTROLLERS - Removed
 * 
 * Old endpoints removed:
 * - PUT /api/yeu-cau-tu-van/:id/danh-dau-da-xem-gv
 * - PUT /api/yeu-cau-tu-van/:id/danh-dau-da-xem-sv
 * 
 * Use new conversation API instead:
 * - PUT /api/tin-nhan-tu-van/:yeuCauId/danh-dau-da-doc
 * 
 * See: tinNhanTuVanController.js
 */
