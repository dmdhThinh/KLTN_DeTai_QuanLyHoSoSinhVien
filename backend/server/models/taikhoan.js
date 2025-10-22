// server/models/taikhoan.js
import { pool } from '../config/db.js'
import bcrypt from 'bcrypt'

export async function getAll({ q = '', role = '' }) {
  const where = []
  const params = []

  if (q) {
    where.push('tk.username LIKE ?')
    params.push(`%${q}%`)
  }

  if (role) {
    where.push('tk.role = ?')
    params.push(role)
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const [rows] = await pool.query(
    `
    SELECT 
      tk.id,
      tk.username,
      tk.role,
      tk.trang_thai,
      CASE
        WHEN tk.role = 'Giảng viên' THEN 
          COALESCE(gv.ho_ten, tk.ho_ten)
        WHEN tk.role = 'Sinh viên' THEN 
          COALESCE(sv.ho_ten, tk.ho_ten)
        ELSE tk.ho_ten
      END AS hoTen
    FROM TaiKhoan tk
    LEFT JOIN GiangVien gv ON gv.tai_khoan_id = tk.id
    LEFT JOIN SinhVien sv ON sv.tai_khoan_id = tk.id
    ${whereSQL}
    ORDER BY tk.id DESC
    LIMIT 20
    `,
    params
  )
  return rows
}

export async function createAccount({ username, password, role, ho_ten = '', trang_thai = 'Hoạt động' }) {
  const passwordHash = await bcrypt.hash(password, 10)
  const [rs] = await pool.query(
    `INSERT INTO TaiKhoan (username, password_hash, role, ho_ten, trang_thai)
     VALUES (?, ?, ?, ?, ?)`,
    [username, passwordHash, role, ho_ten, trang_thai]
  )
  return rs.insertId  // ✅ chỉ trả về ID số, không phải { id: ... }
}

export async function resetPassword(id) {
  const hash = await bcrypt.hash('123456', 10)
  await pool.query('UPDATE TaiKhoan SET password_hash = ? WHERE id = ?', [hash, id])
}

export async function toggleStatus(id) {
  await pool.query(`
    UPDATE TaiKhoan 
    SET trang_thai = CASE 
      WHEN trang_thai = 'Hoạt động' THEN 'Ngừng hoạt động'
      ELSE 'Hoạt động'
    END
    WHERE id = ?
  `, [id])
}

export async function deleteAccount(id) {
  await pool.query('DELETE FROM TaiKhoan WHERE id = ?', [id])
}
