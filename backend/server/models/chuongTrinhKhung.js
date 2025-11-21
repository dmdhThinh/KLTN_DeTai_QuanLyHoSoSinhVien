// models/chuongTrinhKhung.js
import { pool } from '../config/db.js'

export async function getChuongTrinhKhung({ hoc_ky, nganh_id, sinh_vien_id = null }) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        hp.ma_hoc_phan AS ma_mon_hoc,
        hp.ten_hoc_phan AS ten_mon_hoc,
        hp.ma_hoc_phan AS ma_hoc_phan,
        CASE ctk.loai_hoc_phan
          WHEN 'a' THEN 'học trước (a)'
          WHEN 'b' THEN 'tiền quyết (b)'
          WHEN 'c' THEN 'song hành (c)'
        END AS hoc_phan_loai,
        hp.so_tin_chi AS so_tc_dvht,
        ctk.so_tiet_lt,
        ctk.so_tiet_th,
        COALESCE(kq.dat, 'Chưa đạt') AS dat,
        -- Thêm: Check đã ĐKHP chưa
        CASE WHEN dkhp.id IS NOT NULL THEN 1 ELSE 0 END AS da_dkhp,
        -- Thêm: Điểm tổng kết
        kq.diem_tong_ket,
        -- Thêm: Loại môn (bắt buộc/tự chọn)
        ctk.loai_mon
      FROM ChuongTrinhKhung ctk
      JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
      -- LEFT JOIN để check sinh viên đã ĐKHP chưa
      LEFT JOIN DangKyHocPhan dkhp 
        ON dkhp.hoc_phan_id = hp.id 
        AND dkhp.sinh_vien_id = ?
        AND dkhp.trang_thai_dk = 'THANH_CONG'
      -- LEFT JOIN để lấy điểm
      LEFT JOIN KetQuaHocTap kq 
        ON kq.hoc_phan_id = hp.id 
        AND kq.sinh_vien_id = ?
      WHERE ctk.hoc_ky = ? 
        AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
      ORDER BY ctk.id
    `, [sinh_vien_id, sinh_vien_id, hoc_ky, nganh_id])

    const [total] = await pool.execute(`
  SELECT SUM(hp.so_tin_chi) AS tong_tc
  FROM ChuongTrinhKhung ctk
  JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
  WHERE ctk.hoc_ky = ? 
    AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
`, [hoc_ky, nganh_id])

    return {
      hoc_ky,
      tong_tc: total[0].tong_tc || 0,
      danh_sach: rows
    }
  } catch (err) {
    console.error('Error fetching ChuongTrinhKhung:', err)
    throw err
  }
}