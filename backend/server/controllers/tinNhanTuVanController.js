import * as TinNhanTuVanModel from '../models/tinNhanTuVan.js'

/**
 * Gửi tin nhắn
 * POST /api/tin-nhan-tu-van
 */
export const guiTinNhan = async (req, res) => {
  try {
    const { yeu_cau_id, nguoi_gui, noi_dung } = req.body

    if (!yeu_cau_id || !nguoi_gui || !noi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      })
    }

    if (!['SINH_VIEN', 'GIANG_VIEN', 'ADMIN'].includes(nguoi_gui)) {
      return res.status(400).json({
        success: false,
        message: 'Người gửi không hợp lệ'
      })
    }

    const tinNhan = await TinNhanTuVanModel.guiTinNhan(
      Number(yeu_cau_id),
      nguoi_gui,
      noi_dung
    )

    return res.json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      data: tinNhan
    })
  } catch (err) {
    console.error('❌ Lỗi controller gửi tin nhắn:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi tin nhắn'
    })
  }
}

/**
 * Lấy danh sách tin nhắn của một yêu cầu
 * GET /api/tin-nhan-tu-van/:yeuCauId
 */
export const getDanhSachTinNhan = async (req, res) => {
  try {
    const { yeuCauId } = req.params
    const tinNhanList = await TinNhanTuVanModel.getDanhSachTinNhan(Number(yeuCauId))

    return res.json({
      success: true,
      data: tinNhanList
    })
  } catch (err) {
    console.error('❌ Lỗi controller lấy tin nhắn:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tin nhắn'
    })
  }
}

/**
 * Đánh dấu đã đọc tin nhắn
 * PUT /api/tin-nhan-tu-van/:yeuCauId/danh-dau-da-doc
 */
export const danhDauDaDocTinNhan = async (req, res) => {
  try {
    const { yeuCauId } = req.params
    const { nguoi_doc } = req.body

    if (!nguoi_doc || !['SINH_VIEN', 'GIANG_VIEN', 'ADMIN'].includes(nguoi_doc)) {
      return res.status(400).json({
        success: false,
        message: 'Người đọc không hợp lệ'
      })
    }

    await TinNhanTuVanModel.danhDauDaDocTinNhan(Number(yeuCauId), nguoi_doc)

    return res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc'
    })
  } catch (err) {
    console.error('❌ Lỗi controller đánh dấu đã đọc:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}

/**
 * Đếm tin nhắn chưa đọc của giảng viên
 * GET /api/tin-nhan-tu-van/giang-vien/:giangVienId/count
 */
export const demTinNhanChuaDocCuaGiangVien = async (req, res) => {
  try {
    const { giangVienId } = req.params
    const count = await TinNhanTuVanModel.demTinNhanChuaDocCuaGiangVien(Number(giangVienId))

    return res.json({
      success: true,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi controller đếm tin chưa đọc GV:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}

/**
 * Đếm tin nhắn chưa đọc của sinh viên
 * GET /api/tin-nhan-tu-van/sinh-vien/:sinhVienId/count
 */
export const demTinNhanChuaDocCuaSinhVien = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const count = await TinNhanTuVanModel.demTinNhanChuaDocCuaSinhVien(Number(sinhVienId))

    return res.json({
      success: true,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi controller đếm tin chưa đọc SV:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}
