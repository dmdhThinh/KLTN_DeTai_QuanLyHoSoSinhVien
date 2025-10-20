// server/routes/importGiangVien.js
import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import { pool } from '../config/db.js'
import path from 'path'
import fs from 'fs'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// 📄 1️⃣ API: Tải file mẫu nhập danh sách
router.get('/teachers/template', (req, res) => {
  const wsData = [
    ['ma_gv', 'ho_ten', 'email', 'so_dien_thoai', 'gioi_tinh', 'ngay_sinh', 'dia_chi', 'ten_khoa', 'ten_nganh', 'ten_lop'],
    ['GV001', 'Nguyễn Văn A', 'nva@iuh.edu.vn', '0901234567', 'Nam', '1980-01-01', '123 Lê Lợi', 'Công nghệ thông tin', 'Khoa học máy tính', 'CNTT01'],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'GiangVienMau')

  const filePath = path.join('uploads', 'MauNhapGiangVien.xlsx')
  XLSX.writeFile(wb, filePath)

  res.download(filePath, 'MauNhapGiangVien.xlsx', () => {
    fs.unlinkSync(filePath)
  })
})

// 📥 2️⃣ API: Import danh sách giảng viên (theo tên Khoa/Ngành/Lớp)
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
      const {
        ma_gv,
        ho_ten,
        email,
        so_dien_thoai,
        gioi_tinh,
        ngay_sinh,
        dia_chi,
        ten_khoa,
        ten_nganh,
        ten_lop,
      } = row

      if (!ma_gv || !ho_ten || !ten_khoa) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu mã GV, họ tên hoặc tên khoa' })
        continue
      }

      try {
        // 🔹 Tìm ID của Khoa
        const [khoaRows] = await pool.execute(`SELECT id FROM Khoa WHERE ten_khoa = ?`, [ten_khoa])
        if (khoaRows.length === 0) {
          errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Khoa: ${ten_khoa}` })
          continue
        }
        const khoa_id = khoaRows[0].id

        // 🔹 Tìm ID của Ngành (nếu có)
        let nganh_id = null
        if (ten_nganh) {
          const [nganhRows] = await pool.execute(
            `SELECT id FROM Nganh WHERE ten_nganh = ? AND khoa_id = ?`,
            [ten_nganh, khoa_id]
          )
          if (nganhRows.length === 0) {
            errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Ngành: ${ten_nganh}` })
            continue
          }
          nganh_id = nganhRows[0].id
        }

        // 🔹 Tìm ID của Lớp (nếu có)
        let lop_id = null
        if (ten_lop && nganh_id) {
          const [lopRows] = await pool.execute(
            `SELECT id FROM Lop WHERE ten_lop = ? AND nganh_id = ?`,
            [ten_lop, nganh_id]
          )
          if (lopRows.length === 0) {
            errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Lớp: ${ten_lop}` })
            continue
          }
          lop_id = lopRows[0].id
        }

        // 🔹 Thêm giảng viên
        await pool.execute(
          `INSERT INTO GiangVien (ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi, khoa_id, nganh_id, lop_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ma_gv, ho_ten, email || null, so_dien_thoai || null, gioi_tinh || null, ngay_sinh || null, dia_chi || null, khoa_id, nganh_id, lop_id]
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
