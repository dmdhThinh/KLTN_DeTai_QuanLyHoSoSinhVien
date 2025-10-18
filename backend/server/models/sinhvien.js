// server/models/sinhvien.js
import { pool } from '../config/db.js'

// Lấy chi tiết sinh viên theo ID
export const getSinhVienDetailById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT sv.id, sv.ma_sv AS maSv, sv.ho_ten AS hoTen, sv.ngay_sinh AS ngaySinh,
           sv.gioi_tinh AS gioiTinh, sv.email, sv.so_dien_thoai AS soDienThoai,
           sv.dia_chi AS diaChi, sv.khoa_hoc AS khoaHoc, sv.lop_id AS lopId
    FROM SinhVien sv
    WHERE sv.id = ?
    `,
    [id]
  )
  return rows && rows[0] ? rows[0] : null
}

// Kiểm tra mã sinh viên trùng
export const isMaSvExists = async (maSv) => {
  const [rows] = await pool.query(
    `SELECT id FROM SinhVien WHERE ma_sv = ? LIMIT 1`,
    [maSv]
  )
  return !!(rows && rows.length)
}

// Tạo sinh viên mới
// export const createSinhVien = async (data) => {
//   const {
//     ma_sv, ho_ten, ngay_sinh, gioi_tinh,
//     email, so_dien_thoai, dia_chi, khoa_hoc,
//     lop_id
//   } = data

//   const [rs] = await pool.query(
//     `INSERT INTO SinhVien
//      (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, lop_id)
//      VALUES (?,?,?,?,?,?,?,?,?)`,
//     [
//       ma_sv,
//       ho_ten,
//       ngay_sinh,
//       gioi_tinh || null,
//       email || null,
//       so_dien_thoai || null,
//       dia_chi || null,
//       khoa_hoc || null,
//       lop_id || null
//     ]
//   )
//   return rs.insertId
// }

export const createSinhVien = async (data) => {
  const {
    ma_sv, ho_ten, ngay_sinh, gioi_tinh,
    email, so_dien_thoai, dia_chi, khoa_hoc,
    lop_id, anh_the
  } = data

  const [rs] = await pool.query(
    `INSERT INTO SinhVien
     (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, lop_id, anh_the)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      ma_sv, ho_ten, ngay_sinh, gioi_tinh || null,
      email || null, so_dien_thoai || null,
      dia_chi || null, khoa_hoc || null,
      lop_id || null, anh_the || null
    ]
  )
  return rs.insertId
}

// Cập nhật sinh viên
export const updateSinhVien = async (id, data) => {
  const fields = []
  const vals = []

  const map = {
    ma_sv: 'ma_sv',
    ho_ten: 'ho_ten',
    ngay_sinh: 'ngay_sinh',
    gioi_tinh: 'gioi_tinh',
    email: 'email',
    so_dien_thoai: 'so_dien_thoai',
    dia_chi: 'dia_chi',
    khoa_hoc: 'khoa_hoc',
    lop_id: 'lop_id'
  }

  Object.entries(map).forEach(([k, col]) => {
    if (data[k] !== undefined) {
      fields.push(`${col} = ?`)
      vals.push(data[k] || null)
    }
  })

  if (!fields.length) return

  vals.push(id)
  await pool.query(`UPDATE SinhVien SET ${fields.join(', ')} WHERE id = ?`, vals)
}
