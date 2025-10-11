// server/models/sinhvien.js
import { pool } from '../config/db.js'

// Lấy chi tiết SV theo id (giữ nguyên để FE đang dùng)
export async function getSinhVienDetailById(id) {
  const sql = `
    SELECT 
      sv.id,
      sv.ma_sv       AS maSv,
      sv.ho_ten      AS hoTen,
      sv.ngay_sinh   AS ngaySinh,
      sv.gioi_tinh   AS gioiTinh,
      sv.email,
      sv.so_dien_thoai,
      sv.dia_chi     AS diaChi,
      sv.anh_the     AS anhThe,
      sv.khoa_hoc    AS khoaHoc,
      k.ten_khoa     AS khoa,
      n.ten_nganh    AS nganh,
      l.ten_lop      AS lop
    FROM SinhVien sv
    LEFT JOIN Khoa  k ON k.id = sv.khoa_id
    LEFT JOIN Nganh n ON n.id = sv.nganh_id
    LEFT JOIN Lop   l ON l.id = sv.lop_id
    WHERE sv.id = :id
    LIMIT 1
  `
  const [rows] = await pool.execute(sql, { id })
  return rows[0] || null
}

// ====== Thêm mới dùng cho trang Admin ======
export async function isMaSvExists(maSv) {
  const [rows] = await pool.execute(
    'SELECT id FROM SinhVien WHERE ma_sv = :maSv LIMIT 1',
    { maSv }
  )
  return rows.length > 0
}

export async function createSinhVien(data) {
  // Chỉ chèn các cột phổ biến; cột khác để NULL
  const sql = `
    INSERT INTO SinhVien (
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, anh_the,
      khoa_hoc, khoa_id, nganh_id, lop_id, co_van_id, tai_khoan_id
    ) VALUES (
      :ma_sv, :ho_ten, :ngay_sinh, :gioi_tinh,
      :email, :so_dien_thoai, :dia_chi, :anh_the,
      :khoa_hoc, :khoa_id, :nganh_id, :lop_id, :co_van_id, NULL
    )
  `
  const params = {
    ma_sv: data.ma_sv,
    ho_ten: data.ho_ten,
    ngay_sinh: data.ngay_sinh,           // YYYY-MM-DD
    gioi_tinh: data.gioi_tinh ?? null,   // 'Nam' | 'Nữ' | null
    email: data.email ?? null,
    so_dien_thoai: data.so_dien_thoai ?? null,
    dia_chi: data.dia_chi ?? null,
    anh_the: data.anh_the ?? null,
    khoa_hoc: data.khoa_hoc ?? null,
    khoa_id: data.khoa_id ?? null,
    nganh_id: data.nganh_id ?? null,
    lop_id: data.lop_id ?? null,
    co_van_id: data.co_van_id ?? null
  }
  const [result] = await pool.execute(sql, params)
  return result.insertId
}
