// server/models/giangvien.js
import { pool } from '../config/db.js'

export async function getAll({ q = '', page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit
  const params = []
  let where = 'WHERE 1=1'

  if (q) {
    where += ' AND (gv.ma_gv LIKE ? OR gv.ho_ten LIKE ?)'
    params.push(`%${q}%`, `%${q}%`)
  }

  const [rows] = await pool.query(
    `
    SELECT
      gv.id,
      gv.ma_gv        AS maGv,
      gv.ho_ten       AS hoTen,
      gv.email        AS email,
      gv.so_dien_thoai AS soDienThoai,
      gv.gioi_tinh    AS gioiTinh,
      gv.ngay_sinh    AS ngaySinh,
      gv.dia_chi      AS diaChi,
      gv.khoa_id      AS khoaId,
      gv.nganh_id     AS nganhId,
      gv.lop_id       AS lopId,
      gv.chuc_vu      AS chucVu,
      gv.anh_the      AS anhThe,
      k.ten_khoa      AS tenKhoa,
      n.ten_nganh     AS tenNganh,
      l.ten_lop       AS tenLop
    FROM GiangVien gv
    LEFT JOIN Khoa  k ON gv.khoa_id  = k.id
    LEFT JOIN Nganh n ON gv.nganh_id = n.id
    LEFT JOIN Lop   l ON gv.lop_id   = l.id
    ${where}
    ORDER BY gv.id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, Number(limit), Number(offset)]
  )

  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM GiangVien gv
    ${where}
    `,
    params
  )

  return {
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  }
}

export async function getById(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      gv.id,
      gv.ma_gv AS maGv,
      gv.ho_ten AS hoTen,
      gv.email,
      gv.so_dien_thoai AS soDienThoai,
      gv.gioi_tinh AS gioiTinh,
      DATE_FORMAT(gv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
      gv.dia_chi AS diaChi,
      gv.khoa_id AS khoaId,
      gv.nganh_id AS nganhId,
      gv.lop_id AS lopId,
      gv.chuc_vu AS chucVu,
      gv.anh_the AS anhThe,
      k.ten_khoa AS tenKhoa,
      n.ten_nganh AS tenNganh,
      l.ten_lop AS tenLop
    FROM GiangVien gv
    LEFT JOIN Khoa k ON gv.khoa_id = k.id
    LEFT JOIN Nganh n ON gv.nganh_id = n.id
    LEFT JOIN Lop l ON gv.lop_id = l.id
    WHERE gv.id = ?
    `,
    [id]
  )
  return rows[0]
}



export async function create(data) {
  const {
    ma_gv, ho_ten, email, so_dien_thoai,
    gioi_tinh, ngay_sinh, dia_chi,
    khoa_id, nganh_id, lop_id, chuc_vu,
    hoc_vi, // 🆕 thêm học vị
    anh_the
  } = data

  const [result] = await pool.query(
    `INSERT INTO GiangVien 
      (ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id, chuc_vu, hoc_vi, anh_the)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id, chuc_vu, hoc_vi, anh_the]
  )
  return { id: result.insertId }
}


export async function update(id, data) {
  const {
    ma_gv, ho_ten, email, so_dien_thoai,
    gioi_tinh, ngay_sinh, dia_chi,
    khoa_id, nganh_id, lop_id, chuc_vu,
    hoc_vi, // 🆕
    anh_the
  } = data

  await pool.query(
    `UPDATE GiangVien SET 
      ma_gv=?, ho_ten=?, email=?, so_dien_thoai=?, gioi_tinh=?, ngay_sinh=?, 
      dia_chi=?, khoa_id=?, nganh_id=?, lop_id=?, chuc_vu=?, hoc_vi=?, anh_the=?
     WHERE id=?`,
    [ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id, chuc_vu, hoc_vi, anh_the, id]
  )
}


export async function remove(id) {
  await pool.query('DELETE FROM GiangVien WHERE id = ?', [id])
}