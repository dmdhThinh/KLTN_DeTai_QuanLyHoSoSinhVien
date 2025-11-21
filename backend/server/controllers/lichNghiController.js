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

// Thêm buổi nghỉ cho toàn khoa trong một ngày (nghỉ lễ, nghỉ toàn khoa)
export async function themBuoiNghiToanKhoa(req, res) {
  try {
    const { khoaId, ngayNghi, lyDo } = req.body

    if (!ngayNghi) {
      return res.status(400).json({ message: 'Thiếu thông tin ngayNghi' })
    }

    // Nếu không truyền khoaId thì áp dụng cho tất cả khoa
    const params = [ngayNghi, lyDo || null]

    let whereClause = ''
    if (khoaId) {
      whereClause = 'WHERE l.khoa_id = ?'
      params.push(khoaId)
    }

    const sql = `
      INSERT IGNORE INTO LichNghi (lich_hoc_id, ngay_nghi, ly_do)
      SELECT 
        lh.id AS lich_hoc_id,
        ?,
        ?
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN Lop l ON l.id = lhp.lop_id
      ${whereClause}
    `

    const [result] = await pool.execute(sql, params)

    res.json({
      message: 'Đã thêm ngày nghỉ cho toàn khoa thành công',
      affectedRows: result.affectedRows || 0,
    })
  } catch (err) {
    console.error('❌ Lỗi themBuoiNghiToanKhoa:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm buổi nghỉ toàn khoa' })
  }
}
