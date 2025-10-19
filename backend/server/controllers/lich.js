import { pool } from '../config/db.js'

// 🧩 Lấy lớp của sinh viên theo id
async function getLopIdBySinhVienId(sinhVienId) {
  const [rows] = await pool.execute(
    'SELECT lop_id AS lopId FROM SinhVien WHERE id = ? LIMIT 1',
    [sinhVienId]
  )
  return rows.length ? rows[0].lopId : null
}

// 🧩 Lịch học (đúng logic admin)
export async function getLichHoc(req, res) {
  try {
    const { sinhVienId, from } = req.query
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' })
    if (!from) return res.status(400).json({ message: 'Thiếu ngày bắt đầu tuần (from)' })

    const lopId = await getLopIdBySinhVienId(sinhVienId)
    if (!lopId) return res.status(404).json({ message: 'Không tìm thấy lớp của sinh viên' })

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
        gv.ho_ten           AS tenGiangVien
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      WHERE lh.loai IN ('lythuyet','thuchanh','tructuyen')
        AND lhp.lop_id = ?
        AND (
          (lh.ngay_hoc IS NOT NULL AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY))
          OR
          (lh.ngay_hoc IS NULL)
        )
      ORDER BY lh.thu ASC, lh.ca ASC, lh.tiet_bat_dau ASC
    `
    const [rows] = await pool.execute(sql, [lopId, from, from])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichHoc sinh viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch học' })
  }
}

// 🧩 Lịch thi (đúng logic admin)
export async function getLichThi(req, res) {
  try {
    const { sinhVienId, from } = req.query
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' })
    if (!from) return res.status(400).json({ message: 'Thiếu ngày bắt đầu tuần (from)' })

    const lopId = await getLopIdBySinhVienId(sinhVienId)
    if (!lopId) return res.status(404).json({ message: 'Không tìm thấy lớp của sinh viên' })

    const sql = `
      SELECT 
        lh.id,
        lh.ngay_hoc      AS ngayHoc,
        lh.ca,
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
      WHERE lh.loai = 'thi'
        AND lhp.lop_id = ?
        AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY)
      ORDER BY lh.ngay_hoc ASC, lh.ca ASC
    `
    const [rows] = await pool.execute(sql, [lopId, from, from])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichThi sinh viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch thi' })
  }
}