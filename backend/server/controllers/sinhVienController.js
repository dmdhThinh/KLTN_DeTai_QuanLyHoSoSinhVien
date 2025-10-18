// server/controllers/sinhVienController.js
import { pool } from '../config/db.js'   // ✅ Đúng cú pháp với export const pool
import * as SinhVienModel from '../models/sinhvien.js'

// GET ALL
export const getAll = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10, sort = 'desc' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where = []
    const params = []
    if (q) {
      where.push('(sv.ma_sv LIKE ? OR sv.ho_ten LIKE ?)')
      params.push(`%${q}%`, `%${q}%`)
    }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `
      SELECT sv.id, sv.ma_sv AS maSv, sv.ho_ten AS hoTen, sv.ngay_sinh AS ngaySinh,
             sv.gioi_tinh AS gioiTinh, sv.khoa_hoc AS khoaHoc, sv.lop_id AS lopId
      FROM SinhVien sv
      ${whereSQL}
      ORDER BY sv.id ${String(sort).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    )

    const [[{ total } = { total: 0 }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM SinhVien sv ${whereSQL}`,
      params
    )

    return res.json({
      data: rows || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / Number(limit)))
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi lấy danh sách sinh viên' })
  }
}

// GET BY ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await SinhVienModel.getSinhVienDetailById(Number(id))
    if (!data) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    return res.json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi lấy thông tin sinh viên' })
  }
}

// CREATE
// export const create = async (req, res) => {
//   try {
//     const {
//       ma_sv, ho_ten, ngay_sinh, gioi_tinh,
//       email, so_dien_thoai, dia_chi, khoa_hoc,
//       lop_id
//     } = req.body || {}

//     if (!ma_sv || !ho_ten || !ngay_sinh)
//       return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' })

//     const birthYear = Number(String(ngay_sinh).slice(0, 4))
//     const currentYear = new Date().getFullYear()
//     if (!birthYear || currentYear - birthYear <= 18)
//       return res.status(400).json({ message: 'Tuổi phải lớn hơn 18.' })

//     const isDup = await SinhVienModel.isMaSvExists(ma_sv)
//     if (isDup) return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' })

//     if (!lop_id || isNaN(Number(lop_id)))
//       return res.status(400).json({ message: 'Vui lòng chọn lớp hợp lệ (lop_id).' })

//     const [lopRows] = await pool.query('SELECT id FROM Lop WHERE id = ?', [Number(lop_id)])
//     if (!lopRows || lopRows.length === 0)
//       return res.status(400).json({ message: 'Lớp không tồn tại.' })

//     const newId = await SinhVienModel.createSinhVien({
//       ma_sv, ho_ten, ngay_sinh, gioi_tinh,
//       email, so_dien_thoai, dia_chi, khoa_hoc,
//       lop_id: Number(lop_id)
//     })

//     return res.status(201).json({ id: newId, message: 'Tạo sinh viên thành công' })
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ message: 'Lỗi tạo sinh viên' })
//   }
// }

export const create = async (req, res) => {
  try {
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      lop_id
    } = req.body || {}

    const { anh_the } = req.body || {}

    if (!ma_sv || !ho_ten || !ngay_sinh)
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' })

    const isDup = await SinhVienModel.isMaSvExists(ma_sv)
    if (isDup) return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' })

    if (!lop_id || isNaN(Number(lop_id)))
      return res.status(400).json({ message: 'Vui lòng chọn lớp hợp lệ (lop_id).' })

    const [lopRows] = await pool.query('SELECT id FROM Lop WHERE id = ?', [Number(lop_id)])
    if (!lopRows || lopRows.length === 0)
      return res.status(400).json({ message: 'Lớp không tồn tại.' })

    const newId = await SinhVienModel.createSinhVien({
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      lop_id: Number(lop_id), anh_the
    })

    return res.status(201).json({ id: newId, message: 'Tạo sinh viên thành công' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi tạo sinh viên' })
  }
}

// UPDATE
export const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      lop_id
    } = req.body || {}

    if (lop_id !== undefined) {
      if (!lop_id || isNaN(Number(lop_id)))
        return res.status(400).json({ message: 'lop_id không hợp lệ.' })

      const [rows] = await pool.query('SELECT id FROM Lop WHERE id = ?', [Number(lop_id)])
      if (!rows || rows.length === 0)
        return res.status(400).json({ message: 'Lớp không tồn tại.' })
    }

    await SinhVienModel.updateSinhVien(Number(id), {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      lop_id: lop_id !== undefined ? Number(lop_id) : undefined
    })

    return res.json({ message: 'Cập nhật sinh viên thành công' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi cập nhật sinh viên' })
  }
}

// DELETE
export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM SinhVien WHERE id = ?', [Number(id)])
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi xoá sinh viên' })
  }
}
