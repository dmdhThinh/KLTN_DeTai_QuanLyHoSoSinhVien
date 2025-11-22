import { pool } from '../config/db.js';

// 📊 Tính và lưu điểm trung bình vào bảng
export async function capNhatDiemTrungBinh(sinhVienId, hocKy, namHoc) {
  try {
    // 1. Tính điểm TB học kỳ
    const [diemHocKy] = await pool.execute(`
      SELECT 
        SUM(hp.so_tin_chi) as tong_tin_chi,
        ROUND(SUM(kq.diem_tong_ket * hp.so_tin_chi) / SUM(hp.so_tin_chi), 2) as diem_tb_hoc_ky,
        ROUND(SUM(kq.diem_thang_4 * hp.so_tin_chi) / SUM(hp.so_tin_chi), 2) as diem_tb_hoc_ky_thang4
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.hoc_ky = ?
        AND kq.nam_hoc = ?
        AND kq.diem_tong_ket IS NOT NULL
        AND kq.tinh_diem = 1
    `, [sinhVienId, hocKy, namHoc]);

    // 2. Tính điểm TB tích lũy (TÍCH LŨY TỪ ĐẦU ĐẾN HỌC KỲ HIỆN TẠI)
    // Tính tích lũy nghĩa là: tính TẤT CẢ môn từ đầu đến hết học kỳ này (theo thứ tự thời gian)
    const [diemTichLuy] = await pool.execute(`
      SELECT 
        SUM(hp.so_tin_chi) as tong_tin_chi_tich_luy,
        ROUND(SUM(kq.diem_tong_ket * hp.so_tin_chi) / SUM(hp.so_tin_chi), 2) as diem_tb_tich_luy,
        ROUND(SUM(kq.diem_thang_4 * hp.so_tin_chi) / SUM(hp.so_tin_chi), 2) as diem_tb_tich_luy_thang4
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.diem_tong_ket IS NOT NULL
        AND kq.dat = 'Đạt'
        AND kq.tinh_diem = 1
        AND (
          kq.nam_hoc < ? OR 
          (kq.nam_hoc = ? AND (
            kq.hoc_ky = ? OR
            (kq.hoc_ky = 'HK1' AND ? IN ('HK1', 'HK2', 'HK3')) OR
            (kq.hoc_ky = 'HK2' AND ? IN ('HK2', 'HK3'))
          ))
        )
    `, [sinhVienId, namHoc, namHoc, hocKy, hocKy, hocKy]);

    // 3. Tính tín chỉ đã có điểm tích lũy đến học kỳ hiện tại (bao gồm đạt và không đạt)
    const [tinChiDangKy] = await pool.execute(`
      SELECT COALESCE(SUM(hp.so_tin_chi), 0) as tong_tin_chi_dang_ky
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.diem_tong_ket IS NOT NULL
        AND kq.tinh_diem = 1
        AND (
          kq.nam_hoc < ? OR 
          (kq.nam_hoc = ? AND (
            kq.hoc_ky = ? OR
            (kq.hoc_ky = 'HK1' AND ? IN ('HK1', 'HK2', 'HK3')) OR
            (kq.hoc_ky = 'HK2' AND ? IN ('HK2', 'HK3'))
          ))
        )
    `, [sinhVienId, namHoc, namHoc, hocKy, hocKy, hocKy]);

    // 4. Tính tín chỉ đạt TRONG HỌC KỲ HIỆN TẠI (không tích lũy)
    const [tinChiDat] = await pool.execute(`
      SELECT COALESCE(SUM(hp.so_tin_chi), 0) as tong_tin_chi_dat
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.hoc_ky = ?
        AND kq.nam_hoc = ?
        AND kq.dat = 'Đạt'
        AND kq.tinh_diem = 1
    `, [sinhVienId, hocKy, namHoc]);

    // Tính TC nợ trong học kỳ hiện tại = TC có điểm trong HK - TC đạt trong HK
    const [tinChiHocKy] = await pool.execute(`
      SELECT COALESCE(SUM(hp.so_tin_chi), 0) as tong_tin_chi_hoc_ky
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.hoc_ky = ?
        AND kq.nam_hoc = ?
        AND kq.diem_tong_ket IS NOT NULL
        AND kq.tinh_diem = 1
    `, [sinhVienId, hocKy, namHoc]);

    const tongTinChiDangKy = tinChiDangKy[0]?.tong_tin_chi_dang_ky || 0;
    const tongTinChiDat = tinChiDat[0]?.tong_tin_chi_dat || 0;
    const tongTinChiHocKy = tinChiHocKy[0]?.tong_tin_chi_hoc_ky || 0;
    const tongTinChiNo = tongTinChiHocKy - tongTinChiDat; // Nợ = TC có điểm trong HK - TC đạt trong HK

    // 5. Xác định xếp loại học kỳ (dựa vào điểm TB học kỳ)
    const dtbHocKy = diemHocKy[0]?.diem_tb_hoc_ky || 0;
    let xepLoaiHocKy = 'Chưa xếp loại';
    if (dtbHocKy >= 8.5) xepLoaiHocKy = 'Giỏi';
    else if (dtbHocKy >= 8.0) xepLoaiHocKy = 'Khá giỏi';
    else if (dtbHocKy >= 7.0) xepLoaiHocKy = 'Khá';
    else if (dtbHocKy >= 6.5) xepLoaiHocKy = 'TB khá';
    else if (dtbHocKy >= 5.5) xepLoaiHocKy = 'TB';
    else if (dtbHocKy >= 5.0) xepLoaiHocKy = 'TB yếu';
    else if (dtbHocKy >= 4.0) xepLoaiHocKy = 'Yếu';
    else if (dtbHocKy > 0) xepLoaiHocKy = 'Kém';

    // 6. Xác định xếp loại tích lũy
    const dtbTichLuy = diemTichLuy[0]?.diem_tb_tich_luy || 0;
    let xepLoaiTichLuy = 'Chưa xếp loại';
    if (dtbTichLuy >= 8.5) xepLoaiTichLuy = 'Giỏi';
    else if (dtbTichLuy >= 8.0) xepLoaiTichLuy = 'Khá giỏi';
    else if (dtbTichLuy >= 7.0) xepLoaiTichLuy = 'Khá';
    else if (dtbTichLuy >= 6.5) xepLoaiTichLuy = 'TB khá';
    else if (dtbTichLuy >= 5.5) xepLoaiTichLuy = 'TB';
    else if (dtbTichLuy >= 5.0) xepLoaiTichLuy = 'TB yếu';
    else if (dtbTichLuy >= 4.0) xepLoaiTichLuy = 'Yếu';
    else if (dtbTichLuy > 0) xepLoaiTichLuy = 'Kém';

    // 7. Lưu hoặc cập nhật vào bảng DiemTrungBinh
    const [result] = await pool.execute(`
      INSERT INTO DiemTrungBinh (
        sinh_vien_id, hoc_ky, nam_hoc,
        diem_tb_hoc_ky, diem_tb_hoc_ky_thang4,
        diem_tb_tich_luy, diem_tb_tich_luy_thang4,
        tong_tin_chi_dang_ky, tong_tin_chi_tich_luy,
        tong_tin_chi_dat, tong_tin_chi_no,
        xep_loai_hoc_ky, xep_loai_tich_luy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_tb_hoc_ky = VALUES(diem_tb_hoc_ky),
        diem_tb_hoc_ky_thang4 = VALUES(diem_tb_hoc_ky_thang4),
        diem_tb_tich_luy = VALUES(diem_tb_tich_luy),
        diem_tb_tich_luy_thang4 = VALUES(diem_tb_tich_luy_thang4),
        tong_tin_chi_dang_ky = VALUES(tong_tin_chi_dang_ky),
        tong_tin_chi_tich_luy = VALUES(tong_tin_chi_tich_luy),
        tong_tin_chi_dat = VALUES(tong_tin_chi_dat),
        tong_tin_chi_no = VALUES(tong_tin_chi_no),
        xep_loai_hoc_ky = VALUES(xep_loai_hoc_ky),
        xep_loai_tich_luy = VALUES(xep_loai_tich_luy),
        ngay_cap_nhat = CURRENT_TIMESTAMP
    `, [
      sinhVienId, hocKy, namHoc,
      diemHocKy[0]?.diem_tb_hoc_ky || null,
      diemHocKy[0]?.diem_tb_hoc_ky_thang4 || null,
      diemTichLuy[0]?.diem_tb_tich_luy || null,
      diemTichLuy[0]?.diem_tb_tich_luy_thang4 || null,
      tongTinChiDangKy,
      diemTichLuy[0]?.tong_tin_chi_tich_luy || 0,
      tongTinChiDat,
      tongTinChiNo,
      xepLoaiHocKy,
      xepLoaiTichLuy
    ]);

    return result;
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật điểm trung bình:', err);
    throw err;
  }
}

