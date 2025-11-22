import { pool } from '../config/db.js'

// Lấy danh sách môn KHÔNG ĐẠT (để học lại)
// Loại bỏ các môn đã đăng ký trong HỌC KỲ + NĂM HỌC đang xem
export async function getMonKhongDat(sinhVienId, hocKy, namHoc) {
  let query = `
    SELECT DISTINCT
      hp.id AS hoc_phan_id,
      hp.ma_hoc_phan,
      hp.ten_hoc_phan,
      hp.so_tin_chi,
      kq.diem_tong_ket,
      kq.diem_chu,
      kq.hoc_ky,
      kq.nam_hoc
    FROM KetQuaHocTap kq
    JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
    WHERE kq.sinh_vien_id = ?
      AND kq.dat = 'Không đạt'
      AND kq.diem_tong_ket < 4.0`
  
  const params = [sinhVienId]
  
  // Loại bỏ các môn đã đăng ký trong cùng HỌC KỲ + NĂM HỌC
  if (hocKy && namHoc) {
    query += `
      AND hp.id NOT IN (
        SELECT DISTINCT lhp.hoc_phan_id 
        FROM DangKyHocPhan dk
        JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
        WHERE dk.sinh_vien_id = ? 
          AND lhp.hoc_ky = ?
          AND lhp.nam_hoc = ?
      )`
    params.push(sinhVienId, hocKy, namHoc)
  }
  
  query += ` ORDER BY kq.nam_hoc DESC, kq.hoc_ky DESC`
  
  console.log('[HOC_LAI] Query:', query)
  console.log('[HOC_LAI] Params:', params)
  
  const [rows] = await pool.execute(query, params)
  console.log('[HOC_LAI] Môn không đạt:', rows.length)
  
  return rows
}

// Lấy danh sách môn ĐÃ ĐẠT (để học cải thiện)
// Loại bỏ các môn đã đăng ký trong HỌC KỲ + NĂM HỌC đang xem
export async function getMonDaDat(sinhVienId, hocKy, namHoc) {
  let query = `
    SELECT DISTINCT
      hp.id AS hoc_phan_id,
      hp.ma_hoc_phan,
      hp.ten_hoc_phan,
      hp.so_tin_chi,
      kq.diem_tong_ket,
      kq.diem_chu,
      kq.hoc_ky,
      kq.nam_hoc
    FROM KetQuaHocTap kq
    JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
    WHERE kq.sinh_vien_id = ?
      AND kq.dat = 'Đạt'
      AND kq.diem_tong_ket >= 4.0
      AND kq.diem_tong_ket < 8.5`
  
  const params = [sinhVienId]
  
  // Loại bỏ các môn đã đăng ký trong cùng HỌC KỲ + NĂM HỌC
  if (hocKy && namHoc) {
    query += `
      AND hp.id NOT IN (
        SELECT DISTINCT lhp.hoc_phan_id 
        FROM DangKyHocPhan dk
        JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
        WHERE dk.sinh_vien_id = ? 
          AND lhp.hoc_ky = ?
          AND lhp.nam_hoc = ?
      )`
    params.push(sinhVienId, hocKy, namHoc)
  }
  
  query += ` ORDER BY kq.nam_hoc DESC, kq.hoc_ky DESC`
  
  const [rows] = await pool.execute(query, params)
  return rows
}

// Kiểm tra môn có được phép học lại không
export async function kiemTraDuocHocLai(sinhVienId, hocPhanId) {
  const [rows] = await pool.execute(
    `
    SELECT COUNT(*) as count
    FROM KetQuaHocTap
    WHERE sinh_vien_id = ?
      AND hoc_phan_id = ?
      AND dat = 'Không đạt'
    `,
    [sinhVienId, hocPhanId]
  )
  return rows[0].count > 0
}

// Kiểm tra môn có được phép học cải thiện không
export async function kiemTraDuocCaiThien(sinhVienId, hocPhanId) {
  const [rows] = await pool.execute(
    `
    SELECT COUNT(*) as count
    FROM KetQuaHocTap
    WHERE sinh_vien_id = ?
      AND hoc_phan_id = ?
      AND dat = 'Đạt'
      AND diem_tong_ket < 8.5
    `,
    [sinhVienId, hocPhanId]
  )
  return rows[0].count > 0
}
