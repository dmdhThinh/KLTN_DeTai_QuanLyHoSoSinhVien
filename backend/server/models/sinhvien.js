import { pool } from '../config/db.js'

// Lấy đúng các field frontend cần hiển thị trong StudentDashboard:
// hoTen, maSv, lop, gioiTinh, khoaHoc, ngaySinh, nganh, diaChi, khoa, anhThe
export async function getSinhVienDetailById(id) {
  const sql = `
    SELECT 
      sv.id,
      sv.ma_sv       AS maSv,
      sv.ho_ten      AS hoTen,
      sv.ngay_sinh   AS ngaySinh,
      sv.gioi_tinh   AS gioiTinh,
      sv.email,
      sv.so_dien_thoai,
      sv.dia_chi     AS diaChi,
      sv.anh_the     AS anhThe,
      sv.khoa_hoc    AS khoaHoc,
      k.ten_khoa     AS khoa,
      n.ten_nganh    AS nganh,
      l.ten_lop      AS lop
    FROM SinhVien sv
    LEFT JOIN Khoa  k ON k.id = sv.khoa_id
    LEFT JOIN Nganh n ON n.id = sv.nganh_id
    LEFT JOIN Lop   l ON l.id = sv.lop_id
    WHERE sv.id = :id
    LIMIT 1
  `
  const [rows] = await pool.execute(sql, { id })
  return rows[0] || null
}
