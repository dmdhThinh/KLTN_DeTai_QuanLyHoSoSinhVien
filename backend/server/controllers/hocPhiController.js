// server/controllers/hocPhiController.js
import * as HocPhiModel from '../models/hocPhi.js'

/**
 * Controller: Lấy danh sách công nợ của sinh viên
 * GET /api/hoc-phi/sinh-vien/:sinhVienId
 */
export const getCongNoSinhVien = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    
    if (!sinhVienId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin sinh viên ID' 
      })
    }

    const congNo = await HocPhiModel.getCongNoSinhVien(Number(sinhVienId))
    const tongCongNo = await HocPhiModel.getTongCongNo(Number(sinhVienId))

    return res.json({
      success: true,
      data: {
        danhSachCongNo: congNo,
        thongKe: tongCongNo
      }
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy công nợ sinh viên:', err)
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy công nợ sinh viên' 
    })
  }
}

/**
 * Controller: Lấy tổng công nợ của sinh viên
 * GET /api/hoc-phi/tong-cong-no/:sinhVienId
 */
export const getTongCongNo = async (req, res) => {
  try {
    const { sinhVienId } = req.params

    if (!sinhVienId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin sinh viên ID' 
      })
    }

    const tongCongNo = await HocPhiModel.getTongCongNo(Number(sinhVienId))

    return res.json({
      success: true,
      data: tongCongNo
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy tổng công nợ:', err)
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy tổng công nợ' 
    })
  }
}

/**
 * Controller: Lấy công nợ theo học kỳ
 * GET /api/hoc-phi/hoc-ky/:sinhVienId?hocKy=HK1&namHoc=2024-2025
 */
export const getCongNoTheoHocKy = async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const { hocKy, namHoc } = req.query

    if (!sinhVienId || !hocKy || !namHoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin sinh viên ID, học kỳ hoặc năm học' 
      })
    }

    const congNo = await HocPhiModel.getCongNoTheoHocKy(
      Number(sinhVienId), 
      hocKy, 
      namHoc
    )

    return res.json({
      success: true,
      data: congNo
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy công nợ theo học kỳ:', err)
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy công nợ theo học kỳ' 
    })
  }
}

/**
 * Controller: Cập nhật trạng thái thanh toán (Admin/Accounting)
 * PUT /api/hoc-phi/:dangKyId/trang-thai
 */
export const capNhatTrangThaiThanhToan = async (req, res) => {
  try {
    const { dangKyId } = req.params
    const { tinhTrang, hanNop } = req.body

    if (!dangKyId || !tinhTrang) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin ID đăng ký hoặc tình trạng' 
      })
    }

    const validStatus = ['Đã nộp', 'Chưa nộp', 'Quá hạn']
    if (!validStatus.includes(tinhTrang)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tình trạng không hợp lệ. Phải là: Đã nộp, Chưa nộp, hoặc Quá hạn' 
      })
    }

    const result = await HocPhiModel.capNhatTrangThaiThanhToan(
      Number(dangKyId), 
      tinhTrang, 
      hanNop || null
    )

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đăng ký học phần để cập nhật' 
      })
    }

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công'
    })
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật trạng thái thanh toán:', err)
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật trạng thái thanh toán' 
    })
  }
}

// ==================== ADMIN CONTROLLERS ====================

/**
 * Lấy tất cả học phí (Admin)
 * GET /api/hoc-phi/admin/all
 */
export const getAllHocPhiAdmin = async (req, res) => {
  try {
    const { hocKy, namHoc, tinhTrang, search, page, limit } = req.query
    
    const result = await HocPhiModel.getAllHocPhi({
      hocKy,
      namHoc,
      tinhTrang,
      search,
      page: page || 1,
      limit: limit || 50
    })

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy tất cả học phí:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách học phí'
    })
  }
}

/**
 * Cập nhật hạn nộp học phí theo đợt đăng ký (Admin)
 * POST /api/hoc-phi/admin/han-nop-dot
 */
export const capNhatHanNopTheoDot = async (req, res) => {
  try {
    const { dotDangKyId, hanNop } = req.body

    if (!dotDangKyId || !hanNop) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin dotDangKyId hoặc hanNop'
      })
    }

    const count = await HocPhiModel.capNhatHanNopTheoDot(dotDangKyId, hanNop)

    return res.json({
      success: true,
      message: `Đã cập nhật hạn nộp cho ${count} bản ghi`,
      count
    })
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật hạn nộp theo đợt:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật hạn nộp'
    })
  }
}

/**
 * Lấy thống kê học phí (Admin)
 * GET /api/hoc-phi/admin/thong-ke
 */
export const getThongKeHocPhi = async (req, res) => {
  try {
    const thongKe = await HocPhiModel.getThongKeHocPhi()

    return res.json({
      success: true,
      data: thongKe
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy thống kê học phí:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    })
  }
}
