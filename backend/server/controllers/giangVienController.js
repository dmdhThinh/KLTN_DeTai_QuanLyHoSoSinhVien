// server/controllers/giangVienController.js
import { pool } from '../config/db.js'
import * as GV from '../models/giangvien.js'
import { createAccount } from '../models/taikhoan.js'

export async function listGiangVien(req, res) {
  try {
    const { q = '', page = 1, limit = 10, khoaId, nganhId } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const where = []
    const params = []

    if (q) {
      where.push('(gv.ma_gv LIKE ? OR gv.ho_ten LIKE ?)')
      params.push(`%${q}%`, `%${q}%`)
    }
    if (khoaId) {
      where.push('k.id = ?')
      params.push(khoaId)
    }
    if (nganhId) {
      where.push('n.id = ?')
      params.push(nganhId)
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `
      SELECT 
        gv.id,
        gv.ma_gv AS maGv,
        gv.ho_ten AS hoTen,
        gv.gioi_tinh AS gioiTinh,
        DATE_FORMAT(gv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
        k.ten_khoa AS tenKhoa,
        n.ten_nganh AS tenNganh
      FROM GiangVien gv
      LEFT JOIN Khoa k ON gv.khoa_id = k.id
      LEFT JOIN Nganh n ON gv.nganh_id = n.id
      ${whereSQL}
      ORDER BY gv.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    )

    const [[{ total } = { total: 0 }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM GiangVien gv
      LEFT JOIN Khoa k ON gv.khoa_id = k.id
      LEFT JOIN Nganh n ON gv.nganh_id = n.id
      ${whereSQL}
      `,
      params
    )

    res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    })
  } catch (err) {
    console.error('listGiangVien error:', err)
    res.status(500).json({ message: 'Không thể lấy danh sách giảng viên' })
  }
}


export async function getGiangVien(req, res) {
  try {
    const { id } = req.params
    const item = await GV.getById(id)
    if (!item) return res.status(404).json({ message: 'Không tìm thấy giảng viên' })
    res.json(item)
  } catch (err) {
    console.error('getGiangVien error:', err)
    res.status(500).json({ message: 'Không thể lấy thông tin giảng viên' })
  }
}

export async function createGiangVien(req, res) {
  try {
    const payload = req.body
    // thêm giảng viên vào bảng GiangVien
    const result = await GV.create(payload)
    const item = await GV.getById(result.id)

    // ✅ tự tạo tài khoản cho giảng viên mới
    try {
      const accountId = await createAccount({
        username: item.ma_gv,
         ho_ten: item.ho_ten,           // dùng mã giảng viên làm tên đăng nhập
        password: '123456',             // mật khẩu mặc định
        role: 'Giảng viên',             // vai trò
        trang_thai: 'Hoạt động'
      })

      // cập nhật liên kết tài khoản vào GiangVien
      await pool.query('UPDATE GiangVien SET tai_khoan_id = ? WHERE id = ?', [accountId, item.id])
    } catch (err) {
      console.error('⚠️ Lỗi khi tạo tài khoản giảng viên:', err)
    }

    res.status(201).json(item)
  } catch (err) {
    console.error('createGiangVien error:', err)
    res.status(500).json({ message: 'Không thể tạo giảng viên' })
  }
}


export async function updateGiangVien(req, res) {
  try {
    const { id } = req.params
    const payload = req.body
    await GV.update(id, payload)
    const item = await GV.getById(id)
    res.json(item)
  } catch (err) {
    console.error('updateGiangVien error:', err)
    res.status(500).json({ message: 'Không thể cập nhật giảng viên' })
  }
}

export async function deleteGiangVien(req, res) {
  try {
    const { id } = req.params
    await GV.remove(id)
    res.status(204).end()
  } catch (err) {
    console.error('deleteGiangVien error:', err)
    res.status(500).json({ message: 'Không thể xoá giảng viên' })
  }
}