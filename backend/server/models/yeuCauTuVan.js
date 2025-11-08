import { pool } from '../config/db.js'

/**
 * Lấy danh sách lớp học phần mà sinh viên đã đăng ký (để gửi yêu cầu tư vấn)
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Array} Danh sách lớp học phần với thông tin giảng viên
 */
export async function getLopHocPhanCuaSinhVien(sinhVienId) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT
        lhp.id AS lop_hoc_phan_id,
        lhp.ma_lop_hoc_phan,
        hp.ma_hoc_phan,
        hp.ten_hoc_phan,
        lhp.hoc_ky,
        lhp.nam_hoc,
        gv.id AS giang_vien_id,
        gv.ho_ten AS ten_giang_vien,
        gv.email AS email_giang_vien
      FROM DangKyHocPhan dk
      INNER JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      INNER JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      LEFT JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
      WHERE dk.sinh_vien_id = ?
      ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky DESC, hp.ten_hoc_phan ASC`,
      [sinhVienId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách lớp học phần của sinh viên:', err)
    throw err
  }
}

/**
 * Tạo yêu cầu tư vấn mới
 * @param {Object} data - { sinh_vien_id, giang_vien_id, lop_hoc_phan_id, tieu_de, noi_dung, loai_nguoi_nhan }
 * @returns {Object} Yêu cầu vừa tạo
 */
export async function taoYeuCauTuVan(data) {
  try {
    const { sinh_vien_id, giang_vien_id, lop_hoc_phan_id, tieu_de, noi_dung, loai_nguoi_nhan } = data

    const [result] = await pool.query(
      `INSERT INTO YeuCauTuVan 
        (sinh_vien_id, giang_vien_id, loai_nguoi_nhan, lop_hoc_phan_id, tieu_de, noi_dung, trang_thai, thoi_gian_gui)
      VALUES (?, ?, ?, ?, ?, ?, 'CHO_XU_LY', NOW())`,
      [sinh_vien_id, giang_vien_id, loai_nguoi_nhan || 'GIANG_VIEN', lop_hoc_phan_id, tieu_de, noi_dung]
    )

    return { id: result.insertId, ...data, trang_thai: 'CHO_XU_LY' }
  } catch (err) {
    console.error('❌ Lỗi khi tạo yêu cầu tư vấn:', err)
    throw err
  }
}

/**
 * Lấy danh sách yêu cầu tư vấn của sinh viên
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Array} Danh sách yêu cầu tư vấn
 */
export async function getDanhSachYeuCauCuaSinhVien(sinhVienId) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        yc.*,
        gv.ho_ten AS ten_giang_vien,
        gv.email AS email_giang_vien,
        hp.ten_hoc_phan,
        lhp.ma_lop_hoc_phan,
        COALESCE(yc.so_tin_chua_doc_sv, 0) AS so_tin_chua_doc_sv,
        yc.tin_nhan_cuoi,
        yc.thoi_gian_tin_nhan_cuoi
      FROM YeuCauTuVan yc
      LEFT JOIN GiangVien gv ON yc.giang_vien_id = gv.id
      LEFT JOIN LopHocPhan lhp ON yc.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      WHERE yc.sinh_vien_id = ?
      ORDER BY 
        CASE WHEN COALESCE(yc.so_tin_chua_doc_sv, 0) > 0 THEN 0 ELSE 1 END,
        COALESCE(yc.thoi_gian_tin_nhan_cuoi, yc.thoi_gian_gui) DESC`,
      [sinhVienId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của sinh viên:', err)
    throw err
  }
}

/**
 * Lấy danh sách yêu cầu tư vấn gửi đến giảng viên
 * @param {number} giangVienId - ID giảng viên
 * @returns {Array} Danh sách yêu cầu tư vấn
 */
