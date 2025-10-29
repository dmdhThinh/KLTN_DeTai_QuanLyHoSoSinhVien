import {
  getAllLichAdmin, getLichByIdAdmin, createLichAdmin,
  updateLichAdmin, deleteLichAdmin
} from '../models/lichAdmin.js'

import { pool } from '../config/db.js'
// ===== LẤY DANH SÁCH LỊCH =====
export async function getAll(req, res) {
  try {
    const { lopHocPhanId, lopId, hocKy, namHoc, thu } = req.query
    const data = await getAllLichAdmin({ lopHocPhanId, lopId, hocKy, namHoc, thu })
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getAll lichAdmin:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy lịch học' })
  }
}

// Lịch học (Admin) – hiển thị lặp theo tuần giống Sinh viên
export async function getLichHocAdmin(req, res) {
  try {
    const { lopId, from } = req.query
    if (!lopId) return res.status(400).json({ message: 'Thiếu lopId' })
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
        gv.ho_ten           AS tenGiangVien
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      WHERE lh.loai IN ('lythuyet','thuchanh','tructuyen')
        AND lhp.lop_id = ?
        AND (
          (lh.ngay_hoc IS NOT NULL AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY))
          OR (
            lh.ngay_hoc IS NULL
            AND (lhp.ngay_bat_dau IS NULL OR lhp.ngay_bat_dau <= DATE_ADD(DATE(?), INTERVAL 6 DAY))
            AND (lhp.ngay_ket_thuc IS NULL OR lhp.ngay_ket_thuc >= DATE(?))
          )
        )
      ORDER BY lh.thu ASC, lh.ca ASC, lh.tiet_bat_dau ASC
    `
    const [rows] = await pool.execute(sql, [lopId, from, from, from, from])
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichHocAdmin:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch học (Admin)' })
  }
}

// 🧩 Lịch thi (Admin)
export async function getLichThiAdmin(req, res) {
  try {
    const { lopId, from } = req.query
    if (!lopId) return res.status(400).json({ message: 'Thiếu lopId' })

    const params = [lopId]
    let dateFilter = ''
    if (from) {
      // lọc trong tuần hiện tại
      dateFilter = `
        AND lh.ngay_hoc BETWEEN DATE(?) AND DATE_ADD(DATE(?), INTERVAL 6 DAY)
      `
      params.push(from, from)
    }

    const sql = `
      SELECT 
        lh.id,
        lh.ngay_hoc       AS ngayHoc,
        lh.ca,
        lh.phong,
        lh.co_so          AS coSo,
        lh.loai,
        lhp.ma_lop_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan   AS tenHocPhan,
        gv.ho_ten         AS tenGiangVien
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lhp.id = lh.lop_hoc_phan_id
      JOIN HocPhan hp ON hp.id = lhp.hoc_phan_id
      JOIN GiangVien gv ON gv.id = lhp.giang_vien_id
      WHERE lh.loai = 'thi'
        AND lhp.lop_id = ?
        ${dateFilter}
      ORDER BY lh.ngay_hoc ASC, lh.ca ASC
    `
    const [rows] = await pool.execute(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getLichThiAdmin:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy lịch thi (Admin)' })
  }
}






// ===== LẤY CHI TIẾT =====
export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    const data = await getLichByIdAdmin(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy lịch học' })
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getById lichAdmin:', err)
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết lịch học' })
  }
}

// ===== TẠO MỚI =====
export async function create(req, res) {
  try {
    const body = req.body
    if (!body.lop_hoc_phan_id || !body.thu || !body.ca)
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
    const id = await createLichAdmin(body)
    const created = await getLichByIdAdmin(id)
    res.status(201).json({ message: 'Thêm lịch học thành công', data: created })
  } catch (err) {
    console.error('❌ Lỗi create lichAdmin:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm lịch học' })
  }
}

// ===== CẬP NHẬT =====
export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    const ok = await updateLichAdmin(id, req.body)
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy lịch để cập nhật' })
    const updated = await getLichByIdAdmin(id)
    res.json({ message: 'Cập nhật lịch học thành công', data: updated })
  } catch (err) {
    console.error('❌ Lỗi update lichAdmin:', err)
    res.status(500).json({ message: 'Lỗi khi cập nhật lịch học' })
  }
}

// ===== XOÁ =====
export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    const ok = await deleteLichAdmin(id)
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy lịch để xoá' })
    res.json({ message: 'Đã xoá lịch học thành công' })
  } catch (err) {
    console.error('❌ Lỗi remove lichAdmin:', err)
    res.status(500).json({ message: 'Lỗi khi xoá lịch học' })
  }
}
import { updateGiangVienLopHocPhan } from '../models/lichAdmin.js'

export async function updateGiangVien(req, res) {
  try {
    const { lopHocPhanId, giangVienId } = req.body
    if (!lopHocPhanId || !giangVienId)
      return res.status(400).json({ message: 'Thiếu thông tin lớp học phần hoặc giảng viên.' })

    const success = await updateGiangVienLopHocPhan(lopHocPhanId, giangVienId)
    if (!success)
      return res.status(404).json({ message: 'Không tìm thấy lớp học phần để cập nhật.' })

    res.json({ message: '✅ Cập nhật giảng viên thành công!' })
  } catch (err) {
    console.error('❌ Lỗi updateGiangVien:', err)
    res.status(500).json({ message: 'Lỗi server khi cập nhật giảng viên.' })
  }
}


