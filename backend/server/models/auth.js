import { pool } from '../config/db.js'

// Trả về bản ghi tài khoản + liên kết role, và map sang sinh viên/giảng viên nếu có
export async function findAccountByUsername(username) {
  const sql = `
    SELECT tk.id, tk.username, tk.password_hash, tk.role, tk.trang_thai,
           sv.id AS sv_id, gv.id AS gv_id
    FROM TaiKhoan tk
    LEFT JOIN SinhVien sv ON sv.tai_khoan_id = tk.id
    LEFT JOIN GiangVien gv ON gv.tai_khoan_id = tk.id
    WHERE tk.username = :username
    LIMIT 1
  `
  const [rows] = await pool.execute(sql, { username })
  return rows[0] || null
}
