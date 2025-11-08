// server/models/hocPhi.js
import { pool } from '../config/db.js'

/**
 * Lấy danh sách công nợ của sinh viên theo ID
 * Lấy từ các môn học đã đăng ký thành công
 * Mỗi tín chỉ = 1.000.000 VNĐ
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Array} Danh sách học phí
 */
export async function getCongNoSinhVien(sinhVienId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        dk.id,
        dk.sinh_vien_id AS sinhVienId,
        dk.hoc_phan_id AS hocPhanId,
        hp.ma_hoc_phan AS maHocPhan,
        hp.ten_hoc_phan AS tenHocPhan,
        hp.so_tin_chi AS soTinChi,
        lhp.hoc_ky AS hocKy,
        lhp.nam_hoc AS namHoc,
        (hp.so_tin_chi * 1000000) AS soTien,
        COALESCE(hocphi.tinh_trang, 'Chưa nộp') AS tinhTrang,
        hocphi.han_nop AS hanNop,
        COALESCE(hocphi.lan_thu, 1) AS lanThu,
        dk.id AS dangKyId,
        dk.lop_hoc_phan_id AS lopHocPhanId,
        CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop < CURDATE() THEN 'Quá hạn'
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop IS NULL THEN 'Chưa nộp'
          ELSE COALESCE(hocphi.tinh_trang, 'Chưa nộp')
        END AS trangThaiThucTe
      FROM DangKyHocPhan dk
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      WHERE dk.sinh_vien_id = ? 
        AND dk.trang_thai_dk = 'THANH_CONG'
      ORDER BY 
        CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop < CURDATE() THEN 1
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' THEN 2
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' THEN 3
          ELSE 4
        END ASC,
        lhp.nam_hoc DESC, 
        lhp.hoc_ky DESC, 
        hp.ten_hoc_phan ASC
      `,
      [sinhVienId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy công nợ sinh viên:', err)
    throw err
  }
}

/**
 * Lấy tổng công nợ của sinh viên
 * Tính từ các môn đã đăng ký thành công
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Object} Thông tin tổng công nợ
 */
export async function getTongCongNo(sinhVienId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        COUNT(*) AS tongSoHocPhan,
        SUM(hp.so_tin_chi * 1000000) AS tongTien,
        SUM(CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Đã nộp' 
          THEN hp.so_tin_chi * 1000000 
          ELSE 0 
        END) AS daThanhToan,
        SUM(CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') IN ('Chưa nộp', 'Quá hạn') 
          THEN hp.so_tin_chi * 1000000 
          ELSE 0 
        END) AS conNo,
        COUNT(CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
          THEN 1 
        END) AS soHocPhanChuaNop,
        COUNT(CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Đã nộp' 
          THEN 1 
        END) AS soHocPhanDaNop,
        COUNT(CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' 
          THEN 1 
        END) AS soHocPhanQuaHan
      FROM DangKyHocPhan dk
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      WHERE dk.sinh_vien_id = ?
        AND dk.trang_thai_dk = 'THANH_CONG'
      `,
      [sinhVienId]
    )
    return rows[0] || null
  } catch (err) {
    console.error('❌ Lỗi khi lấy tổng công nợ sinh viên:', err)
    throw err
  }
}

/**
 * Lấy danh sách công nợ theo học kỳ và năm học
 * Lấy từ các môn đã đăng ký thành công
 * @param {number} sinhVienId - ID sinh viên
 * @param {string} hocKy - Học kỳ (HK1, HK2, HK3)
 * @param {string} namHoc - Năm học (VD: 2024-2025)
 * @returns {Array} Danh sách học phí theo học kỳ
 */
