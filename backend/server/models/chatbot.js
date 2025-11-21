import { pool } from '../config/db.js'

// Lấy thông tin sinh viên
export async function getSinhVienInfo(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      sv.id, sv.ma_sv, sv.ho_ten,
      l.ten_lop,
      n.ten_nganh,
      k.ten_khoa
    FROM SinhVien sv
    LEFT JOIN Lop l ON sv.lop_id = l.id
    LEFT JOIN Nganh n ON l.nganh_id = n.id
    LEFT JOIN Khoa k ON n.khoa_id = k.id
    WHERE sv.id = ?
    `,
    [sinhVienId]
  )
  return rows[0] || null
}

// Lấy điểm các môn (30 môn gần nhất)
export async function getDiemMon(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hp.ten_hoc_phan,
      hp.so_tin_chi,
      kqht.diem_ly_thuyet_1,
      kqht.diem_ly_thuyet_2,
      kqht.diem_ly_thuyet_3,
      kqht.diem_ly_thuyet_4,
      kqht.diem_thuc_hanh_1,
      kqht.diem_thuc_hanh_2,
      kqht.diem_thuc_hanh_3,
      kqht.diem_giua_ky,
      kqht.diem_cuoi_ky,
      kqht.diem_tong_ket,
      kqht.diem_chu,
      kqht.hoc_ky,
      kqht.nam_hoc,
      kqht.dat
    FROM KetQuaHocTap kqht
    JOIN HocPhan hp ON kqht.hoc_phan_id = hp.id
    WHERE kqht.sinh_vien_id = ?
    ORDER BY kqht.nam_hoc DESC, kqht.hoc_ky DESC
    LIMIT 30
    `,
    [sinhVienId]
  )
  return rows
}

// Lấy lịch học
export async function getLichHoc(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hp.ten_hoc_phan,
      lh.thu,
      lh.ca,
      lh.phong,
      gv.ho_ten AS ten_giang_vien
    FROM LichHoc lh
    JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
    JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
    LEFT JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
    JOIN DangKyHocPhan dkhp ON dkhp.lop_hoc_phan_id = lhp.id
    WHERE dkhp.sinh_vien_id = ? AND dkhp.trang_thai_dk = 'THANH_CONG'
    LIMIT 10
    `,
    [sinhVienId]
  )
  return rows
}

// Lấy điểm trung bình
export async function getDiemTrungBinh(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hoc_ky,
      nam_hoc,
      diem_tb_hoc_ky,
      diem_tb_hoc_ky_thang4,
      diem_tb_tich_luy,
      diem_tb_tich_luy_thang4,
      tong_tin_chi_tich_luy,
      tong_tin_chi_no,
      xep_loai_hoc_ky,
      xep_loai_tich_luy
    FROM DiemTrungBinh
    WHERE sinh_vien_id = ?
    ORDER BY nam_hoc DESC, hoc_ky DESC
    LIMIT 5
    `,
    [sinhVienId]
  )
  return rows
}
