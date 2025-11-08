import { pool } from '../config/db.js'

// Thêm buổi nghỉ
export async function themBuoiNghi(req, res) {
  try {
    const { lichHocId, ngayNghi, lyDo } = req.body
    if (!lichHocId || !ngayNghi) {
      return res.status(400).json({ message: 'Thiếu thông tin lichHocId hoặc ngayNghi' })
    }

    const sql = `
      INSERT INTO LichNghi (lich_hoc_id, ngay_nghi, ly_do)
      VALUES (?, ?, ?)
    `
    await pool.execute(sql, [lichHocId, ngayNghi, lyDo || null])
    res.json({ message: 'Đã thêm buổi nghỉ thành công' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Buổi nghỉ này đã tồn tại' })
    }
    console.error('❌ Lỗi themBuoiNghi:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm buổi nghỉ' })
  }
}

// Xóa buổi nghỉ (hủy nghỉ -> học lại)
export async function xoaBuoiNghi(req, res) {
  try {
    const { id } = req.params
    const sql = `DELETE FROM LichNghi WHERE id = ?`
    await pool.execute(sql, [id])
    res.json({ message: 'Đã xóa buổi nghỉ (học lại bình thường)' })
  } catch (err) {
    console.error('❌ Lỗi xoaBuoiNghi:', err)
    res.status(500).json({ message: 'Lỗi server khi xóa buổi nghỉ' })
  }
}

// Lấy danh sách buổi nghỉ của 1 lịch học
export async function getDanhSachBuoiNghi(req, res) {
  try {
    const { lichHocId } = req.query
    const sql = `
      SELECT 
        ln.id,
        ln.lich_hoc_id,
        ln.ngay_nghi,
        ln.ly_do,
        ln.created_at
      FROM LichNghi ln
      WHERE ln.lich_hoc_id = ?
      ORDER BY ln.ngay_nghi DESC
    `
    const [rows] = await pool.execute(sql, [lichHocId])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getDanhSachBuoiNghi:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách buổi nghỉ' })
  }
}
