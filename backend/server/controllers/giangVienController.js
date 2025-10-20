import { pool } from '../config/db.js'
import { getGiangVienDetailById } from '../models/giangvien.js'

/** 🧩 Lấy danh sách giảng viên (ưu tiên tìm chính xác mã, nếu không có thì tìm gần đúng) */
export async function getAll(req, res) {
  try {
    const q = req.query.q ? req.query.q.trim() : ''
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    let rows = []
    let total = 0

    // ✅ Nếu có từ khóa tìm kiếm
    if (q) {
      // 1️⃣ Thử tìm chính xác theo mã GV
      const [exact] = await pool.query(
        `
        SELECT gv.id,
               gv.ma_gv AS maGv,
               gv.ho_ten AS hoTen,
               gv.email,
               gv.so_dien_thoai AS soDienThoai,
               gv.gioi_tinh AS gioiTinh,
               gv.ngay_sinh AS ngaySinh,
               gv.dia_chi AS diaChi,
               k.ten_khoa AS tenKhoa
        FROM GiangVien gv
        LEFT JOIN Khoa k ON k.id = gv.khoa_id
        WHERE gv.ma_gv = ?
        ORDER BY gv.ho_ten ASC
        `,
        [q]
      )

      if (exact.length > 0) {
        // ✅ Có kết quả chính xác → trả luôn
        rows = exact
        total = exact.length
      } else {
        // 2️⃣ Không có kết quả chính xác → tìm gần đúng theo mã hoặc họ tên
        const [likeRows] = await pool.query(
          `
          SELECT gv.id,
                 gv.ma_gv AS maGv,
                 gv.ho_ten AS hoTen,
                 gv.email,
                 gv.so_dien_thoai AS soDienThoai,
                 gv.gioi_tinh AS gioiTinh,
                 gv.ngay_sinh AS ngaySinh,
                 gv.dia_chi AS diaChi,
                 k.ten_khoa AS tenKhoa
          FROM GiangVien gv
          LEFT JOIN Khoa k ON k.id = gv.khoa_id
          WHERE gv.ma_gv LIKE ? OR gv.ho_ten LIKE ?
          ORDER BY gv.ho_ten ASC
          LIMIT ? OFFSET ?
          `,
          [`%${q}%`, `%${q}%`, limit, offset]
        )

        const [countRows] = await pool.query(
          `SELECT COUNT(*) AS total FROM GiangVien WHERE ma_gv LIKE ? OR ho_ten LIKE ?`,
          [`%${q}%`, `%${q}%`]
        )

        rows = likeRows
        total = countRows[0].total
      }
    } else {
      // 3️⃣ Không nhập từ khóa → trả tất cả
      const [allRows] = await pool.query(
        `
        SELECT gv.id,
               gv.ma_gv AS maGv,
               gv.ho_ten AS hoTen,
               gv.email,
               gv.so_dien_thoai AS soDienThoai,
               gv.gioi_tinh AS gioiTinh,
               gv.ngay_sinh AS ngaySinh,
               gv.dia_chi AS diaChi,
               k.ten_khoa AS tenKhoa
        FROM GiangVien gv
        LEFT JOIN Khoa k ON k.id = gv.khoa_id
        ORDER BY gv.ho_ten ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      )

      const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM GiangVien`)
      rows = allRows
      total = countRows[0].total
    }

    const totalPages = Math.ceil(total / limit)
    res.json({
      data: rows,
      pagination: { total, totalPages, page, limit },
    })
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách giảng viên' })
  }
}





/** 🧩 Lấy chi tiết 1 giảng viên */
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

/** 🧩 Thêm giảng viên mới */
export async function create(req, res) {
  try {
    const { maGv, hoTen, email, soDienThoai, gioiTinh, ngaySinh, diaChi, khoaId, nganhId, lopId } = req.body

    if (!maGv || !hoTen || !khoaId) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Mã GV, Họ tên và Khoa.' })
    }

    const [exists] = await pool.execute(`SELECT id FROM GiangVien WHERE ma_gv = ?`, [maGv])
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Mã giảng viên đã tồn tại.' })
    }

    await pool.execute(
      `INSERT INTO GiangVien (ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [maGv, hoTen, email, soDienThoai, gioiTinh, ngaySinh || null, diaChi, khoaId, nganhId || null, lopId || null]
    )

    res.json({ message: '✅ Thêm giảng viên thành công' })
  } catch (err) {
    console.error('❌ Lỗi khi thêm giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm giảng viên' })
  }
}


/** 🧩 Cập nhật thông tin giảng viên */
export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    const { maGv, hoTen, email, soDienThoai, gioiTinh, ngaySinh, diaChi, khoaId } = req.body
    if (!id) return res.status(400).json({ message: 'ID không hợp lệ' })

    const [check] = await pool.execute(`SELECT id FROM GiangVien WHERE id = ?`, [id])
    if (check.length === 0) return res.status(404).json({ message: 'Không tìm thấy giảng viên' })

    await pool.execute(
      `UPDATE GiangVien 
       SET ma_gv = ?, ho_ten = ?, email = ?, so_dien_thoai = ?, gioi_tinh = ?, ngay_sinh = ?, dia_chi = ?, khoa_id = ?
       WHERE id = ?`,
      [maGv, hoTen, email, soDienThoai, gioiTinh, ngaySinh || null, diaChi, khoaId, id]
    )

    res.json({ message: '✅ Cập nhật giảng viên thành công' })
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi cập nhật giảng viên' })
  }
}

/** 🧩 Xoá giảng viên */
export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ message: 'ID không hợp lệ' })

    const [check] = await pool.execute(`SELECT id FROM GiangVien WHERE id = ?`, [id])
    if (check.length === 0) return res.status(404).json({ message: 'Không tìm thấy giảng viên' })

    await pool.execute(`DELETE FROM GiangVien WHERE id = ?`, [id])
    res.json({ message: '✅ Xoá giảng viên thành công' })
  } catch (err) {
    console.error('❌ Lỗi khi xoá giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi xoá giảng viên' })
  }
}
