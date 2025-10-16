import {
  getAllLop,
  getLopById,
  isTenLopExists,
  createLop,
  updateLop,
  deleteLop
} from '../models/lop.js'

// ===== LẤY DANH SÁCH =====
export async function getAll(req, res) {
  try {
    const data = await getAllLop()
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getAll Lop:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách lớp' })
  }
}

// ===== LẤY THEO ID =====
export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    const data = await getLopById(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy lớp' })
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getById Lop:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết lớp' })
  }
}

// ===== TẠO MỚI =====
export async function create(req, res) {
  try {
    const { ten_lop, khoa_id, nganh_id } = req.body
    if (!ten_lop?.trim()) {
      return res.status(400).json({ message: 'Tên lớp là bắt buộc' })
    }

    const exists = await isTenLopExists(ten_lop.trim())
    if (exists) {
      return res.status(409).json({ message: 'Tên lớp đã tồn tại' })
    }

    const id = await createLop(ten_lop.trim(), khoa_id || null, nganh_id || null)
    const created = await getLopById(id)
    res.status(201).json({ message: 'Thêm lớp thành công', data: created })
  } catch (err) {
    console.error('❌ Lỗi create Lop:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm lớp' })
  }
}

// ===== CẬP NHẬT =====
export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    const { ten_lop, khoa_id, nganh_id } = req.body
    if (!ten_lop?.trim()) {
      return res.status(400).json({ message: 'Tên lớp là bắt buộc' })
    }

    const ok = await updateLop(id, ten_lop.trim(), khoa_id || null, nganh_id || null)
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy lớp để cập nhật' })

    const updated = await getLopById(id)
    res.json({ message: 'Cập nhật lớp thành công', data: updated })
  } catch (err) {
    console.error('❌ Lỗi update Lop:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật lớp' })
  }
}

// ===== XOÁ =====
export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    const ok = await deleteLop(id)
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy lớp để xoá' })
    res.json({ message: 'Đã xoá lớp thành công' })
  } catch (err) {
    console.error('❌ Lỗi remove Lop:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi xoá lớp' })
  }
}
