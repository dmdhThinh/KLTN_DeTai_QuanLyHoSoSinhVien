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
        COALESCE(kq.dat, 'Chưa đạt') AS dat
      FROM ChuongTrinhKhung ctk
      JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
      LEFT JOIN KetQuaHocTap kq ON hp.id = kq.hoc_phan_id 
        AND kq.sinh_vien_id = ? 
        AND kq.hoc_ky = ?
     
        WHERE ctk.hoc_ky = ? 
          AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
      ORDER BY ctk.id
    `, [sinh_vien_id, hoc_ky, hoc_ky, nganh_id])

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