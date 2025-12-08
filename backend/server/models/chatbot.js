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

// Lấy lịch học (chi tiết đầy đủ)
export async function getLichHoc(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hp.ten_hoc_phan,
      hp.ma_hoc_phan,
      lhp.ma_lop_hoc_phan,
      lhp.hoc_ky,
      lhp.nam_hoc,
      lh.thu,
      lh.ca,
      lh.tiet_bat_dau,
      lh.tiet_ket_thuc,
      lh.phong,
      lh.co_so,
      lh.loai,
      lh.ngay_hoc,
      gv.ho_ten AS ten_giang_vien
    FROM LichHoc lh
    JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
    JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
    LEFT JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
    JOIN DangKyHocPhan dkhp ON dkhp.lop_hoc_phan_id = lhp.id
    WHERE dkhp.sinh_vien_id = ? AND dkhp.trang_thai_dk = 'THANH_CONG'
      AND lh.loai IN ('lythuyet', 'thuchanh', 'tructuyen')
    ORDER BY lh.thu ASC, lh.ca ASC, lh.tiet_bat_dau ASC
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

// Lấy thông báo/tin tức (10 tin gần nhất)
export async function getThongBao(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      tb.id,
      tb.tieu_de,
      tb.noi_dung,
      tb.ngay_gui,
      CASE 
        WHEN td.da_doc = 'Đã đọc' THEN 'Đã đọc'
        ELSE 'Chưa đọc'
      END AS da_doc
    FROM ThongBao tb
    LEFT JOIN ThongBao_DaDoc td
      ON tb.id = td.thong_bao_id AND td.sinh_vien_id = ?
    ORDER BY tb.ngay_gui DESC
    LIMIT 10
    `,
    [sinhVienId]
  )
  return rows
}

// Lấy điểm rèn luyện (5 học kỳ gần nhất)
export async function getDiemRenLuyen(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hoc_ky,
      nam_hoc,
      so_diem,
      xep_loai
    FROM DiemRenLuyen
    WHERE sinh_vien_id = ?
    ORDER BY nam_hoc DESC, hoc_ky DESC
    LIMIT 5
    `,
    [sinhVienId]
  )
  return rows
}

