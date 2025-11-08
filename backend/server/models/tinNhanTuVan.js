import { pool } from '../config/db.js'

/**
 * Gửi tin nhắn trong yêu cầu tư vấn
 * @param {number} yeuCauId - ID yêu cầu
 * @param {string} nguoiGui - 'SINH_VIEN', 'GIANG_VIEN', hoặc 'ADMIN'
 * @param {string} noiDung - Nội dung tin nhắn
 * @returns {object} Tin nhắn vừa tạo
 */
export async function guiTinNhan(yeuCauId, nguoiGui, noiDung) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Thêm tin nhắn mới
    const [result] = await conn.execute(
      `INSERT INTO TinNhanTuVan (yeu_cau_id, nguoi_gui, noi_dung, da_xem)
       VALUES (?, ?, ?, FALSE)`,
      [yeuCauId, nguoiGui, noiDung]
    )

    const tinNhanId = result.insertId

    // Đánh dấu tin nhắn của người gửi đối phương là đã đọc (vì đang trả lời)
    // ADMIN và GIANG_VIEN đều là người trả lời, đối phương là SINH_VIEN
    const nguoiDoiPhuong = nguoiGui === 'SINH_VIEN' ? 'GIANG_VIEN' : 'SINH_VIEN'
    await conn.execute(
      `UPDATE TinNhanTuVan 
       SET da_xem = TRUE
       WHERE yeu_cau_id = ? AND nguoi_gui = ? AND da_xem = FALSE`,
      [yeuCauId, nguoiDoiPhuong]
    )

    // Cập nhật YeuCauTuVan
    // ADMIN và GIANG_VIEN cùng logic
    if (nguoiGui === 'SINH_VIEN') {
      await conn.execute(
        `UPDATE YeuCauTuVan 
         SET 
           so_tin_chua_doc_gv = (
             SELECT COUNT(*) 
             FROM TinNhanTuVan 
             WHERE yeu_cau_id = ? AND nguoi_gui = 'SINH_VIEN' AND da_xem = FALSE
           ),
           so_tin_chua_doc_sv = 0,
           tin_nhan_cuoi = ?,
           thoi_gian_tin_nhan_cuoi = NOW(),
           trang_thai = CASE 
             WHEN trang_thai = 'DA_TRA_LOI' THEN 'CHO_XU_LY'
             ELSE trang_thai
           END
         WHERE id = ?`,
        [yeuCauId, noiDung, yeuCauId]
      )
    } else {
      // GIANG_VIEN hoặc ADMIN gửi tin nhắn
      await conn.execute(
        `UPDATE YeuCauTuVan 
         SET 
           so_tin_chua_doc_gv = 0,
           so_tin_chua_doc_sv = (
             SELECT COUNT(*) 
             FROM TinNhanTuVan 
             WHERE yeu_cau_id = ? AND nguoi_gui IN ('GIANG_VIEN', 'ADMIN') AND da_xem = FALSE
           ),
           tin_nhan_cuoi = ?,
           thoi_gian_tin_nhan_cuoi = NOW(),
           trang_thai = 'DA_TRA_LOI'
         WHERE id = ?`,
        [yeuCauId, noiDung, yeuCauId]
      )
    }

    await conn.commit()

    // Lấy tin nhắn vừa tạo
    const [[tinNhan]] = await conn.execute(
      `SELECT * FROM TinNhanTuVan WHERE id = ?`,
      [tinNhanId]
    )

    return tinNhan
  } catch (err) {
    await conn.rollback()
    console.error('❌ Lỗi khi gửi tin nhắn:', err)
    throw err
  } finally {
    conn.release()
  }
}

/**
 * Lấy danh sách tin nhắn của một yêu cầu
 * @param {number} yeuCauId - ID yêu cầu
 * @returns {Array} Danh sách tin nhắn
 */
export async function getDanhSachTinNhan(yeuCauId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM TinNhanTuVan
       WHERE yeu_cau_id = ?
       ORDER BY thoi_gian_gui ASC`,
      [yeuCauId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách tin nhắn:', err)
    throw err
  }
}

/**
 * Đánh dấu tất cả tin nhắn của người gửi đối phương là đã đọc
 * @param {number} yeuCauId - ID yêu cầu
 * @param {string} nguoiDoc - 'SINH_VIEN', 'GIANG_VIEN', hoặc 'ADMIN'
 * @returns {boolean} Thành công hay không
 */
export async function danhDauDaDocTinNhan(yeuCauId, nguoiDoc) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Đánh dấu tin nhắn đã đọc
    // Nếu ADMIN/GIANG_VIEN đọc, đánh dấu tin nhắn của SINH_VIEN
    const nguoiGui = nguoiDoc === 'SINH_VIEN' ? 'GIANG_VIEN' : 'SINH_VIEN'
    
    await conn.execute(
      `UPDATE TinNhanTuVan 
       SET da_xem = TRUE
       WHERE yeu_cau_id = ? AND nguoi_gui = ? AND da_xem = FALSE`,
      [yeuCauId, nguoiGui]
    )

    // Reset số tin chưa đọc
    if (nguoiDoc === 'SINH_VIEN') {
      await conn.execute(
        `UPDATE YeuCauTuVan 
         SET so_tin_chua_doc_sv = 0
         WHERE id = ?`,
        [yeuCauId]
      )
    } else {
      await conn.execute(
        `UPDATE YeuCauTuVan 
         SET so_tin_chua_doc_gv = 0
         WHERE id = ?`,
        [yeuCauId]
      )
    }

    await conn.commit()
    return true
  } catch (err) {
    await conn.rollback()
    console.error('❌ Lỗi khi đánh dấu đã đọc:', err)
    throw err
  } finally {
    conn.release()
  }
}

/**
 * Đếm tổng số tin nhắn chưa đọc của giảng viên (từ tất cả yêu cầu)
 * @param {number} giangVienId - ID giảng viên
 * @returns {number} Tổng số tin chưa đọc
 */
export async function demTinNhanChuaDocCuaGiangVien(giangVienId) {
  try {
    const [[result]] = await pool.query(
      `SELECT SUM(so_tin_chua_doc_gv) as count
       FROM YeuCauTuVan
       WHERE giang_vien_id = ? AND so_tin_chua_doc_gv > 0`,
      [giangVienId]
    )
    return result.count || 0
  } catch (err) {
    console.error('❌ Lỗi khi đếm tin chưa đọc GV:', err)
    throw err
  }
}

/**
 * Đếm tổng số tin nhắn chưa đọc của sinh viên (từ tất cả yêu cầu)
 * @param {number} sinhVienId - ID sinh viên
 * @returns {number} Tổng số tin chưa đọc
 */
export async function demTinNhanChuaDocCuaSinhVien(sinhVienId) {
  try {
    const [[result]] = await pool.query(
      `SELECT SUM(so_tin_chua_doc_sv) as count
       FROM YeuCauTuVan
       WHERE sinh_vien_id = ? AND so_tin_chua_doc_sv > 0`,
      [sinhVienId]
    )
    return result.count || 0
  } catch (err) {
    console.error('❌ Lỗi khi đếm tin chưa đọc SV:', err)
    throw err
  }
}
