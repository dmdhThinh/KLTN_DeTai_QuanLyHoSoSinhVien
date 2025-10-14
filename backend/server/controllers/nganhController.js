// controllers/nganhController.js
import { pool } from '../config/db.js'

// 🧩 Lấy danh sách tất cả ngành (có cả tên khoa)
// 🧩 Lấy danh sách ngành (có lọc theo tên & khoa)
export async function getAllNganh(req, res) {
  try {
    const { q, khoaId } = req.query

    let sql = `
      SELECT n.id, n.ma_nganh AS maNganh, n.ten_nganh AS tenNganh,
             k.ten_khoa AS tenKhoa, n.khoa_id AS khoaId
      FROM Nganh n
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      WHERE 1=1
    `
    const params = []

    // 🔍 Lọc theo tên ngành (nếu có)
    if (q) {
      sql += ` AND n.ten_nganh LIKE ?`
      params.push(`%${q}%`)
    }

    // 🔍 Lọc theo khoa (nếu có)
    if (khoaId) {
      sql += ` AND n.khoa_id = ?`
      params.push(khoaId)
    }

    sql += ` ORDER BY n.id ASC`

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách ngành:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ngành' })
  }
}


// 🧩 Lấy 1 ngành theo ID
export async function getNganhById(req, res) {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `SELECT id, ma_nganh AS maNganh, ten_nganh AS tenNganh, khoa_id AS khoaId
       FROM Nganh WHERE id = ?`,
      [id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy ngành' })
    res.json(rows[0])
  } catch (err) {
    console.error('❌ Lỗi lấy ngành:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy ngành' })
  }
}

// 🧩 Thêm mới ngành
export async function createNganh(req, res) {
  try {
    const { ma_nganh, ten_nganh, khoa_id } = req.body
    if (!ma_nganh || !ten_nganh)
      return res.status(400).json({ message: 'Thiếu mã ngành hoặc tên ngành' })

    const [result] = await pool.query(
      `INSERT INTO Nganh (ma_nganh, ten_nganh, khoa_id) VALUES (?, ?, ?)`,
      [ma_nganh, ten_nganh, khoa_id || null]
    )
    res.status(201).json({ message: 'Đã thêm ngành thành công', id: result.insertId })
  } catch (err) {
    console.error('❌ Lỗi thêm ngành:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm ngành' })
  }
}

// 🧩 Cập nhật ngành
export async function updateNganh(req, res) {
  try {
    const { id } = req.params
    const { ma_nganh, ten_nganh, khoa_id } = req.body

    const [result] = await pool.query(
      `UPDATE Nganh SET ma_nganh = ?, ten_nganh = ?, khoa_id = ? WHERE id = ?`,
      [ma_nganh, ten_nganh, khoa_id || null, id]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy ngành cần cập nhật' })

    res.json({ message: 'Đã cập nhật ngành thành công' })
  } catch (err) {
    console.error('❌ Lỗi cập nhật ngành:', err)
    res.status(500).json({ message: 'Lỗi server khi cập nhật ngành' })
  }
}

// 🧩 Xóa ngành
export async function deleteNganh(req, res) {
  try {
    const { id } = req.params
    const [result] = await pool.query(`DELETE FROM Nganh WHERE id = ?`, [id])
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy ngành cần xóa' })
    res.json({ message: 'Đã xóa ngành thành công' })
  } catch (err) {
    console.error('❌ Lỗi xóa ngành:', err)
    res.status(500).json({ message: 'Lỗi server khi xóa ngành' })
  }
}
