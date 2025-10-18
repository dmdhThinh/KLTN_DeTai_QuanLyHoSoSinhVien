import { getGiangVienDetailById } from '../models/giangvien.js'
import { pool } from '../config/db.js'

export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ message: 'ID không hợp lệ' })
    const data = await getGiangVienDetailById(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy giảng viên' })
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
// 🧩 Lấy tất cả giảng viên
export async function getAll(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT id, ma_gv, ho_ten, email, so_dien_thoai 
      FROM GiangVien
      ORDER BY ho_ten ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách giảng viên' })
  }
}
