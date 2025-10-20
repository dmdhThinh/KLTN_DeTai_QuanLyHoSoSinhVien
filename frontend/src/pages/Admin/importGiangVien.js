// server/routes/importGiangVien.js
import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import { pool } from '../config/db.js'
import path from 'path'
import fs from 'fs'

const router = Router()

// 🧩 Cấu hình upload tạm
const upload = multer({ dest: 'uploads/' })

// ==========================
// 📄 1️⃣ API: Tải file mẫu
// ==========================
router.get('/teachers/template', (req, res) => {
  const wsData = [
    ['ma_gv', 'ho_ten', 'email', 'so_dien_thoai', 'gioi_tinh', 'ngay_sinh', 'dia_chi', 'khoa_id', 'nganh_id', 'lop_id'],
    ['GV001', 'Nguyễn Văn A', 'nva@iuh.edu.vn', '0901234567', 'Nam', '1980-01-01', '123 Lê Lợi', 1, 1, 1],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'GiangVienMau')

  const filePath = path.join('uploads', 'MauNhapGiangVien.xlsx')
  XLSX.writeFile(wb, filePath)

  res.download(filePath, 'MauNhapGiangVien.xlsx', () => {
    fs.unlinkSync(filePath) // Xóa file tạm sau khi gửi
  })
})

// ==========================
// 📥 2️⃣ API: Import danh sách
// ==========================
router.post('/teachers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file nào được tải lên' })

    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    const errors = []
    let successCount = 0

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i]
      const { ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id } = row

      if (!ma_gv || !ho_ten || !khoa_id) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu mã, họ tên hoặc khoa_id' })
        continue
      }

      try {
        await pool.execute(
          `INSERT INTO GiangVien (ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ma_gv, ho_ten, email || null, so_dien_thoai || null, gioi_tinh || null, ngay_sinh || null, dia_chi || null, khoa_id, nganh_id || null, lop_id || null]
        )
        successCount++
      } catch (err) {
        errors.push({ dòng: i + 2, lỗi: err.message })
      }
    }

    fs.unlinkSync(req.file.path)

    res.json({
      message: `Đã xử lý ${sheet.length} dòng.`,
      thành_công: successCount,
      lỗi: errors,
    })
  } catch (err) {
    console.error('❌ Lỗi import giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi import danh sách giảng viên' })
  }
})

export default router
