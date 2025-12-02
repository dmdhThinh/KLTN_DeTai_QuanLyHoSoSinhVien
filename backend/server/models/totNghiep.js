import { pool } from '../config/db.js';

/**
 * Kiểm tra điều kiện tốt nghiệp của sinh viên
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Object} Kết quả kiểm tra điều kiện tốt nghiệp
 */
export async function kiemTraDieuKienTotNghiep(sinhVienId) {
  try {
    // 1. Lấy thông tin sinh viên
    const [svRows] = await pool.execute(
      `SELECT nganh_id FROM SinhVien WHERE id = ?`,
      [sinhVienId]
    );

    if (!svRows.length) {
      throw new Error('Không tìm thấy sinh viên');
    }

    const nganhId = svRows[0].nganh_id;

    // 2. Tính tổng tín chỉ từ chương trình khung (chỉ tính môn bắt buộc)
    const [tongRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tongTinChiBatBuoc
       FROM ChuongTrinhKhung ctk
       JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
       WHERE ctk.nganh_id = ? AND ctk.loai_mon = 'BAT_BUOC'`,
      [nganhId]
    );

    const tongTinChiBatBuoc = tongRows[0]?.tongTinChiBatBuoc || 0;

    // 3. Tính tổng tín chỉ đã hoàn thành (môn đạt: điểm >= 4.0 và dat = 'Đạt')
    const [hoanThanhRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tinChiHoanThanh
       FROM KetQuaHocTap kq
       JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
       WHERE kq.sinh_vien_id = ? 
         AND kq.diem_tong_ket >= 4.0
         AND (kq.dat = 'Đạt' OR kq.dat = 1)`,
      [sinhVienId]
    );

    const tinChiHoanThanh = hoanThanhRows[0]?.tinChiHoanThanh || 0;

    // 4. Tính tổng tín chỉ nợ (môn không đạt)
    const [noRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tongTinChiNo
       FROM KetQuaHocTap kq
       JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
       WHERE kq.sinh_vien_id = ? 
         AND kq.dat = 'Không đạt'`,
      [sinhVienId]
    );

    const tongTinChiNo = noRows[0]?.tongTinChiNo || 0;

    // 5. Lấy điểm TB tích lũy mới nhất
    const [dtbRows] = await pool.execute(
      `SELECT diem_tb_tich_luy, tong_tin_chi_dat, tong_tin_chi_no
       FROM DiemTrungBinh
       WHERE sinh_vien_id = ?
       ORDER BY nam_hoc DESC, hoc_ky DESC
       LIMIT 1`,
      [sinhVienId]
    );

    const diemTBTichLuy = dtbRows[0]?.diem_tb_tich_luy || 0;
    const tongTinChiDat = dtbRows[0]?.tong_tin_chi_dat || 0;
    const tongTinChiNoFromDTB = dtbRows[0]?.tong_tin_chi_no || 0;

    // 6. Kiểm tra đã hoàn thành khóa luận tốt nghiệp chưa (môn có mã chứa "Khóa luận" hoặc "Thực tập")
    const [khoaLuanRows] = await pool.execute(
      `SELECT COUNT(*) as soMonKhoaLuan
       FROM KetQuaHocTap kq
       JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
       WHERE kq.sinh_vien_id = ?
         AND (hp.ten_hoc_phan LIKE '%Khóa luận%' OR hp.ten_hoc_phan LIKE '%Thực tập%')
         AND (kq.dat = 'Đạt' OR kq.dat = 1)`,
      [sinhVienId]
    );

    const soMonKhoaLuan = khoaLuanRows[0]?.soMonKhoaLuan || 0;

    // 7. Điều kiện tốt nghiệp:
    // - Đã hoàn thành >= 90% tổng tín chỉ bắt buộc (hoặc >= tổng tín chỉ bắt buộc)
    // - Điểm TB tích lũy >= 5.0
    // - Không còn môn nợ (hoặc chỉ còn <= 10% tổng tín chỉ nợ)
    // - Đã hoàn thành khóa luận/thực tập (nếu có trong chương trình)

    const tyLeHoanThanh = tongTinChiBatBuoc > 0 
      ? (tinChiHoanThanh / tongTinChiBatBuoc) * 100 
      : 0;

    const duDieuKien = 
      tyLeHoanThanh >= 90 && // Hoàn thành >= 90% tín chỉ bắt buộc
      diemTBTichLuy >= 5.0 && // Điểm TB tích lũy >= 5.0
      tongTinChiNoFromDTB <= (tongTinChiBatBuoc * 0.1); // Nợ <= 10% tổng tín chỉ

    return {
      sinh_vien_id: sinhVienId,
      tongTinChiBatBuoc: Number(tongTinChiBatBuoc),
      tinChiHoanThanh: Number(tinChiHoanThanh),
      tyLeHoanThanh: Number(tyLeHoanThanh.toFixed(2)),
      tongTinChiNo: Number(tongTinChiNoFromDTB),
      diemTBTichLuy: Number(diemTBTichLuy),
      tongTinChiDat: Number(tongTinChiDat),
      soMonKhoaLuan: Number(soMonKhoaLuan),
      duDieuKien: duDieuKien,
      lyDo: duDieuKien 
        ? 'Đủ điều kiện tốt nghiệp'
        : `Chưa đủ điều kiện: ${tyLeHoanThanh < 90 ? `Hoàn thành ${tyLeHoanThanh.toFixed(2)}% (cần >= 90%)` : ''} ${diemTBTichLuy < 5.0 ? `Điểm TB: ${diemTBTichLuy} (cần >= 5.0)` : ''} ${tongTinChiNoFromDTB > (tongTinChiBatBuoc * 0.1) ? `Còn nợ ${tongTinChiNoFromDTB} tín chỉ` : ''}`.trim()
    };
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra điều kiện tốt nghiệp:', err);
    throw err;
  }
}

/**
 * Tạo hồ sơ tốt nghiệp cho sinh viên
 * @param {number} sinhVienId - ID sinh viên
 * @param {number} dotXetId - ID đợt xét
 * @returns {Object} Kết quả tạo hồ sơ
 */
export async function taoHoSoTotNghiep(sinhVienId, dotXetId) {
  try {
    // Kiểm tra điều kiện tốt nghiệp
    const dieuKien = await kiemTraDieuKienTotNghiep(sinhVienId);

    // Xác định trạng thái
    let trangThai = 'CHO_DUYET';
    if (dieuKien.duDieuKien) {
      trangThai = 'DU_DIEU_KIEN';
    } else {
      trangThai = 'KHONG_DU_DIEU_KIEN';
    }

    // Tạo hoặc cập nhật hồ sơ tốt nghiệp
    const [result] = await pool.execute(
      `INSERT INTO HoSoTotNghiep (
        sinh_vien_id, dot_xet_id, trang_thai, ly_do_tu_choi, ket_qua_xet_duyet
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        trang_thai = VALUES(trang_thai),
        ly_do_tu_choi = VALUES(ly_do_tu_choi),
        ket_qua_xet_duyet = VALUES(ket_qua_xet_duyet),
        updated_at = CURRENT_TIMESTAMP`,
      [
        sinhVienId,
        dotXetId,
        trangThai,
        dieuKien.duDieuKien ? null : dieuKien.lyDo,
        JSON.stringify(dieuKien)
      ]
    );

    return {
      success: true,
      insertId: result.insertId,
      dieuKien,
      trangThai
    };
  } catch (err) {
    console.error('❌ Lỗi khi tạo hồ sơ tốt nghiệp:', err);
    throw err;
  }
}

/**
 * Xét tốt nghiệp cho sinh viên (chuyển trạng thái thành DA_TOT_NGHIEP)
 * @param {number} hoSoId - ID hồ sơ tốt nghiệp
 * @returns {Object} Kết quả xét tốt nghiệp
 */
export async function xetTotNghiep(hoSoId) {
  try {
    const [result] = await pool.execute(
      `UPDATE HoSoTotNghiep 
       SET trang_thai = 'DA_TOT_NGHIEP', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND trang_thai = 'DU_DIEU_KIEN'`,
      [hoSoId]
    );

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows
    };
  } catch (err) {
    console.error('❌ Lỗi khi xét tốt nghiệp:', err);
    throw err;
  }
}

/**
 * Lấy danh sách hồ sơ tốt nghiệp theo đợt xét
 * @param {number} dotXetId - ID đợt xét
 * @returns {Array} Danh sách hồ sơ tốt nghiệp
 */
export async function getHoSoTotNghiepTheoDot(dotXetId) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        hstn.id,
        hstn.sinh_vien_id,
        sv.ma_sv,
        sv.ho_ten,
        hstn.trang_thai,
        hstn.ngay_dang_ky,
        hstn.ket_qua_xet_duyet,
        hstn.ly_do_tu_choi
       FROM HoSoTotNghiep hstn
       JOIN SinhVien sv ON hstn.sinh_vien_id = sv.id
       WHERE hstn.dot_xet_id = ?
       ORDER BY hstn.ngay_dang_ky DESC`,
      [dotXetId]
    );

    return rows;
  } catch (err) {
    console.error('❌ Lỗi khi lấy hồ sơ tốt nghiệp:', err);
    throw err;
  }
}

