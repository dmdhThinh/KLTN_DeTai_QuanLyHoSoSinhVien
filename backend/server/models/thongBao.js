// server/models/thongBao.js
import { pool } from '../config/db.js'

// Lấy danh sách tin tức
export async function getAllThongBao() {
  const [rows] = await pool.query('SELECT * FROM ThongBao ORDER BY ngay_gui DESC')
  return rows
}

// Thêm tin tức mới
export async function createThongBao({ tieu_de, noi_dung }) {
  const [result] = await pool.query(
    'INSERT INTO ThongBao (tieu_de, noi_dung) VALUES (?, ?)',
    [tieu_de, noi_dung]
  )
  return result.insertId
}