import { pool } from '../config/db.js'

export async function getGiangVienDetailById(id) {
  const sql = `
    SELECT 
      gv.id,
      gv.ma_gv   AS maGv,
      gv.ho_ten  AS hoTen,
      gv.email,
      gv.so_dien_thoai AS soDienThoai,
      k.ten_khoa AS khoa
    FROM GiangVien gv
    LEFT JOIN Khoa k ON k.id = gv.khoa_id
    WHERE gv.id = :id
    LIMIT 1
  `
  const [rows] = await pool.execute(sql, { id })
  return rows[0] || null
}
