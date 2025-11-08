import { pool } from '../config/db.js'

// 🧩 Lịch học (lấy từ các lớp học phần đã đăng ký)
export async function getLichHoc(req, res) {
  try {
    const { sinhVienId, from } = req.query
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' })
    if (!from) return res.status(400).json({ message: 'Thiếu ngày bắt đầu tuần (from)' })

    const sql = `
      SELECT 
        lh.id,
        lh.thu,
        lh.ca,
        lh.tiet_bat_dau  AS tietBatDau,
        lh.tiet_ket_thuc AS tietKetThuc,
        lh.phong,
        lh.co_so         AS coSo,
        lh.loai,
        lh.ngay_hoc      AS ngayHoc,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan     AS tenHocPhan,
        hp.ma_hoc_phan      AS maHocPhan,
        gv.ho_ten           AS tenGiangVien,
        GROUP_CONCAT(DISTINCT DATE_FORMAT(ln.ngay_nghi, '%Y-%m-%d')) AS danhSachNgayNghi
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      JOIN DangKyHocPhan dkhp ON dkhp.lop_hoc_phan_id = lhp.id
      LEFT JOIN LichNghi ln ON ln.lich_hoc_id = lh.id 
        AND ln.ngay_nghi BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY)
      WHERE lh.loai IN ('lythuyet','thuchanh','tructuyen')
        AND dkhp.sinh_vien_id = ?
        AND dkhp.trang_thai_dk = 'THANH_CONG'
        AND (
          (lh.ngay_hoc IS NOT NULL AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY))
          OR (
            lh.ngay_hoc IS NULL
            AND (lhp.ngay_bat_dau IS NULL OR lhp.ngay_bat_dau <= DATE_ADD(DATE(?), INTERVAL 6 DAY))
            AND (lhp.ngay_ket_thuc IS NULL OR lhp.ngay_ket_thuc >= DATE(?))
          )
        )
      GROUP BY lh.id
      ORDER BY lh.thu ASC, lh.ca ASC, lh.tiet_bat_dau ASC
    `
    const [rows] = await pool.execute(sql, [from, from, sinhVienId, from, from, from, from])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichHoc sinh viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch học' })
  }
}

// 🧩 Lịch thi (lấy từ các lớp học phần đã đăng ký)
export async function getLichThi(req, res) {
  try {
    const { sinhVienId, from } = req.query
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' })
    if (!from) return res.status(400).json({ message: 'Thiếu ngày bắt đầu tuần (from)' })

    const sql = `
      SELECT 
        lh.id,
        lh.ngay_hoc      AS ngayHoc,
        lh.ca,
        lh.tiet_bat_dau  AS tietBatDau,
        lh.tiet_ket_thuc AS tietKetThuc,
        lh.phong,
        lh.co_so         AS coSo,
        lh.loai,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan     AS tenHocPhan,
        hp.ma_hoc_phan      AS maHocPhan,
        gv.ho_ten           AS tenGiangVien
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      JOIN DangKyHocPhan dkhp ON dkhp.lop_hoc_phan_id = lhp.id
      WHERE lh.loai = 'thi'
        AND dkhp.sinh_vien_id = ?
        AND dkhp.trang_thai_dk = 'THANH_CONG'
        AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY)
      ORDER BY lh.ngay_hoc ASC, lh.ca ASC
    `
    const [rows] = await pool.execute(sql, [sinhVienId, from, from])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichThi sinh viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch thi' })
  }
}
