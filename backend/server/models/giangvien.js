// server/models/giangvien.js
import { pool } from '../config/db.js'

// 🧩 Lấy toàn bộ giảng viên
export async function getAllGiangVien() {
  const sql = `
    SELECT 
      gv.id,
      gv.ma_gv   AS maGv,
      gv.ho_ten  AS hoTen,
      gv.email,
      gv.so_dien_thoai AS soDienThoai,
      k.ten_khoa AS tenKhoa
    FROM GiangVien gv
    LEFT JOIN Khoa k ON k.id = gv.khoa_id
    ORDER BY gv.ho_ten ASC
  `
  const [rows] = await pool.execute(sql)
  return rows
}

// 🧩 Lấy chi tiết giảng viên theo ID
export async function getGiangVienDetailById(id) {
  const sql = `
    SELECT 
      gv.id,
      gv.ma_gv   AS maGv,
      gv.ho_ten  AS hoTen,
      gv.email,
      gv.so_dien_thoai AS soDienThoai,
      gv.gioi_tinh AS gioiTinh,
      gv.ngay_sinh AS ngaySinh,
      gv.dia_chi AS diaChi,
      gv.khoa_id AS khoaId,
      k.ten_khoa AS tenKhoa
    FROM GiangVien gv
    LEFT JOIN Khoa k ON k.id = gv.khoa_id
    WHERE gv.id = ?
    LIMIT 1
  `
  const [rows] = await pool.execute(sql, [id])
  return rows[0] || null
}
