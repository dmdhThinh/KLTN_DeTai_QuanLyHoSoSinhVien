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
    const { page = 1, limit = 10, search = '' } = req.query;
    
    if (!dotXetId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đợt xét'
      });
    }

    const result = await TotNghiepModel.getHoSoTotNghiepTheoDot(Number(dotXetId), {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.toString()
    });

    // Lấy thống kê tổng (không phân trang)
    const statsResult = await TotNghiepModel.getHoSoTotNghiepTheoDot(Number(dotXetId), {
      page: 1,
      limit: 999999, // Lấy tất cả để tính thống kê
      search: search.toString()
    });

    // Tính thống kê từ tất cả dữ liệu
    const stats = {
      total: statsResult.data.length,
      duDieuKien: statsResult.data.filter(h => h.trang_thai === 'DU_DIEU_KIEN').length,
      daTotNghiep: statsResult.data.filter(h => h.trang_thai === 'DA_TOT_NGHIEP').length,
      khongDuDieuKien: statsResult.data.filter(h => h.trang_thai === 'KHONG_DU_DIEU_KIEN').length
    };

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: stats
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
 * Thống kê khóa học: khóa nào đã học xong, khóa nào chưa học xong
 * GET /api/tot-nghiep/thong-ke-khoa-hoc
 */
export async function thongKeKhoaHoc(req, res) {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        sv.khoa_hoc,
        COUNT(DISTINCT sv.id) as tong_sv,
        COUNT(DISTINCT CASE WHEN hstn.trang_thai = 'DA_TOT_NGHIEP' THEN sv.id END) as da_tot_nghiep,
        COUNT(DISTINCT CASE WHEN hstn.trang_thai = 'DU_DIEU_KIEN' THEN sv.id END) as du_dieu_kien,
        COUNT(DISTINCT CASE WHEN hstn.trang_thai = 'KHONG_DU_DIEU_KIEN' THEN sv.id END) as khong_du_dieu_kien,
        COUNT(DISTINCT CASE WHEN hstn.id IS NULL THEN sv.id END) as chua_tao_ho_so
      FROM SinhVien sv
      LEFT JOIN HoSoTotNghiep hstn ON sv.id = hstn.sinh_vien_id
      WHERE sv.khoa_hoc IS NOT NULL AND sv.khoa_hoc != ''
      GROUP BY sv.khoa_hoc
      ORDER BY sv.khoa_hoc DESC
    `);

    const result = stats.map(stat => ({
      khoa_hoc: stat.khoa_hoc,
      tong_sv: stat.tong_sv,
      da_tot_nghiep: stat.da_tot_nghiep,
      du_dieu_kiên: stat.du_dieu_kien || 0,
      khong_du_dieu_kiên: stat.khong_du_dieu_kien || 0,
      chua_tao_ho_so: stat.chua_tao_ho_so,
      ty_le_tot_nghiep: stat.tong_sv > 0 ? ((stat.da_tot_nghiep / stat.tong_sv) * 100).toFixed(2) : 0,
      trang_thai: stat.da_tot_nghiep === stat.tong_sv ? 'Đã học xong' : 
                  stat.da_tot_nghiep > 0 ? 'Đang học' : 'Chưa học xong'
    }));

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('❌ Lỗi khi thống kê khóa học:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi thống kê khóa học',
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

/**
 * Cập nhật lại trạng thái tất cả hồ sơ trong đợt xét
 * POST /api/tot-nghiep/cap-nhat-lai-trang-thai
 */
export async function capNhatLaiTrangThai(req, res) {
  try {
    const { dot_xet_id } = req.body;
    
    if (!dot_xet_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đợt xét'
      });
    }

    const result = await TotNghiepModel.capNhatLaiTrangThaiHoSo(Number(dot_xet_id));

    return res.json({
      success: true,
      message: `Đã cập nhật ${result.updatedCount} hồ sơ. Đủ điều kiện: ${result.duDieuKienCount}, Không đủ điều kiện: ${result.khongDuDieuKienCount}`,
      data: result
    });
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật lại trạng thái hồ sơ:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật lại trạng thái hồ sơ',
      error: err.message
    });
  }
}

/**
 * Xóa hồ sơ tốt nghiệp theo khóa học
 * DELETE /api/tot-nghiep/xoa-theo-khoa-hoc
 */
export async function xoaHoSoTheoKhoaHoc(req, res) {
  try {
    const { khoa_hoc, dot_xet_id } = req.body;
    
    if (!khoa_hoc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin khóa học'
      });
    }

    let query = `
      DELETE hstn FROM HoSoTotNghiep hstn
      INNER JOIN SinhVien sv ON hstn.sinh_vien_id = sv.id
      WHERE sv.khoa_hoc = ?
    `;
    const params = [khoa_hoc];

    // Nếu có dot_xet_id, chỉ xóa trong đợt xét đó
    if (dot_xet_id) {
      query += ' AND hstn.dot_xet_id = ?';
      params.push(dot_xet_id);
    }

    const [result] = await pool.execute(query, params);

    return res.json({
      success: true,
      message: `Đã xóa ${result.affectedRows} hồ sơ tốt nghiệp của khóa ${khoa_hoc}`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi xóa hồ sơ tốt nghiệp:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa hồ sơ tốt nghiệp',
      error: err.message
    });
  }
}