export async function getCongNoTheoHocKy(sinhVienId, hocKy, namHoc) {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        dk.id,
        dk.sinh_vien_id AS sinhVienId,
        dk.hoc_phan_id AS hocPhanId,
        hp.ma_hoc_phan AS maHocPhan,
        hp.ten_hoc_phan AS tenHocPhan,
        hp.so_tin_chi AS soTinChi,
        lhp.hoc_ky AS hocKy,
        lhp.nam_hoc AS namHoc,
        (hp.so_tin_chi * 1000000) AS soTien,
        COALESCE(hocphi.tinh_trang, 'Chưa nộp') AS tinhTrang,
        hocphi.han_nop AS hanNop,
        COALESCE(hocphi.lan_thu, 1) AS lanThu
      FROM DangKyHocPhan dk
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      WHERE dk.sinh_vien_id = ? 
        AND dk.trang_thai_dk = 'THANH_CONG'
        AND lhp.hoc_ky = ?
        AND lhp.nam_hoc = ?
      ORDER BY 
        CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop < CURDATE() THEN 1
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' THEN 2
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' THEN 3
          ELSE 4
        END ASC,
        hp.ten_hoc_phan ASC
      `,
      [sinhVienId, hocKy, namHoc]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy công nợ theo học kỳ:', err)
    throw err
  }
}

/**
 * Cập nhật trạng thái thanh toán học phí
 * Tạo mới hoặc cập nhật bản ghi trong bảng HocPhi
 * @param {number} dangKyId - ID đăng ký học phần
 * @param {string} tinhTrang - Tình trạng mới ('Đã nộp', 'Chưa nộp', 'Quá hạn')
 * @param {Date} hanNop - Hạn nộp (optional)
 * @returns {boolean} Kết quả cập nhật
 */
export async function capNhatTrangThaiThanhToan(dangKyId, tinhTrang, hanNop = null) {
  try {
    // Lấy thông tin đăng ký học phần và lớp học phần
    const [dkRows] = await pool.query(
      `SELECT 
        dk.sinh_vien_id, 
        dk.hoc_phan_id, 
        dk.lop_hoc_phan_id,
        lhp.hoc_ky,
        lhp.nam_hoc
       FROM DangKyHocPhan dk
       LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
       WHERE dk.id = ?`,
      [dangKyId]
    )
    
    if (!dkRows || dkRows.length === 0) {
      return false
    }
    
    const dk = dkRows[0]
    
    // Lấy số tín chỉ
    const [hpRows] = await pool.query(
      `SELECT so_tin_chi FROM HocPhan WHERE id = ?`,
      [dk.hoc_phan_id]
    )
    
    const soTien = hpRows[0]?.so_tin_chi * 1000000 || 0
    
    // Kiểm tra xem đã có bản ghi HocPhi chưa
    const [existingRows] = await pool.query(
      `SELECT id FROM HocPhi WHERE dang_ky_id = ?`,
      [dangKyId]
    )
    
    if (existingRows && existingRows.length > 0) {
      // Cập nhật - chỉ update han_nop nếu có giá trị mới
      let updateQuery = `UPDATE HocPhi SET tinh_trang = ?`
      const updateParams = [tinhTrang]
      
      if (hanNop !== null && hanNop !== undefined) {
        updateQuery += `, han_nop = ?`
        updateParams.push(hanNop)
      }
      
      updateQuery += ` WHERE dang_ky_id = ?`
      updateParams.push(dangKyId)
      
      const [result] = await pool.query(updateQuery, updateParams)
      return result.affectedRows > 0
    } else {
      // Tạo mới
      const [result] = await pool.query(
        `INSERT INTO HocPhi 
         (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, so_tien, tinh_trang, 
          dang_ky_id, lop_hoc_phan_id, han_nop, lan_thu) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          dk.sinh_vien_id, 
          dk.hoc_phan_id, 
          dk.hoc_ky, 
          dk.nam_hoc, 
          soTien, 
          tinhTrang, 
          dangKyId, 
          dk.lop_hoc_phan_id, 
          hanNop
        ]
      )
      return result.affectedRows > 0
    }
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật trạng thái thanh toán:', err)
    throw err
  }
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * Lấy tất cả học phí của tất cả sinh viên (cho admin)
 * @param {Object} filters - { hocKy, namHoc, tinhTrang, search, page, limit }
 * @returns {Object} { data, pagination }
 */
