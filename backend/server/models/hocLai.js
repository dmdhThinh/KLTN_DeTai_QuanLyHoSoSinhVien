import { pool } from '../config/db.js'

// Lấy danh sách môn KHÔNG ĐẠT (để học lại)
// Học lại: Hiển thị TẤT CẢ môn không đạt (bất kỳ học kỳ nào)
// CHỈ loại bỏ các môn đang đăng ký ở kỳ HIỆN TẠI (để tránh đăng ký trùng lớp)
// Lưu ý: Môn rớt có thể có điểm >= 4.0 nhưng vẫn rớt do quy tắc bắt buộc (GK < 1 hoặc CK < 3)
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
      AND kq.dat = 'Không đạt'`
  
  const params = [sinhVienId]
  
  // BỎ filter theo học kỳ - cho phép học lại môn rớt ở BẤT KỲ HỌC KỲ NÀO
  // (Sinh viên có thể học lại môn rớt ở HK1 trong HK2, hoặc bất kỳ học kỳ nào)
  
  // CHỈ loại bỏ các môn đang đăng ký ở kỳ HIỆN TẠI (để tránh đăng ký trùng lớp)
  if (hocKy && namHoc) {
    query += `
      AND hp.id NOT IN (
        SELECT DISTINCT lhp.hoc_phan_id 
        FROM DangKyHocPhan dk
        JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
        WHERE dk.sinh_vien_id = ? 
          AND lhp.hoc_ky = ?
          AND lhp.nam_hoc = ?
          AND dk.trang_thai_dk <> 'HUY'
      )`
    params.push(sinhVienId, hocKy, namHoc)
  }
  
  query += ` ORDER BY kq.nam_hoc DESC, kq.hoc_ky DESC`
  
  const [rows] = await pool.execute(query, params)
  
  return rows
}

// Lấy danh sách môn ĐÃ ĐẠT (để học cải thiện)
// Học cải thiện: Hiển thị TẤT CẢ môn đã đạt (4.0 <= điểm < 8.5)
// CHỈ loại bỏ các môn đang đăng ký ở kỳ HIỆN TẠI (để tránh đăng ký trùng lớp)
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
  
  // BỎ filter theo học kỳ - cho phép cải thiện môn của BẤT KỲ HỌC KỲ NÀO
  // (Sinh viên có thể cải thiện môn HK1 trong HK2, hoặc bất kỳ học kỳ nào)
  
  // CHỈ loại bỏ các môn đang đăng ký ở kỳ HIỆN TẠI (để tránh đăng ký trùng lớp)
  if (hocKy && namHoc) {
    query += `
      AND hp.id NOT IN (
        SELECT DISTINCT lhp.hoc_phan_id 
        FROM DangKyHocPhan dk
        JOIN LopHocPhan lhp ON lhp.id = dk.lop_hoc_phan_id
        WHERE dk.sinh_vien_id = ? 
          AND lhp.hoc_ky = ?
          AND lhp.nam_hoc = ?
          AND dk.trang_thai_dk <> 'HUY'
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
