import * as TotNghiepModel from '../models/totNghiep.js';
import { pool } from '../config/db.js';

/**
 * Kiểm tra điều kiện tốt nghiệp của sinh viên
 * GET /api/tot-nghiep/kiem-tra/:sinhVienId
 */
export async function kiemTraDieuKien(req, res) {
  try {
    const { sinhVienId } = req.params;
    
    if (!sinhVienId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sinh viên'
      });
    }

    const result = await TotNghiepModel.kiemTraDieuKienTotNghiep(Number(sinhVienId));

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra điều kiện tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra điều kiện tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Tạo hồ sơ tốt nghiệp cho sinh viên
 * POST /api/tot-nghiep/tao-ho-so
 */
export async function taoHoSo(req, res) {
  try {
    const { sinh_vien_id, dot_xet_id } = req.body;
    
    if (!sinh_vien_id || !dot_xet_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const result = await TotNghiepModel.taoHoSoTotNghiep(
      Number(sinh_vien_id),
      Number(dot_xet_id)
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('❌ Lỗi khi tạo hồ sơ tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo hồ sơ tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Xét tốt nghiệp cho sinh viên
 * POST /api/tot-nghiep/xet/:hoSoId
 */
export async function xetTotNghiep(req, res) {
  try {
    const { hoSoId } = req.params;
    
    if (!hoSoId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin hồ sơ'
      });
    }

    const result = await TotNghiepModel.xetTotNghiep(Number(hoSoId));

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xét tốt nghiệp. Hồ sơ không đủ điều kiện hoặc không tồn tại.'
      });
    }

    return res.json({
      success: true,
      message: 'Xét tốt nghiệp thành công',
      data: result
    });
  } catch (err) {
    console.error('❌ Lỗi khi xét tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xét tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Lấy danh sách hồ sơ tốt nghiệp theo đợt xét
 * GET /api/tot-nghiep/ho-so/:dotXetId
 */
export async function getHoSoTheoDot(req, res) {
  try {
    const { dotXetId } = req.params;
    
    if (!dotXetId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đợt xét'
      });
    }

    const data = await TotNghiepModel.getHoSoTotNghiepTheoDot(Number(dotXetId));

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy hồ sơ tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy hồ sơ tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Lấy danh sách đợt xét tốt nghiệp
 * GET /api/tot-nghiep/dot-xet
 */
export async function getDotXet(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM DotXetTotNghiep ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy đợt xét tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đợt xét tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Lấy danh sách khóa học
 * GET /api/tot-nghiep/khoa-hoc
 */
export async function getKhoaHoc(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT khoa_hoc 
       FROM SinhVien 
       WHERE khoa_hoc IS NOT NULL AND khoa_hoc != ''
       ORDER BY khoa_hoc DESC`
    );

    const khoaHocList = rows.map(row => row.khoa_hoc).filter(Boolean);

    return res.json({
      success: true,
      data: khoaHocList
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách khóa học:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khóa học',
      error: err.message
    });
  }
}

/**
 * Tạo đợt xét tốt nghiệp mới
 * POST /api/tot-nghiep/dot-xet
 */
export async function taoDotXet(req, res) {
  try {
    const { ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc } = req.body;
    
    if (!ten_dot || !nam_hoc || !hoc_ky || !ngay_bat_dau || !ngay_ket_thuc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO DotXetTotNghiep (ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai)
       VALUES (?, ?, ?, ?, ?, 'MO')`,
      [ten_dot, nam_hoc, hoc_ky, ngay_bat_dau, ngay_ket_thuc]
    );

    return res.json({
      success: true,
      message: 'Tạo đợt xét tốt nghiệp thành công',
      data: { insertId: result.insertId }
    });
  } catch (err) {
    console.error('❌ Lỗi khi tạo đợt xét tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đợt xét tốt nghiệp',
      error: err.message
    });
  }
}

/**
 * Tạo hồ sơ tốt nghiệp hàng loạt cho sinh viên K20
 * POST /api/tot-nghiep/tao-ho-so-hang-loat
 */
export async function taoHoSoHangLoat(req, res) {
  try {
    const { dot_xet_id, khoa_hoc } = req.body;
    
    if (!dot_xet_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đợt xét'
      });
    }

    const khoaHoc = khoa_hoc || 'K20';
    
    // Lấy danh sách sinh viên K20 ngành Kỹ Thuật Phần Mềm
    const [students] = await pool.execute(
      `SELECT id, ma_sv, ho_ten 
       FROM SinhVien 
       WHERE khoa_hoc = ? AND nganh_id = 1
       ORDER BY id ASC`,
      [khoaHoc]
    );

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên ${khoaHoc} ngành Kỹ Thuật Phần Mềm`
      });
    }

    let duDieuKienCount = 0;
    let khongDuDieuKienCount = 0;
    let daCoHoSoCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Kiểm tra xem đã có hồ sơ chưa
        const [existing] = await pool.execute(
          `SELECT id FROM HoSoTotNghiep WHERE sinh_vien_id = ? AND dot_xet_id = ?`,
          [student.id, dot_xet_id]
        );

        if (existing.length > 0) {
          daCoHoSoCount++;
          continue;
        }

        // Tạo hồ sơ tốt nghiệp
        const result = await TotNghiepModel.taoHoSoTotNghiep(student.id, dot_xet_id);

        if (result.trangThai === 'DU_DIEU_KIEN') {
          duDieuKienCount++;
        } else if (result.trangThai === 'KHONG_DU_DIEU_KIEN') {
          khongDuDieuKienCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`Lỗi khi tạo hồ sơ cho sinh viên ${student.ma_sv}:`, err);
      }
    }

    return res.json({
      success: true,
      message: `Đã tạo hồ sơ cho ${students.length} sinh viên`,
      data: {
        total: students.length,
        duDieuKien: duDieuKienCount,
        khongDuDieuKien: khongDuDieuKienCount,
        daCoHoSo: daCoHoSoCount,
        error: errorCount
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi tạo hồ sơ hàng loạt:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo hồ sơ hàng loạt',
      error: err.message
    });
  }
}

/**
 * Xét tốt nghiệp hàng loạt
 * POST /api/tot-nghiep/xet-hang-loat
 */
export async function xetHangLoat(req, res) {
  try {
    const { dot_xet_id } = req.body;
    
    if (!dot_xet_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đợt xét'
      });
    }

    // Lấy danh sách hồ sơ đủ điều kiện
    const [hoSoList] = await pool.execute(
      `SELECT id FROM HoSoTotNghiep 
       WHERE dot_xet_id = ? AND trang_thai = 'DU_DIEU_KIEN'`
    , [dot_xet_id]);

    let successCount = 0;
    let errorCount = 0;

    for (const hoSo of hoSoList) {
      try {
        const result = await TotNghiepModel.xetTotNghiep(hoSo.id);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`Lỗi khi xét tốt nghiệp hồ sơ ${hoSo.id}:`, err);
      }
    }

    return res.json({
      success: true,
      message: `Đã xét tốt nghiệp ${successCount} sinh viên`,
      data: {
        successCount,
        errorCount,
        total: hoSoList.length
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi xét tốt nghiệp hàng loạt:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xét tốt nghiệp hàng loạt',
      error: err.message
    });
  }
}