export async function getAllHocPhi(filters = {}) {
  try {
    const {
      hocKy = null,
      namHoc = null,
      tinhTrang = null,
      search = '',
      page = 1,
      limit = 50
    } = filters

    const offset = (Number(page) - 1) * Number(limit)
    const where = []
    const params = []

    // Filter theo học kỳ
    if (hocKy) {
      where.push('lhp.hoc_ky = ?')
      params.push(hocKy)
    }

    // Filter theo năm học
    if (namHoc) {
      where.push('lhp.nam_hoc = ?')
      params.push(namHoc)
    }

    // Filter theo tình trạng
    if (tinhTrang) {
      where.push('COALESCE(hocphi.tinh_trang, "Chưa nộp") = ?')
      params.push(tinhTrang)
    }

    // Search theo mã SV hoặc tên SV
    if (search) {
      where.push('(sv.ma_sv LIKE ? OR sv.ho_ten LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // Query lấy dữ liệu
    const [rows] = await pool.query(
      `
      SELECT 
        dk.id AS dangKyId,
        sv.id AS sinhVienId,
        sv.ma_sv AS maSv,
        sv.ho_ten AS hoTen,
        sv.email,
        hp.ma_hoc_phan AS maHocPhan,
        hp.ten_hoc_phan AS tenHocPhan,
        hp.so_tin_chi AS soTinChi,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        lhp.hoc_ky AS hocKy,
        lhp.nam_hoc AS namHoc,
        (hp.so_tin_chi * 1000000) AS soTien,
        COALESCE(hocphi.tinh_trang, 'Chưa nộp') AS tinhTrang,
        hocphi.han_nop AS hanNop,
        COALESCE(hocphi.lan_thu, 1) AS lanThu,
        dk.thoi_diem_dk AS ngayDangKy,
        CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop < CURDATE() THEN 'Quá hạn'
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop IS NULL THEN 'Chưa nộp'
          ELSE COALESCE(hocphi.tinh_trang, 'Chưa nộp')
        END AS trangThaiThucTe
      FROM DangKyHocPhan dk
      INNER JOIN SinhVien sv ON dk.sinh_vien_id = sv.id
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      ${whereSQL}
      AND dk.trang_thai_dk = 'THANH_CONG'
      ORDER BY 
        CASE 
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
               AND hocphi.han_nop < CURDATE() THEN 1
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' THEN 2
          WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' THEN 3
          ELSE 4
        END ASC,
        lhp.nam_hoc DESC,
        lhp.hoc_ky DESC,
        sv.ma_sv ASC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), offset]
    )

    // Đếm tổng số
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM DangKyHocPhan dk
      INNER JOIN SinhVien sv ON dk.sinh_vien_id = sv.id
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      ${whereSQL}
      AND dk.trang_thai_dk = 'THANH_CONG'
      `,
      params
    )

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  } catch (err) {
    console.error('❌ Lỗi khi lấy tất cả học phí:', err)
    throw err
  }
}

/**
 * Cập nhật hạn nộp học phí hàng loạt theo đợt đăng ký
 * @param {number} dotDangKyId - ID đợt đăng ký
 * @param {string} hanNop - Hạn nộp (YYYY-MM-DD)
 * @returns {number} Số bản ghi được cập nhật
 */
export async function capNhatHanNopTheoDot(dotDangKyId, hanNop) {
  try {
    // Lấy tất cả các đăng ký thành công trong đợt này
    const [danhSachDK] = await pool.query(
      `
      SELECT dk.id, dk.sinh_vien_id, dk.hoc_phan_id, dk.lop_hoc_phan_id,
             lhp.hoc_ky, lhp.nam_hoc
      FROM DangKyHocPhan dk
      LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      WHERE dk.dot_dang_ky_id = ? AND dk.trang_thai_dk = 'THANH_CONG'
      `,
      [dotDangKyId]
    )

    let count = 0
    for (const dk of danhSachDK) {
      // Kiểm tra xem đã có bản ghi HocPhi chưa
      const [existing] = await pool.query(
        'SELECT id FROM HocPhi WHERE dang_ky_id = ?',
        [dk.id]
      )

      if (existing.length > 0) {
        // Update hạn nộp
        await pool.query(
          'UPDATE HocPhi SET han_nop = ? WHERE dang_ky_id = ?',
          [hanNop, dk.id]
        )
      } else {
        // Insert bản ghi mới
        const [hpInfo] = await pool.query(
          'SELECT so_tin_chi FROM HocPhan WHERE id = ?',
          [dk.hoc_phan_id]
        )
        const soTien = hpInfo[0] ? hpInfo[0].so_tin_chi * 1000000 : 0

        await pool.query(
          `
          INSERT INTO HocPhi 
            (sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc, so_tien, tinh_trang, dang_ky_id, lop_hoc_phan_id, han_nop, lan_thu)
          VALUES (?, ?, ?, ?, ?, 'Chưa nộp', ?, ?, ?, 1)
          `,
          [
            dk.sinh_vien_id,
            dk.hoc_phan_id,
            dk.hoc_ky,
            dk.nam_hoc,
            soTien,
            dk.id,
            dk.lop_hoc_phan_id,
            hanNop
          ]
        )
      }
      count++
    }

    return count
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật hạn nộp theo đợt:', err)
    throw err
  }
}

/**
 * Lấy thống kê tổng quan học phí (cho admin)
 * @returns {Object} Thống kê
 */
export async function getThongKeHocPhi() {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        COUNT(*) AS tongSoHocPhan,
        SUM(hp.so_tin_chi * 1000000) AS tongTien,
        SUM(CASE WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Đã nộp' 
            THEN hp.so_tin_chi * 1000000 ELSE 0 END) AS daThanhToan,
        SUM(CASE WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') IN ('Chưa nộp', 'Quá hạn') 
            THEN hp.so_tin_chi * 1000000 ELSE 0 END) AS conNo,
        COUNT(CASE WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' THEN 1 END) AS soHocPhanChuaNop,
        COUNT(CASE WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Đã nộp' THEN 1 END) AS soHocPhanDaNop,
        COUNT(CASE WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' THEN 1 END) AS soHocPhanQuaHan
      FROM DangKyHocPhan dk
      INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
      LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
      WHERE dk.trang_thai_dk = 'THANH_CONG'
      `
    )
    return rows[0] || {}
  } catch (err) {
    console.error('❌ Lỗi khi lấy thống kê học phí:', err)
    throw err
  }
}