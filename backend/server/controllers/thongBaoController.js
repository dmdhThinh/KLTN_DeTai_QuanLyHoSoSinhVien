// server/controllers/thongBaoController.js
import { getAllThongBao, createThongBao } from '../models/thongBao.js'
import { pool } from '../config/db.js'
import multer from 'multer'
import path from 'path'

// 📁 Cấu hình nơi lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
})
export const upload = multer({ storage })


// ✅ Lấy danh sách tin tức kèm trạng thái đọc của sinh viên
export async function getThongBao(req, res) {
  try {
    const { sinhVienId } = req.query || {}
    let sql = `
      SELECT tb.*, 
             CASE 
               WHEN td.da_doc = 'Đã đọc' THEN 'Đã đọc'
               ELSE 'Chưa đọc'
             END AS trang_thai
      FROM ThongBao tb
      LEFT JOIN ThongBao_DaDoc td
        ON tb.id = td.thong_bao_id AND td.sinh_vien_id = ?
      ORDER BY tb.ngay_gui DESC
    `
    const [rows] = await pool.query(sql, [sinhVienId || null])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi lấy tin tức:', err)
    res.status(500).json({ message: 'Không thể tải danh sách tin tức' })
  }
}

// ✅ Thêm tin tức (có nhiều ảnh)
export async function addThongBao(req, res) {
  try {
    const { tieu_de, noi_dung, mo_ta_file } = req.body
    if (!tieu_de || !noi_dung)
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' })

    const video = req.files?.video?.[0]?.path || null
    const tep_dinh_kem = req.files?.tep_dinh_kem?.[0]?.path || null

    const [result] = await pool.query(
      `INSERT INTO ThongBao (tieu_de, noi_dung, video, tep_dinh_kem, mo_ta_file)
       VALUES (?, ?, ?, ?, ?)`,
      [tieu_de, noi_dung, video, tep_dinh_kem, mo_ta_file || null]
    )

    const thongBaoId = result.insertId

    if (req.files?.hinh_anh?.length) {
      const values = req.files.hinh_anh.map((f) => [thongBaoId, f.path])
      await pool.query('INSERT INTO ThongBao_Anh (thong_bao_id, duong_dan) VALUES ?', [values])
    }

    res.json({ message: 'Đăng tin tức thành công!' })
  } catch (err) {
    console.error('❌ Lỗi thêm tin tức:', err)
    res.status(500).json({ message: 'Không thể thêm tin tức' })
  }
}


// ✅ Lấy chi tiết tin có nhiều ảnh
export async function getThongBaoById(req, res) {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM ThongBao WHERE id = ?', [id])
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tin tức' })

    const [anh] = await pool.query('SELECT duong_dan FROM ThongBao_Anh WHERE thong_bao_id = ?', [id])
    const tin = { ...rows[0], hinh_anh: anh.map((a) => a.duong_dan) }
    res.json(tin)
  } catch (err) {
    console.error('❌ Lỗi lấy chi tiết tin:', err)
    res.status(500).json({ message: 'Không thể lấy chi tiết tin tức' })
  }
}

// ✅ Cập nhật tin tức
export async function updateThongBao(req, res) {
  try {
    const { id } = req.params
    const { tieu_de, noi_dung, mo_ta_file } = req.body
    if (!tieu_de || !noi_dung)
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' })

    const video = req.files?.video?.[0]?.path || null
    const tep_dinh_kem = req.files?.tep_dinh_kem?.[0]?.path || null

    // Cập nhật chính
    await pool.query(
      `UPDATE ThongBao 
       SET tieu_de=?, noi_dung=?, video=?, tep_dinh_kem=?, mo_ta_file=? 
       WHERE id=?`,
      [tieu_de, noi_dung, video, tep_dinh_kem, mo_ta_file || null, id]
    )

    // Nếu có ảnh mới → xóa cũ + thêm lại
    if (req.files?.hinh_anh?.length) {
      await pool.query('DELETE FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
      const values = req.files.hinh_anh.map((f) => [id, f.path])
      await pool.query(
        'INSERT INTO ThongBao_Anh (thong_bao_id, duong_dan) VALUES ?',
        [values]
      )
    }

    res.json({ message: 'Cập nhật tin tức thành công!' })
  } catch (err) {
    console.error('❌ Lỗi cập nhật tin tức:', err)
    res.status(500).json({ message: 'Không thể cập nhật tin tức' })
  }
}

// ✅ Xóa tin tức
export async function deleteThongBao(req, res) {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM ThongBao_Anh WHERE thong_bao_id=?', [id])
    await pool.query('DELETE FROM ThongBao WHERE id=?', [id])
    res.json({ message: 'Đã xóa tin tức' })
  } catch (err) {
    console.error('❌ Lỗi xóa tin tức:', err)
    res.status(500).json({ message: 'Không thể xóa tin tức' })
  }
}

