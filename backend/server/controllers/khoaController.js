// server/controllers/khoaController.js
import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getAllKhoa,
  getKhoaById,
  isTenKhoaExists,
  createKhoa,
  updateKhoa,
  deleteKhoa
} from '../models/khoa.js'

// ===== LẤY DANH SÁCH KHOA =====
export async function getAll(req, res) {
  try {
    const data = await getAllKhoa()
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getAll Khoa:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách khoa' })
  }
}

// ===== LẤY THEO ID =====
export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    const data = await getKhoaById(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy khoa' })
    res.json(data)
  } catch (err) {
    console.error('❌ Lỗi getById Khoa:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết khoa' })
  }
}

// ===== TẠO MỚI =====
export async function create(req, res) {
  try {
    const { ten_khoa } = req.body
    if (!ten_khoa?.trim()) {
      return res.status(400).json({ message: 'Tên khoa là bắt buộc' })
    }

    const exists = await isTenKhoaExists(ten_khoa.trim())
    if (exists) {
      return res.status(409).json({ message: 'Tên khoa đã tồn tại' })
    }

    const id = await createKhoa(ten_khoa.trim())
    const created = await getKhoaById(id)
    res.status(201).json({ message: 'Thêm khoa thành công', data: created })
  } catch (err) {
    console.error('❌ Lỗi create Khoa:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm khoa' })
  }
}

// ===== CẬP NHẬT =====
export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    const { ten_khoa } = req.body
    if (!ten_khoa?.trim()) {
      return res.status(400).json({ message: 'Tên khoa là bắt buộc' })
    }

    const exists = await isTenKhoaExists(ten_khoa.trim())
    if (exists) {
      return res.status(409).json({ message: 'Tên khoa đã tồn tại' })
    }

    const ok = await updateKhoa(id, ten_khoa.trim())
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy khoa để cập nhật' })

    const updated = await getKhoaById(id)
    res.json({ message: 'Cập nhật thành công', data: updated })
  } catch (err) {
    console.error('❌ Lỗi update Khoa:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật khoa' })
  }
}

// ===== XOÁ =====
export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    const ok = await deleteKhoa(id)
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy khoa để xoá' })
    res.json({ message: 'Đã xoá khoa thành công' })
  } catch (err) {
    console.error('❌ Lỗi remove Khoa:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi xoá khoa' })
  }
}
// 🧩 IMPORT KHOA TỪ FILE EXCEL
export async function importKhoaFromExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên file Excel (.xlsx)' })
    }

    const filePath = req.file.path
    const workbook = xlsx.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(sheet)

    let added = 0
    for (const row of data) {
      const tenKhoa = row['Tên khoa'] || row['ten_khoa'] || row['Khoa']
      if (!tenKhoa) continue

      const exists = await isTenKhoaExists(tenKhoa.trim())
      if (!exists) {
        await createKhoa(tenKhoa.trim())
        added++
      }
    }

    fs.unlinkSync(filePath) // 🧹 Xóa file tạm
    res.json({ message: `Đã thêm ${added} khoa mới từ file Excel.` })
  } catch (err) {
    console.error('❌ Lỗi import Khoa:', err)
    res.status(500).json({ message: 'Lỗi khi import file Excel.' })
  }
}