export async function getDanhSachYeuCauCuaGiangVien(giangVienId) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        yc.*,
        sv.ma_sv,
        sv.ho_ten AS ten_sinh_vien,
        sv.email AS email_sinh_vien,
        hp.ten_hoc_phan,
        lhp.ma_lop_hoc_phan,
        COALESCE(yc.so_tin_chua_doc_gv, 0) AS so_tin_chua_doc_gv,
        yc.tin_nhan_cuoi,
        yc.thoi_gian_tin_nhan_cuoi
      FROM YeuCauTuVan yc
      INNER JOIN SinhVien sv ON yc.sinh_vien_id = sv.id
      INNER JOIN LopHocPhan lhp ON yc.lop_hoc_phan_id = lhp.id
      INNER JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      WHERE yc.giang_vien_id = ?
      ORDER BY 
        CASE WHEN COALESCE(yc.so_tin_chua_doc_gv, 0) > 0 THEN 0 ELSE 1 END,
        COALESCE(yc.thoi_gian_tin_nhan_cuoi, yc.thoi_gian_gui) DESC`,
      [giangVienId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của giảng viên:', err)
    throw err
  }
}

/**
 * Lấy danh sách yêu cầu tư vấn gửi đến Admin
 * @returns {Array} Danh sách yêu cầu tư vấn
 */
export async function getDanhSachYeuCauCuaAdmin() {
  try {
    const [rows] = await pool.query(
      `SELECT 
        yc.*,
        sv.ma_sv,
        sv.ho_ten AS ten_sinh_vien,
        sv.email AS email_sinh_vien,
        sv.lop_id,
        l.ten_lop,
        COALESCE(yc.so_tin_chua_doc_gv, 0) AS so_tin_chua_doc,
        yc.tin_nhan_cuoi,
        yc.thoi_gian_tin_nhan_cuoi
      FROM YeuCauTuVan yc
      INNER JOIN SinhVien sv ON yc.sinh_vien_id = sv.id
      LEFT JOIN Lop l ON sv.lop_id = l.id
      WHERE yc.loai_nguoi_nhan = 'ADMIN'
      ORDER BY 
        CASE WHEN COALESCE(yc.so_tin_chua_doc_gv, 0) > 0 THEN 0 ELSE 1 END,
        COALESCE(yc.thoi_gian_tin_nhan_cuoi, yc.thoi_gian_gui) DESC`
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách yêu cầu của admin:', err)
    throw err
  }
}

/**
 * Lấy chi tiết yêu cầu tư vấn
 * @param {number} yeuCauId - ID yêu cầu
 * @returns {Object} Chi tiết yêu cầu
 */
export async function getChiTietYeuCau(yeuCauId) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        yc.*,
        sv.ma_sv,
        sv.ho_ten AS ten_sinh_vien,
        sv.email AS email_sinh_vien,
        gv.ho_ten AS ten_giang_vien,
        gv.email AS email_giang_vien,
        hp.ten_hoc_phan,
        lhp.ma_lop_hoc_phan
      FROM YeuCauTuVan yc
      INNER JOIN SinhVien sv ON yc.sinh_vien_id = sv.id
      LEFT JOIN GiangVien gv ON yc.giang_vien_id = gv.id
      LEFT JOIN LopHocPhan lhp ON yc.lop_hoc_phan_id = lhp.id
      LEFT JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      WHERE yc.id = ?`,
      [yeuCauId]
    )
    return rows[0] || null
  } catch (err) {
    console.error('❌ Lỗi khi lấy chi tiết yêu cầu:', err)
    throw err
  }
}

/**
 * Cập nhật trạng thái yêu cầu (giảng viên đánh dấu đang xử lý)
 * @param {number} yeuCauId - ID yêu cầu
 * @param {string} trangThai - Trạng thái mới
 * @returns {boolean} Thành công hay không
 */
export async function capNhatTrangThai(yeuCauId, trangThai) {
  try {
    const [result] = await pool.query(
      `UPDATE YeuCauTuVan SET trang_thai = ? WHERE id = ?`,
      [trangThai, yeuCauId]
    )
    return result.affectedRows > 0
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật trạng thái:', err)
    throw err
  }
}

/**
 * Phản hồi yêu cầu tư vấn (giảng viên trả lời)
 * @param {number} yeuCauId - ID yêu cầu
 * @param {string} phanHoi - Nội dung phản hồi
 * @returns {boolean} Thành công hay không
 */