// 📋 Lấy điểm trung bình của sinh viên theo học kỳ
export async function getDiemTrungBinhTheoHocKy(sinhVienId, hocKy, namHoc) {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM DiemTrungBinh
      WHERE sinh_vien_id = ?
        AND hoc_ky = ?
        AND nam_hoc = ?
    `, [sinhVienId, hocKy, namHoc]);
    
    return rows[0] || null;
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm TB theo học kỳ:', err);
    throw err;
  }
}

// 📋 Lấy tất cả điểm trung bình của sinh viên
export async function getDiemTrungBinhTheoSinhVien(sinhVienId) {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM DiemTrungBinh
      WHERE sinh_vien_id = ?
      ORDER BY nam_hoc ASC, hoc_ky ASC
    `, [sinhVienId]);
    
    return rows;
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm TB sinh viên:', err);
    throw err;
  }
}

// 📋 Lấy điểm TB tích lũy mới nhất
export async function getDiemTichLuyMoiNhat(sinhVienId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        diem_tb_tich_luy,
        diem_tb_tich_luy_thang4,
        tong_tin_chi_dang_ky,
        tong_tin_chi_tich_luy,
        tong_tin_chi_dat,
        tong_tin_chi_no,
        xep_loai_tich_luy
      FROM DiemTrungBinh
      WHERE sinh_vien_id = ?
      ORDER BY nam_hoc DESC, hoc_ky DESC
      LIMIT 1
    `, [sinhVienId]);
    
    return rows[0] || null;
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm tích lũy mới nhất:', err);
    throw err;
  }
}

// 🔄 Cập nhật điểm TB cho tất cả học kỳ của sinh viên
export async function capNhatTatCaDiemTrungBinh(sinhVienId) {
  try {
    // Lấy danh sách tất cả học kỳ mà sinh viên có điểm
    const [hocKyList] = await pool.execute(`
      SELECT DISTINCT hoc_ky, nam_hoc
      FROM KetQuaHocTap
      WHERE sinh_vien_id = ?
      ORDER BY nam_hoc ASC, hoc_ky ASC
    `, [sinhVienId]);

    // Cập nhật điểm cho từng học kỳ
    for (const { hoc_ky, nam_hoc } of hocKyList) {
      await capNhatDiemTrungBinh(sinhVienId, hoc_ky, nam_hoc);
    }

    return { success: true, soHocKyCapNhat: hocKyList.length };
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật tất cả điểm TB:', err);
    throw err;
  }
}

// ❌ Xóa điểm trung bình
export async function xoaDiemTrungBinh(id) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM DiemTrungBinh WHERE id = ?',
      [id]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi xóa điểm TB:', err);
    throw err;
  }
}
