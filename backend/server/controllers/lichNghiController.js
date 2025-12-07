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
        ln.ly_do
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

// Xóa buổi nghỉ toàn khoa (reset nghỉ toàn khoa)
export async function xoaBuoiNghiToanKhoa(req, res) {
  try {
    const { khoaId, ngayNghi } = req.body

    if (!ngayNghi) {
      return res.status(400).json({ message: 'Thiếu thông tin ngayNghi' })
    }

    // Xóa các bản ghi LichNghi có ly_do = 'Nghỉ toàn khoa' và ngày nghỉ tương ứng
    let sql = `
      DELETE ln FROM LichNghi ln
      INNER JOIN LichHoc lh ON lh.id = ln.lich_hoc_id
      INNER JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      INNER JOIN Lop l ON l.id = lhp.lop_id
      WHERE ln.ngay_nghi = ? AND ln.ly_do = 'Nghỉ toàn khoa'
    `
    const params = [ngayNghi]

    if (khoaId) {
      sql += ' AND l.khoa_id = ?'
      params.push(khoaId)
    }

    const [result] = await pool.execute(sql, params)

    res.json({
      message: 'Đã xóa nghỉ toàn khoa thành công',
      affectedRows: result.affectedRows || 0,
    })
  } catch (err) {
    console.error('❌ Lỗi xoaBuoiNghiToanKhoa:', err)
    res.status(500).json({ message: 'Lỗi server khi xóa nghỉ toàn khoa' })
  }
}

// Lấy danh sách các ngày nghỉ toàn khoa
export async function getDanhSachNghiToanKhoa(req, res) {
  try {
    const { khoaId } = req.query

    let sql = `
      SELECT DISTINCT
        ln.ngay_nghi,
        COUNT(DISTINCT ln.lich_hoc_id) as so_lich_hoc
      FROM LichNghi ln
      INNER JOIN LichHoc lh ON lh.id = ln.lich_hoc_id
      INNER JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      INNER JOIN Lop l ON l.id = lhp.lop_id
      WHERE ln.ly_do = 'Nghỉ toàn khoa'
    `
    const params = []

    if (khoaId) {
      sql += ' AND l.khoa_id = ?'
      params.push(khoaId)
    }

    sql += ' GROUP BY ln.ngay_nghi ORDER BY ln.ngay_nghi DESC'

    const [rows] = await pool.execute(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getDanhSachNghiToanKhoa:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách nghỉ toàn khoa' })
  }
}
