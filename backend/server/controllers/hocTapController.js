import * as HocTapModel from '../models/hocTap.js'

/**
 * Lấy danh sách lớp học phần đã đăng ký
 * GET /api/hoc-tap/lop-hoc-phan/:sinhVienId?hocKy=1&namHoc=2025-2026
 */
export async function getLopHocPhanDaDangKy(req, res) {
  try {
    const { sinhVienId } = req.params
    const { hocKy, namHoc } = req.query
    
    if (!sinhVienId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sinh viên'
      })
    }

    const data = await HocTapModel.getLopHocPhanDaDangKy(
      Number(sinhVienId),
      hocKy ? Number(hocKy) : null,
      namHoc || null
    )

    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách lớp học phần đã đăng ký:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}

/**
 * Lấy danh sách học kỳ - năm học
 * GET /api/hoc-tap/hoc-ky/:sinhVienId
 */
export async function getDanhSachHocKy(req, res) {
  try {
    const { sinhVienId } = req.params
    
    if (!sinhVienId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sinh viên'
      })
    }

    const data = await HocTapModel.getDanhSachHocKy(Number(sinhVienId))

    return res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách học kỳ:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
}

/**
 * Lấy tiến độ học tập của sinh viên
 * GET /api/hoc-tap/tien-do/:sinhVienId
 */
export async function getTienDoHocTap(req, res) {
  try {
    const { sinhVienId } = req.params
    
    if (!sinhVienId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sinh viên'
      })
    }

    const data = await HocTapModel.getTienDoHocTap(Number(sinhVienId))

    return res.json({
      success: true,
      ...data
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy tiến độ học tập:', err)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tiến độ học tập'
    })
  }
}
