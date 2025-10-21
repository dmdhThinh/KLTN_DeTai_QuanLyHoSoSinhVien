// server/controllers/sinhVienController.js
import { pool } from '../config/db.js'   // ✅ Đúng cú pháp với export const pool
import * as SinhVienModel from '../models/sinhvien.js'
import { createAccount } from '../models/taikhoan.js'

// GET ALL (có lọc theo Khoa, Ngành, Lớp)
export const getAll = async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      limit = 10,
      sort = 'desc',
      khoaId,
      nganhId,
      lopId
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)
    const where = []
    const params = []

    // Tìm kiếm theo mã SV hoặc họ tên
    if (q) {
      if (/^sv\d+/i.test(q)) {
        where.push('sv.ma_sv = ?')
        params.push(q)
      } else {
        where.push('sv.ho_ten LIKE ?')
        params.push(`%${q}%`)
      }
    }

    // Lọc theo khoa/ngành/lớp
    if (khoaId) {
      where.push('k.id = ?')
      params.push(Number(khoaId))
    }
    if (nganhId) {
      where.push('n.id = ?')
      params.push(Number(nganhId))
    }
    if (lopId) {
      where.push('l.id = ?')
      params.push(Number(lopId))
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // ✅ Lấy danh sách sinh viên kèm Khoa - Ngành - Lớp
    const [rows] = await pool.query(
      `
      SELECT 
        sv.id,
        sv.ma_sv AS maSv,
        sv.ho_ten AS hoTen,
        DATE_FORMAT(sv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
        sv.gioi_tinh AS gioiTinh,
        sv.khoa_hoc AS khoaHoc,
        sv.email,
        sv.so_dien_thoai AS soDienThoai,
        sv.dia_chi AS diaChi,
        l.ten_lop AS tenLop,
        n.ten_nganh AS tenNganh,
        k.ten_khoa AS tenKhoa
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      ${whereSQL}
      ORDER BY sv.id ${String(sort).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    )

    // ✅ Tổng số dòng
    const [[{ total } = { total: 0 }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      ${whereSQL}
      `,
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
    console.error('❌ Lỗi lấy danh sách sinh viên:', err)
    return res.status(500).json({ message: 'Lỗi lấy danh sách sinh viên' })
  }
}


// GET BY ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `
      SELECT 
        sv.id,
        sv.ma_sv AS maSv,
        sv.ho_ten AS hoTen,
        DATE_FORMAT(sv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
        sv.gioi_tinh AS gioiTinh,
        sv.email,
        sv.so_dien_thoai AS soDienThoai,
        sv.dia_chi AS diaChi,
        sv.khoa_hoc AS khoaHoc,
        sv.anh_the AS anhThe,
        sv.khoa_id AS khoaId,
        sv.nganh_id AS nganhId,
        sv.lop_id AS lopId,
        k.ten_khoa AS tenKhoa,
        n.ten_nganh AS tenNganh,
        l.ten_lop AS tenLop
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      WHERE sv.id = ?
      `,
      [Number(id)]
    )

    const sinhVien = rows[0]
    if (!sinhVien) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    }

    return res.json(sinhVien)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi lấy thông tin sinh viên' })
  }
}

export const create = async (req, res) => {
  try {
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the
    } = req.body || {}

    if (!ma_sv || !ho_ten || !ngay_sinh)
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' })

    const isDup = await SinhVienModel.isMaSvExists(ma_sv)
    if (isDup) return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' })

    // ✅ Tạo sinh viên trước
    const newId = await SinhVienModel.createSinhVien({
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the
    })

    // ✅ Tạo tài khoản sinh viên tương ứng
    try {
      const accId = await createAccount({
        username: ma_sv,
        password: '123456',
        role: 'Sinh viên',
        trang_thai: 'Hoạt động'
      })

      // Gán vào cột tai_khoan_id trong bảng SinhVien
      await pool.query('UPDATE SinhVien SET tai_khoan_id = ? WHERE id = ?', [accId, newId])
    } catch (err) {
      console.error('⚠️ Lỗi khi tạo tài khoản sinh viên:', err)
    }

    return res.status(201).json({ id: newId, message: 'Tạo sinh viên và tài khoản thành công' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi tạo sinh viên' })
  }
}


export const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the
    } = req.body || {}

    await SinhVienModel.updateSinhVien(Number(id), {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the
    })

    return res.json({ message: 'Cập nhật sinh viên thành công' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi cập nhật sinh viên' })
  }
}

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