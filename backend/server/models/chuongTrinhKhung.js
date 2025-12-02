// models/chuongTrinhKhung.js
import { pool } from '../config/db.js'

function getTenHocKy(hocKy) {
  if (!hocKy) return ''
  const match = hocKy.match(/HK(\d+)/i)
  if (match) {
    const num = parseInt(match[1])
    const nam = Math.ceil(num / 2)
    const ky = num % 2 === 0 ? 2 : 1
    return `Năm ${nam} - Học kỳ ${ky}`
  }
  return hocKy
}

export async function getChuongTrinhKhung({ hoc_ky, nganh_id, sinh_vien_id = null }) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        hp.ma_hoc_phan AS ma_mon_hoc,
        hp.ten_hoc_phan AS ten_mon_hoc,
        hp.ma_hoc_phan AS ma_hoc_phan,
        CASE MAX(ctk.loai_hoc_phan)
          WHEN 'a' THEN 'học trước (a)'
          WHEN 'b' THEN 'tiền quyết (b)'
          WHEN 'c' THEN 'song hành (c)'
        END AS hoc_phan_loai,
        hp.so_tin_chi AS so_tc_dvht,
        MAX(ctk.so_tiet_lt) AS so_tiet_lt,
        MAX(ctk.so_tiet_th) AS so_tiet_th,
        COALESCE(MAX(kq.dat), 'Chưa đạt') AS dat,
        -- Thêm: Check đã ĐKHP chưa
        CASE WHEN MAX(dkhp.id) IS NOT NULL THEN 1 ELSE 0 END AS da_dkhp,
        -- Thêm: Điểm tổng kết
        MAX(kq.diem_tong_ket) AS diem_tong_ket,
        -- Thêm: Loại môn (bắt buộc/tự chọn) - Ưu tiên BAT_BUOC nếu có cả 2
        CASE WHEN MAX(ctk.loai_mon) = 'BAT_BUOC' OR MIN(ctk.loai_mon) = 'BAT_BUOC' 
             THEN 'BAT_BUOC' 
             ELSE MAX(ctk.loai_mon) 
        END AS loai_mon
      FROM ChuongTrinhKhung ctk
      JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
      -- LEFT JOIN để check sinh viên đã ĐKHP chưa (lấy bất kỳ)
      LEFT JOIN (
        SELECT DISTINCT hoc_phan_id, sinh_vien_id, id
        FROM DangKyHocPhan
        WHERE trang_thai_dk = 'THANH_CONG'
      ) dkhp 
        ON dkhp.hoc_phan_id = hp.id 
        AND dkhp.sinh_vien_id = ?
      -- LEFT JOIN để lấy điểm MỚI NHẤT (theo nam_hoc, hoc_ky, id giảm dần)
      LEFT JOIN (
        SELECT kq1.*
        FROM KetQuaHocTap kq1
        INNER JOIN (
          SELECT hoc_phan_id, sinh_vien_id, MAX(id) as max_id
          FROM KetQuaHocTap
          GROUP BY hoc_phan_id, sinh_vien_id
        ) kq2 ON kq1.hoc_phan_id = kq2.hoc_phan_id 
             AND kq1.sinh_vien_id = kq2.sinh_vien_id 
             AND kq1.id = kq2.max_id
      ) kq 
        ON kq.hoc_phan_id = hp.id 
        AND kq.sinh_vien_id = ?
      WHERE ctk.hoc_ky = ? 
        AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
      GROUP BY hp.id, hp.ma_hoc_phan, hp.ten_hoc_phan, hp.so_tin_chi
      ORDER BY MIN(ctk.id)
    `, [sinh_vien_id, sinh_vien_id, hoc_ky, nganh_id])

    const [total] = await pool.execute(`
  SELECT SUM(hp.so_tin_chi) AS tong_tc
  FROM (
    SELECT DISTINCT hp.id, hp.so_tin_chi
    FROM ChuongTrinhKhung ctk
    JOIN HocPhan hp ON ctk.hoc_phan_id = hp.id
    WHERE ctk.hoc_ky = ? 
      AND (ctk.nganh_id = ? OR ctk.nganh_id IS NULL)
  ) AS hp
`, [hoc_ky, nganh_id])

    return {
      hoc_ky,
      ten_hoc_ky_mo_ta: getTenHocKy(hoc_ky),
      tong_tc: total[0].tong_tc || 0,
      danh_sach: rows
    }
  } catch (err) {
    console.error('Error fetching ChuongTrinhKhung:', err)
    throw err
  }
}