import { pool } from '../config/db.js'

// 🧩 Lấy danh sách lớp học phần (kèm môn & giảng viên)
export async function getAll(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        lhp.id,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan     AS tenHocPhan,
        gv.ho_ten           AS tenGiangVien,
        lhp.hoc_ky          AS hocKy,
        lhp.nam_hoc         AS namHoc,
        l.ten_lop           AS tenLop
      FROM LopHocPhan lhp
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      JOIN Lop l ON l.id = lhp.lop_id
      ORDER BY lhp.nam_hoc DESC, lhp.hoc_ky ASC, lhp.ma_lop_hoc_phan ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getAll LopHocPhan:', err)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lớp học phần' })
  }
}
