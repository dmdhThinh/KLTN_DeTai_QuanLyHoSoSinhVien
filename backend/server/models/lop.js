import { pool } from '../config/db.js'

// ===== LẤY DANH SÁCH LỚP (JOIN tên khoa & ngành) =====
export async function getAllLop() {
  const [rows] = await pool.execute(`
    SELECT 
      l.id, 
      l.ten_lop AS tenLop,
      k.ten_khoa AS tenKhoa,
      n.ten_nganh AS tenNganh,
      l.khoa_id AS khoaId,
      l.nganh_id AS nganhId
    FROM Lop l
    LEFT JOIN Khoa k ON l.khoa_id = k.id
    LEFT JOIN Nganh n ON l.nganh_id = n.id
    ORDER BY l.id ASC
  `)
  return rows
}

// ===== LẤY LỚP THEO ID =====
export async function getLopById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      l.id, 
      l.ten_lop AS tenLop,
      k.ten_khoa AS tenKhoa,
      n.ten_nganh AS tenNganh,
      l.khoa_id AS khoaId,
      l.nganh_id AS nganhId
    FROM Lop l
    LEFT JOIN Khoa k ON l.khoa_id = k.id
    LEFT JOIN Nganh n ON l.nganh_id = n.id
    WHERE l.id = :id
    LIMIT 1
  `, { id })
  return rows[0] || null
}

// ===== KIỂM TRA TRÙNG TÊN LỚP =====
export async function isTenLopExists(tenLop) {
  const [rows] = await pool.execute(
    'SELECT id FROM Lop WHERE ten_lop = :tenLop LIMIT 1',
    { tenLop }
  )
  return rows.length > 0
}

// ===== TẠO MỚI LỚP =====
export async function createLop(tenLop, khoaId, nganhId) {
  const [result] = await pool.execute(
    'INSERT INTO Lop (ten_lop, khoa_id, nganh_id) VALUES (:tenLop, :khoaId, :nganhId)',
    { tenLop, khoaId, nganhId }
  )
  return result.insertId
}

// ===== CẬP NHẬT LỚP =====
export async function updateLop(id, tenLop, khoaId, nganhId) {
  const [result] = await pool.execute(
    'UPDATE Lop SET ten_lop = :tenLop, khoa_id = :khoaId, nganh_id = :nganhId WHERE id = :id',
    { id, tenLop, khoaId, nganhId }
  )
  return result.affectedRows > 0
}

// ===== XOÁ LỚP =====
export async function deleteLop(id) {
  const [result] = await pool.execute('DELETE FROM Lop WHERE id = :id', { id })
  return result.affectedRows > 0
}
