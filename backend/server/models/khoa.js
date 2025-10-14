// server/models/khoa.js
import { pool } from '../config/db.js'

// ===== LẤY DANH SÁCH KHOA =====
export async function getAllKhoa() {
  const [rows] = await pool.execute(
    'SELECT id, ten_khoa AS tenKhoa FROM Khoa ORDER BY id ASC'
  )
  return rows
}

// ===== LẤY CHI TIẾT KHOA =====
export async function getKhoaById(id) {
  const [rows] = await pool.execute(
    'SELECT id, ten_khoa AS tenKhoa FROM Khoa WHERE id = :id LIMIT 1',
    { id }
  )
  return rows[0] || null
}

// ===== KIỂM TRA TRÙNG TÊN KHOA =====
export async function isTenKhoaExists(tenKhoa) {
  const [rows] = await pool.execute(
    'SELECT id FROM Khoa WHERE ten_khoa = :tenKhoa LIMIT 1',
    { tenKhoa }
  )
  return rows.length > 0
}

// ===== TẠO MỚI KHOA =====
export async function createKhoa(tenKhoa) {
  const [result] = await pool.execute(
    'INSERT INTO Khoa (ten_khoa) VALUES (:tenKhoa)',
    { tenKhoa }
  )
  return result.insertId
}

// ===== CẬP NHẬT KHOA =====
export async function updateKhoa(id, tenKhoa) {
  const [result] = await pool.execute(
    'UPDATE Khoa SET ten_khoa = :tenKhoa WHERE id = :id',
    { id, tenKhoa }
  )
  return result.affectedRows > 0
}

// ===== XOÁ KHOA =====
export async function deleteKhoa(id) {
  const [result] = await pool.execute('DELETE FROM Khoa WHERE id = :id', { id })
  return result.affectedRows > 0
}
