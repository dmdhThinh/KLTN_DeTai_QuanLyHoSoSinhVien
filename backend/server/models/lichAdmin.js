import { pool } from '../config/db.js'

// ===== LẤY DANH SÁCH LỊCH HỌC (ADMIN) =====
export async function getAllLichAdmin({ lopHocPhanId, lopId, hocKy, namHoc, thu } = {}) {
  let sql = `
    SELECT 
      lh.id,
      lh.lop_hoc_phan_id AS lopHocPhanId,
      lh.thu, lh.ca, lh.tiet_bat_dau AS tietBatDau, lh.tiet_ket_thuc AS tietKetThuc,
      lh.phong, lh.co_so AS coSo, lh.ngay_hoc AS ngayHoc, lh.loai, lh.ghi_chu AS ghiChu,

      lhp.ma_lop_hoc_phan AS maLopHocPhan,
      lhp.hoc_ky AS hocKy, lhp.nam_hoc AS namHoc,
      hp.ten_hoc_phan AS tenHocPhan, hp.ma_hoc_phan AS maHocPhan,
      gv.ho_ten AS tenGiangVien,
      l.ten_lop AS tenLop
    FROM LichHoc lh
    JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
    JOIN Lop l ON l.id = lhp.lop_id
    JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
    JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
    WHERE 1=1
  `
  const params = {}

  if (lopHocPhanId) { sql += ' AND lh.lop_hoc_phan_id = :lopHocPhanId'; params.lopHocPhanId = lopHocPhanId }
  if (lopId)        { sql += ' AND lhp.lop_id = :lopId'; params.lopId = lopId }
  if (hocKy)        { sql += ' AND lhp.hoc_ky = :hocKy'; params.hocKy = hocKy }
  if (namHoc)       { sql += ' AND lhp.nam_hoc = :namHoc'; params.namHoc = namHoc }
  if (thu)          { sql += ' AND lh.thu = :thu'; params.thu = thu }

  sql += ' ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky ASC, lh.thu ASC, lh.ca ASC, lh.tiet_bat_dau ASC'

  const [rows] = await pool.execute(sql, params)
  return rows
}

// ===== LẤY LỊCH HỌC THEO ID =====
export async function getLichByIdAdmin(id) {
  const [rows] = await pool.execute(`
    SELECT 
      lh.id, lh.lop_hoc_phan_id AS lopHocPhanId,
      lh.thu, lh.ca, lh.tiet_bat_dau AS tietBatDau, lh.tiet_ket_thuc AS tietKetThuc,
      lh.phong, lh.co_so AS coSo, lh.ngay_hoc AS ngayHoc, lh.loai, lh.ghi_chu AS ghiChu
    FROM LichHoc lh
    WHERE lh.id = :id
    LIMIT 1
  `, { id })
  return rows[0] || null
}

// ===== TẠO MỚI LỊCH HỌC =====
export async function createLichAdmin({
  lop_hoc_phan_id, thu, ca,
  tiet_bat_dau, tiet_ket_thuc,
  phong, co_so, ngay_hoc, loai, ghi_chu
}) {
  const [result] = await pool.execute(`
    INSERT INTO LichHoc
      (lop_hoc_phan_id, thu, ca, tiet_bat_dau, tiet_ket_thuc, phong, co_so, ngay_hoc, loai, ghi_chu)
    VALUES
      (:lop_hoc_phan_id, :thu, :ca, :tiet_bat_dau, :tiet_ket_thuc, :phong, :co_so, :ngay_hoc, :loai, :ghi_chu)
  `, {
    lop_hoc_phan_id,
    thu, ca, tiet_bat_dau, tiet_ket_thuc,
    phong, co_so, ngay_hoc: ngay_hoc || null,
    loai: loai || 'lythuyet', ghi_chu: ghi_chu || null
  })
  return result.insertId
}

// ===== CẬP NHẬT LỊCH HỌC =====
export async function updateLichAdmin(id, data) {
  const params = { id }
  const updateFields = []

  const addField = (field, value, allowEmpty = false) => {
    if (value !== undefined && (allowEmpty || (value !== null && value !== ''))) {
      updateFields.push(`${field} = :${field}`)
      params[field] = value
    }
  }

  // chỉ thêm các trường có giá trị thực sự
  addField('lop_hoc_phan_id', data.lop_hoc_phan_id)
  addField('thu', data.thu)
  addField('ca', data.ca)
  addField('tiet_bat_dau', data.tiet_bat_dau)
  addField('tiet_ket_thuc', data.tiet_ket_thuc)
  addField('phong', data.phong?.trim()) // ❗ chỉ update nếu không trống
  addField('co_so', data.co_so?.trim())
  addField('loai', data.loai)
  addField('ghi_chu', data.ghi_chu)
  addField('ngay_hoc', data.ngay_hoc)

  if (updateFields.length === 0)
    return false // không có gì để cập nhật

  const sql = `UPDATE LichHoc SET ${updateFields.join(', ')} WHERE id = :id`
  const [result] = await pool.execute(sql, params)
  return result.affectedRows > 0
}

export async function updateGiangVienLopHocPhan(lopHocPhanId, giangVienId) {
  const [result] = await pool.execute(`
    UPDATE LopHocPhan
    SET giang_vien_id = :giangVienId
    WHERE id = :lopHocPhanId
  `, { giangVienId, lopHocPhanId })
  return result.affectedRows > 0
}




// ===== XOÁ LỊCH HỌC =====
export async function deleteLichAdmin(id) {
  const [result] = await pool.execute('DELETE FROM LichHoc WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Thêm hoặc cập nhật buổi học ngoại lệ (1 ngày cụ thể)
export async function upsertLichHocNgoaiLe({ lich_hoc_id, ngay_hoc, phong, co_so, ghi_chu }) {
  const [exists] = await pool.execute(
    `SELECT id FROM LichHocNgoaiLe WHERE lich_hoc_id = :lich_hoc_id AND ngay_hoc = :ngay_hoc`,
    { lich_hoc_id, ngay_hoc }
  );

  if (exists.length > 0) {
    // Nếu đã có thì update
    await pool.execute(
      `UPDATE LichHocNgoaiLe
       SET phong = :phong, co_so = :co_so, ghi_chu = :ghi_chu
       WHERE lich_hoc_id = :lich_hoc_id AND ngay_hoc = :ngay_hoc`,
      { lich_hoc_id, ngay_hoc, phong, co_so, ghi_chu }
    );
    return 'updated';
  } else {
    // Nếu chưa có thì insert mới
    await pool.execute(
      `INSERT INTO LichHocNgoaiLe (lich_hoc_id, ngay_hoc, phong, co_so, ghi_chu)
       VALUES (:lich_hoc_id, :ngay_hoc, :phong, :co_so, :ghi_chu)`,
      { lich_hoc_id, ngay_hoc, phong, co_so, ghi_chu }
    );
    return 'inserted';
  }
}

