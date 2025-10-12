import { pool } from '../config/db.js'

// Lấy lịch học
export async function getLichHoc(req, res) {
  try {
    const { sinhVienId } = req.query

    let query = `
      SELECT 
        lh.id,
        lh.thu,
        lh.ca,
        CONCAT(hp.ten_hoc_phan, ' (', hp.ma_hoc_phan, ')') AS monHoc,
        CONCAT(lhp.ma_lop_hoc_phan, ' - ', hp.ma_hoc_phan) AS lopHocPhan,
        CONCAT(lh.tiet_bat_dau, ' - ', lh.tiet_ket_thuc) AS tiet,
        CONCAT(lh.phong, ' (', lh.co_so, ')') AS phong,
        gv.ho_ten AS giangVien,
        lh.loai
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
      WHERE lh.loai != 'thi'
    `

    const [rows] = await pool.execute(query)
    res.json(rows)
  } catch (err) {
    console.error('Lỗi lấy lịch học:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// Lấy lịch thi
export async function getLichThi(req, res) {
  try {
    const { sinhVienId } = req.query

    let query = `
      SELECT 
        lh.id,
        lh.thu,
        lh.ca,
        CONCAT(hp.ten_hoc_phan, ' (', hp.ma_hoc_phan, ')') AS monHoc,
        CONCAT(lhp.ma_lop_hoc_phan, ' - ', hp.ma_hoc_phan) AS lopHocPhan,
        CONCAT(lh.tiet_bat_dau, ' - ', lh.tiet_ket_thuc) AS tiet,
        CONCAT(lh.phong, ' (', lh.co_so, ')') AS phong,
        gv.ho_ten AS giangVien,
        lh.loai
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
      WHERE lh.loai = 'thi'
    `

    const [rows] = await pool.execute(query)
    res.json(rows)
  } catch (err) {
    console.error('Lỗi lấy lịch thi:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
