// server/models/auth.js
import { pool } from '../config/db.js'

// Trả về bản ghi tài khoản + liên kết role, và map sang sinh viên/giảng viên nếu có
export async function findAccountByUsername(username) {
  const [rows] = await pool.query(
    `
    SELECT 
      tk.id AS id,
      tk.username,
      tk.password_hash,
      tk.role,
      tk.trang_thai,
      tk.da_doi_mat_khau,   -- ✅ Thêm dòng này
      gv.id AS gv_id, 
      sv.id AS sv_id
    FROM TaiKhoan tk
    LEFT JOIN GiangVien gv ON gv.tai_khoan_id = tk.id
    LEFT JOIN SinhVien sv ON sv.tai_khoan_id = tk.id
    WHERE tk.username = ?
    `,
    [username]
  )
  return rows[0]
}