// Lấy học bổng (5 học kỳ gần nhất)
export async function getHocBong(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hoc_ky,
      nam_hoc,
      loai_hoc_bong,
      diem_tb_hoc_ky,
      diem_ren_luyen,
      so_tien
    FROM HocBong
    WHERE sinh_vien_id = ?
    ORDER BY nam_hoc DESC, hoc_ky DESC
    LIMIT 5
    `,
    [sinhVienId]
  )
  return rows
}

// Lấy công nợ học phí (tổng hợp)
export async function getCongNoHocPhi(sinhVienId) {
  // Lấy tổng công nợ
  const [tongCongNo] = await pool.execute(
    `
    SELECT 
      COUNT(*) AS tong_so_hoc_phan,
      SUM(hp.so_tin_chi * 1000000) AS tong_tien,
      SUM(CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Đã nộp' 
        THEN hp.so_tin_chi * 1000000 
        ELSE 0 
      END) AS da_thanh_toan,
      SUM(CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') IN ('Chưa nộp', 'Quá hạn') 
        THEN hp.so_tin_chi * 1000000 
        ELSE 0 
      END) AS con_no,
      COUNT(CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
        THEN 1 
      END) AS so_hoc_phan_chua_nop,
      COUNT(CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Quá hạn' 
        THEN 1 
      END) AS so_hoc_phan_qua_han
    FROM DangKyHocPhan dk
    INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
    LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
    WHERE dk.sinh_vien_id = ?
      AND dk.trang_thai_dk = 'THANH_CONG'
    `,
    [sinhVienId]
  )

  // Lấy danh sách công nợ chưa nộp (10 môn gần nhất)
  const [danhSachCongNo] = await pool.execute(
    `
    SELECT 
      hp.ten_hoc_phan,
      hp.so_tin_chi,
      lhp.hoc_ky,
      lhp.nam_hoc,
      (hp.so_tin_chi * 1000000) AS so_tien,
      CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
             AND hocphi.han_nop < CURDATE() THEN 'Quá hạn'
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
             AND hocphi.han_nop IS NULL THEN 'Chưa nộp'
        ELSE COALESCE(hocphi.tinh_trang, 'Chưa nộp')
      END AS trang_thai,
      hocphi.han_nop
    FROM DangKyHocPhan dk
    INNER JOIN HocPhan hp ON dk.hoc_phan_id = hp.id
    LEFT JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
    LEFT JOIN HocPhi hocphi ON dk.id = hocphi.dang_ky_id
    WHERE dk.sinh_vien_id = ? 
      AND dk.trang_thai_dk = 'THANH_CONG'
      AND COALESCE(hocphi.tinh_trang, 'Chưa nộp') IN ('Chưa nộp', 'Quá hạn')
    ORDER BY 
      CASE 
        WHEN COALESCE(hocphi.tinh_trang, 'Chưa nộp') = 'Chưa nộp' 
             AND hocphi.han_nop < CURDATE() THEN 1
        ELSE 2
      END ASC,
      lhp.nam_hoc DESC, 
      lhp.hoc_ky DESC
    LIMIT 10
    `,
    [sinhVienId]
  )

  return {
    tongCongNo: tongCongNo[0] || null,
    danhSachCongNo
  }
}

// Lấy danh sách môn đã đăng ký theo học kỳ
export async function getMonDaDangKy(sinhVienId, hocKy, namHoc) {
  const [rows] = await pool.execute(
    `
    SELECT 
      hp.ten_hoc_phan,
      hp.ma_hoc_phan,
      lhp.ma_lop_hoc_phan,
      lhp.hoc_ky,
      lhp.nam_hoc,
      hp.so_tin_chi,
      d.trang_thai_dk
    FROM DangKyHocPhan d
    JOIN LopHocPhan lhp ON d.lop_hoc_phan_id = lhp.id
    JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
    WHERE d.sinh_vien_id = ?
      AND d.trang_thai_dk <> 'HUY'
      AND lhp.hoc_ky = ?
      AND lhp.nam_hoc = ?
    ORDER BY hp.ten_hoc_phan
    `,
    [sinhVienId, hocKy, namHoc]
  )
  return rows
}

// Lấy danh sách môn chưa đăng ký (theo chương trình khung) theo học kỳ
export async function getMonChuaDangKy(sinhVienId, hocKy, namHoc) {
  // Lấy thông tin ngành của sinh viên
  const [svRows] = await pool.execute(
    `SELECT nganh_id, khoa_hoc FROM SinhVien WHERE id = ?`,
    [sinhVienId]
  )
  const sv = svRows[0]
  if (!sv) return []

  // Tính học kỳ trong chương trình khung
  let targetHocKy = null
  if (sv.khoa_hoc && namHoc) {
    const kNum = parseInt(sv.khoa_hoc.replace(/\D/g, ''), 10) || 0
    if (kNum > 0) {
      const startYear = 2000 + kNum
      const currentYear = parseInt(namHoc.split('-')[0], 10) || 0
      if (currentYear >= startYear) {
        const yearDiff = currentYear - startYear
        let semesterIndex = 0
        if (hocKy === 'HK1') semesterIndex = yearDiff * 2 + 1
        else if (hocKy === 'HK2') semesterIndex = yearDiff * 2 + 2
        else if (hocKy === 'HK3') semesterIndex = yearDiff * 2 + 3
        if (semesterIndex > 0) {
          targetHocKy = `HK${semesterIndex}`
        }
      }
    }
  }
  const hocKyCtdt = targetHocKy || hocKy

  // Lấy danh sách học phần đã đăng ký THÀNH CÔNG
  const [registered] = await pool.execute(
    `SELECT DISTINCT lhp.hoc_phan_id
     FROM DangKyHocPhan d
     JOIN LopHocPhan lhp ON lhp.id = d.lop_hoc_phan_id
     WHERE d.sinh_vien_id = ? AND d.trang_thai_dk = 'THANH_CONG'`,
    [sinhVienId]
  )
  const registeredHPIds = registered.map(r => r.hoc_phan_id)

  // Lấy danh sách môn trong chương trình khung chưa đăng ký
  const [rows] = await pool.execute(
    `
    SELECT DISTINCT
      hp.id AS hoc_phan_id,
      hp.ma_hoc_phan,
      hp.ten_hoc_phan,
      hp.so_tin_chi,
      ctk.hoc_ky AS hoc_ky_ctdt,
      CASE WHEN MAX(ctk.loai_mon) = 'BAT_BUOC' OR MIN(ctk.loai_mon) = 'BAT_BUOC'
           THEN 'BAT_BUOC'
           ELSE MAX(ctk.loai_mon)
      END AS loai_mon
    FROM ChuongTrinhKhung ctk
    JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
    WHERE (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
      AND ctk.hoc_ky = ?
      AND hp.id NOT IN (${registeredHPIds.length > 0 ? registeredHPIds.map(() => '?').join(',') : 'NULL'})
    GROUP BY hp.id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi, ctk.hoc_ky
    ORDER BY hp.ten_hoc_phan
    `,
    [sv.nganh_id, hocKyCtdt, ...registeredHPIds]
  )

  return rows
}

// Lấy danh sách tất cả học kỳ mà sinh viên có dữ liệu
export async function getAllHocKy(sinhVienId) {
  const [rows] = await pool.execute(
    `
    SELECT DISTINCT 
      lhp.hoc_ky,
      lhp.nam_hoc
    FROM DangKyHocPhan d
    JOIN LopHocPhan lhp ON d.lop_hoc_phan_id = lhp.id
    WHERE d.sinh_vien_id = ?
      AND d.trang_thai_dk = 'THANH_CONG'
    UNION
    SELECT DISTINCT 
      dtb.hoc_ky,
      dtb.nam_hoc
    FROM DiemTrungBinh dtb
    WHERE dtb.sinh_vien_id = ?
    ORDER BY nam_hoc DESC, hoc_ky DESC
    `,
    [sinhVienId, sinhVienId]
  )
  return rows
}