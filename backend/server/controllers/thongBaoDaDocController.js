import { pool } from '../config/db.js'

// Lấy số tin chưa đọc của sinh viên
export async function getUnreadCount(req, res) {
  try {
    const { sinhVienId } = req.params
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' })

    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM ThongBao tb
       LEFT JOIN ThongBao_DaDoc td
         ON tb.id = td.thong_bao_id AND td.sinh_vien_id = ?
       WHERE td.da_doc IS NULL OR td.da_doc = 'Chưa đọc'`,
      [sinhVienId]
    )
    res.json({ count: rows[0].count || 0 })
  } catch (err) {
    console.error('❌ getUnreadCount error:', err)
    res.status(500).json({ message: 'Lỗi lấy số lượng tin chưa đọc' })
  }
}

// Đánh dấu 1 tin là đã đọc
export async function markAsRead(req, res) {
  try {
    const { sinhVienId, thongBaoId } = req.body
    if (!sinhVienId || !thongBaoId)
      return res.status(400).json({ message: 'Thiếu dữ liệu' })

    // Nếu đã có thì cập nhật, chưa có thì thêm mới
    const [rows] = await pool.query(
      'SELECT id FROM ThongBao_DaDoc WHERE sinh_vien_id=? AND thong_bao_id=?',
      [sinhVienId, thongBaoId]
    )

    if (rows.length) {
      await pool.query(
        `UPDATE ThongBao_DaDoc SET da_doc='Đã đọc', ngay_doc=NOW()
         WHERE sinh_vien_id=? AND thong_bao_id=?`,
        [sinhVienId, thongBaoId]
      )
    } else {
      await pool.query(
        `INSERT INTO ThongBao_DaDoc (sinh_vien_id, thong_bao_id, da_doc, ngay_doc)
         VALUES (?, ?, 'Đã đọc', NOW())`,
        [sinhVienId, thongBaoId]
      )
    }

    res.json({ message: 'Đã đánh dấu đã đọc' })
  } catch (err) {
    console.error('❌ markAsRead error:', err)
    res.status(500).json({ message: 'Lỗi đánh dấu đã đọc' })
  }
}