export async function phanHoiYeuCau(yeuCauId, phanHoi) {
  try {
    const [result] = await pool.query(
      `UPDATE YeuCauTuVan 
       SET phan_hoi = ?, trang_thai = 'DA_TRA_LOI', thoi_gian_phan_hoi = NOW()
       WHERE id = ?`,
      [phanHoi, yeuCauId]
    )
    return result.affectedRows > 0
  } catch (err) {
    console.error('❌ Lỗi khi phản hồi yêu cầu:', err)
    throw err
  }
}

/**
 * Hủy yêu cầu tư vấn (sinh viên hủy)
 * @param {number} yeuCauId - ID yêu cầu
 * @param {number} sinhVienId - ID sinh viên (để kiểm tra quyền)
 * @returns {boolean} Thành công hay không
 */
export async function huyYeuCau(yeuCauId, sinhVienId) {
  try {
    const [result] = await pool.query(
      `UPDATE YeuCauTuVan 
       SET trang_thai = 'DA_HUY'
       WHERE id = ? AND sinh_vien_id = ? AND trang_thai = 'CHO_XU_LY'`,
      [yeuCauId, sinhVienId]
    )
    return result.affectedRows > 0
  } catch (err) {
    console.error('❌ Lỗi khi hủy yêu cầu:', err)
    throw err
  }
}

/**
 * Đếm tổng số tin nhắn chưa đọc của giảng viên (từ tất cả conversations)
 * @param {number} giangVienId - ID giảng viên
 * @returns {number} Số lượng tin nhắn chưa đọc
 */
export async function demYeuCauMoiCuaGiangVien(giangVienId) {
  try {
    const [[result]] = await pool.query(
      `SELECT SUM(so_tin_chua_doc_gv) as count
       FROM YeuCauTuVan
       WHERE giang_vien_id = ? AND so_tin_chua_doc_gv > 0`,
      [giangVienId]
    )
    return result.count || 0
  } catch (err) {
    console.error('❌ Lỗi khi đếm tin nhắn chưa đọc của giảng viên:', err)
    throw err
  }
}

/**
 * Đếm tổng số tin nhắn chưa đọc của sinh viên (từ tất cả conversations)
 * @param {number} sinhVienId - ID sinh viên
 * @returns {number} Số lượng tin nhắn chưa đọc
 */
export async function demPhanHoiMoiCuaSinhVien(sinhVienId) {
  try {
    const [[result]] = await pool.query(
      `SELECT SUM(so_tin_chua_doc_sv) as count
       FROM YeuCauTuVan
       WHERE sinh_vien_id = ? AND so_tin_chua_doc_sv > 0`,
      [sinhVienId]
    )
    return result.count || 0
  } catch (err) {
    console.error('❌ Lỗi khi đếm tin nhắn chưa đọc của sinh viên:', err)
    throw err
  }
}

/**
 * Đếm tổng số tin nhắn chưa đọc gửi tới Admin
 * @returns {number} Số lượng tin nhắn chưa đọc
 */
export async function demYeuCauMoiCuaAdmin() {
  try {
    const [[result]] = await pool.query(
      `SELECT SUM(so_tin_chua_doc_gv) as count
       FROM YeuCauTuVan
       WHERE loai_nguoi_nhan = 'ADMIN' AND so_tin_chua_doc_gv > 0`
    )
    return result.count || 0
  } catch (err) {
    console.error('❌ Lỗi khi đếm tin nhắn chưa đọc của admin:', err)
    throw err
  }
}

/**
 * ⚠️ DEPRECATED: Các function cũ đã được thay thế bởi hệ thống conversation thread
 * Sử dụng tinNhanTuVan.danhDauDaDocTinNhan() thay thế
 * 
 * OLD API: 
 * - /api/yeu-cau-tu-van/:id/danh-dau-da-xem-gv
 * - /api/yeu-cau-tu-van/:id/danh-dau-da-xem-sv
 * 
 * NEW API:
 * - /api/tin-nhan-tu-van/:yeuCauId/danh-dau-da-doc
 */
