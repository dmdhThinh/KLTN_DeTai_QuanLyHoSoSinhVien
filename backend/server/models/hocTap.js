import { pool } from '../config/db.js'

/**
 * Lấy danh sách lớp học phần đã đăng ký của sinh viên
 * @param {number} sinhVienId - ID sinh viên
 * @param {number} hocKy - Học kỳ (optional)
 * @param {string} namHoc - Năm học (optional)
 * @returns {Array} Danh sách lớp học phần
 */
export async function getLopHocPhanDaDangKy(sinhVienId, hocKy, namHoc) {
  try {
    let query = `
      SELECT 
        lhp.id,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan AS tenHocPhan,
        hp.so_tin_chi AS soTinChi,
        lhp.hoc_ky AS hocKy,
        lhp.nam_hoc AS namHoc,
        dk.trang_thai_dk AS trangThaiDk
      FROM DangKyHocPhan dk
      JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      WHERE dk.sinh_vien_id = ?
        AND dk.trang_thai_dk = 'THANH_CONG'
    `
    
    const params = [sinhVienId]
    
    if (hocKy) {
      query += ` AND lhp.hoc_ky = ?`
      params.push(hocKy)
    }
    
    if (namHoc) {
      query += ` AND lhp.nam_hoc = ?`
      params.push(namHoc)
    }
    
    query += ` ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky DESC, hp.ten_hoc_phan ASC`
    
    const [rows] = await pool.execute(query, params)
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách lớp học phần đã đăng ký:', err)
    throw err
  }
}

/**
 * Lấy danh sách học kỳ - năm học mà sinh viên đã đăng ký
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Array} Danh sách học kỳ
 */
export async function getDanhSachHocKy(sinhVienId) {
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT 
         lhp.hoc_ky AS hocKy,
         lhp.nam_hoc AS namHoc
       FROM DangKyHocPhan dk
       JOIN LopHocPhan lhp ON dk.lop_hoc_phan_id = lhp.id
       WHERE dk.sinh_vien_id = ?
         AND dk.trang_thai_dk = 'THANH_CONG'
       ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky DESC`,
      [sinhVienId]
    )
    return rows
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách học kỳ:', err)
    throw err
  }
}

/**
 * Lấy tiến độ học tập của sinh viên
 * @param {number} sinhVienId - ID sinh viên
 * @returns {Object} { tongTinChi, tinChiHoanThanh }
 */
export async function getTienDoHocTap(sinhVienId) {
  try {
    // 1. Lấy thông tin sinh viên để biết ngành
    const [svRows] = await pool.execute(
      `SELECT nganh_id FROM SinhVien WHERE id = ?`,
      [sinhVienId]
    )

    if (!svRows.length) {
      throw new Error('Không tìm thấy sinh viên')
    }

    const nganhId = svRows[0].nganh_id

    // 2. Tính tổng tín chỉ BẮT BUỘC từ chương trình khung
    const [batBuocRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tongTinChiBatBuoc
       FROM ChuongTrinhKhung ctk
       JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
       WHERE ctk.nganh_id = ? AND ctk.loai_mon = 'BAT_BUOC'`,
      [nganhId]
    )

    const tongTinChiBatBuoc = Number(batBuocRows[0]?.tongTinChiBatBuoc || 0)

    // 3. Tính tổng tín chỉ TỰ CHỌN theo quy định từng học kỳ
    // Lấy danh sách học kỳ có trong chương trình khung
    const [hocKyRows] = await pool.execute(
      `SELECT DISTINCT ctk.hoc_ky 
       FROM ChuongTrinhKhung ctk
       WHERE ctk.nganh_id = ?
       ORDER BY ctk.hoc_ky`,
      [nganhId]
    )

    // Hàm tính TC tự chọn theo quy định từng học kỳ
    const getTcTuChonTheoHocKy = (hocKy) => {
      switch(hocKy) {
        case 'HK2':
        case 'HK3':
        case 'HK5':
        case 'HK6':
          return 3
        case 'HK4':
        case 'HK7':
          return 7
        case 'HK8':
          return 6
        default:
          // HK1 hoặc các học kỳ khác: tính từ dữ liệu
          return null
      }
    }

    let tongTcTuChon = 0

    // Tính TC tự chọn cho HK1 (từ dữ liệu)
    const [hk1TuChonRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tongTcTuChonHK1
       FROM ChuongTrinhKhung ctk
       JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
       WHERE ctk.nganh_id = ? 
         AND ctk.hoc_ky = 'HK1' 
         AND ctk.loai_mon = 'TU_CHON'`,
      [nganhId]
    )
    const tcTuChonHK1 = Number(hk1TuChonRows[0]?.tongTcTuChonHK1 || 0)
    tongTcTuChon += tcTuChonHK1

    // Tính TC tự chọn cho các học kỳ khác (theo quy định)
    for (const row of hocKyRows) {
      const hocKy = row.hoc_ky
      if (hocKy !== 'HK1') {
        const tcTuChon = getTcTuChonTheoHocKy(hocKy)
        if (tcTuChon !== null) {
          tongTcTuChon += tcTuChon
        }
      }
    }

    // 4. Tổng tín chỉ = TC bắt buộc + TC tự chọn (theo quy định)
    const tongTinChi = tongTinChiBatBuoc + tongTcTuChon

    // 5. Tính tổng tín chỉ đã hoàn thành (môn đạt: điểm >= 4.0)
    const [hoanThanhRows] = await pool.execute(
      `SELECT SUM(hp.so_tin_chi) as tinChiHoanThanh
       FROM KetQuaHocTap kq
       JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
       WHERE kq.sinh_vien_id = ? 
         AND kq.diem_tong_ket >= 4.0
         AND kq.dat = TRUE`,
      [sinhVienId]
    )

    const tinChiHoanThanh = Number(hoanThanhRows[0]?.tinChiHoanThanh || 0)

    return {
      tongTinChi: tongTinChi,
      tinChiHoanThanh: tinChiHoanThanh
    }
  } catch (err) {
    console.error('❌ Lỗi khi lấy tiến độ học tập:', err)
    throw err
  }
}
