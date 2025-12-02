import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { importDiemRenLuyen } from '../models/diemRenLuyen.js'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// =======================================
// 📄 1️⃣ API: Tải file mẫu nhập điểm rèn luyện
// =======================================
router.get('/training-scores/template', (req, res) => {
  const wsData = [
    [
      'Mã sinh viên', 'Học kỳ', 'Năm học', 'Điểm rèn luyện'
    ],
    [
      '21000123', 'HK1', '2023-2024', 85
    ],
    [
      '21000124', 'HK1', '2023-2024', 92
    ],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Set column widths
  ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }]
  
  XLSX.utils.book_append_sheet(wb, ws, 'DiemRenLuyenMau')

  const filePath = path.join('uploads', 'MauNhapDiemRenLuyen.xlsx')
  
  // Ensure uploads dir exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  XLSX.writeFile(wb, filePath)

  res.download(filePath, 'MauNhapDiemRenLuyen.xlsx', () => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (e) {
      console.error('Lỗi xóa file tạm:', e)
    }
  })
})

// =======================================
// 📥 2️⃣ API: Import điểm rèn luyện
// =======================================
router.post('/training-scores', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file nào được tải lên' })

    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    const dataToImport = []
    const errors = []

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i]
      const ma_sv = row['Mã sinh viên'] || row['Mã SV']
      const hoc_ky = row['Học kỳ']
      const nam_hoc = row['Năm học']
      const so_diem = row['Điểm rèn luyện'] || row['Điểm']

      if (!ma_sv || !hoc_ky || !nam_hoc || so_diem === undefined) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu thông tin bắt buộc (Mã SV, HK, Năm học, Điểm)' })
        continue
      }

      // Tự động xếp loại nếu không có
      let xep_loai = row['Xếp loại']
      if (!xep_loai) {
        const diem = Number(so_diem)
        if (diem >= 90) xep_loai = 'Xuất sắc'
        else if (diem >= 80) xep_loai = 'Tốt'
        else if (diem >= 65) xep_loai = 'Khá'
        else if (diem >= 50) xep_loai = 'Trung bình'
        else xep_loai = 'Yếu'
      }

      dataToImport.push({
        ma_sv: ma_sv.toString().trim(),
        hoc_ky: hoc_ky.toString().trim(),
        nam_hoc: nam_hoc.toString().trim(),
        so_diem: Number(so_diem),
        xep_loai
      })
    }

    // Gọi model xử lý batch import
    const result = await importDiemRenLuyen(dataToImport)

    // Gộp lỗi parse và lỗi db
    const finalErrors = [...errors, ...result.errors]

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path)

    res.json({
      message: `Đã xử lý ${sheet.length} dòng.`,
      thành_công: result.successCount,
      lỗi: finalErrors
    })

  } catch (err) {
    console.error('❌ Lỗi import điểm rèn luyện:', err)
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Lỗi server khi import điểm rèn luyện' })
  }
})

export default router
