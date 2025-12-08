import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { pool } from '../config/db.js'
import { importDiemRenLuyen, getDiemRenLuyenList, getDiemRenLuyen, themHoatDongRenLuyen, suaHoatDongRenLuyen, xoaHoatDongRenLuyen, updateAllDiemRenLuyenTo70 } from '../models/diemRenLuyen.js'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// =======================================
// 📄 1️⃣ API: Tải file mẫu nhập điểm rèn luyện
// =======================================
router.get('/training-scores/template', (req, res) => {
  const wsData = [
    [
      'Mã sinh viên', 'Học kỳ', 'Năm học', 'Tên hoạt động', 'Điểm'
    ],
    [
      '21000123', 'HK1', '2023-2024', 'Tư vấn hướng nghiệp', 3
    ],
    [
      '21000123', 'HK1', '2023-2024', 'Giao lưu văn hóa', 3
    ],
    [
      '21000124', 'HK1', '2023-2024', 'Tư vấn hướng nghiệp', 3
    ],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Set column widths
  ws['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 10 }]
  
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

    // Gom các hoạt động theo (ma_sv, hoc_ky, nam_hoc)
    const hoatDongMap = new Map()

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i]
      const ma_sv = row['Mã sinh viên'] || row['Mã SV']
      const hoc_ky = row['Học kỳ']
      const nam_hoc = row['Năm học']
      const ten_hoat_dong = row['Tên hoạt động'] || row['Hoạt động']
      const diem = row['Điểm'] || row['Điểm rèn luyện']

      if (!ma_sv || !hoc_ky || !nam_hoc) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu thông tin bắt buộc (Mã SV, HK, Năm học)' })
        continue
      }

      // Nếu có tên hoạt động và điểm -> format mới (nhiều hoạt động)
      if (ten_hoat_dong && diem !== undefined) {
        const key = `${ma_sv}_${hoc_ky}_${nam_hoc}`
        if (!hoatDongMap.has(key)) {
          hoatDongMap.set(key, {
            ma_sv: ma_sv.toString().trim(),
            hoc_ky: hoc_ky.toString().trim(),
            nam_hoc: nam_hoc.toString().trim(),
            hoat_dong: [],
            dong: i + 2
          })
        }
        hoatDongMap.get(key).hoat_dong.push({
          ten_hoat_dong: ten_hoat_dong.toString().trim(),
          diem: Number(diem),
          ghi_chu: row['Ghi chú'] || null
        })
      } else if (diem !== undefined) {
        // Format cũ: chỉ có điểm tổng (tương thích ngược)
        const key = `${ma_sv}_${hoc_ky}_${nam_hoc}`
        if (!hoatDongMap.has(key)) {
          hoatDongMap.set(key, {
            ma_sv: ma_sv.toString().trim(),
            hoc_ky: hoc_ky.toString().trim(),
            nam_hoc: nam_hoc.toString().trim(),
            so_diem: Number(diem), // Giữ để tương thích
            dong: i + 2
          })
        }
      } else {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu thông tin: cần "Tên hoạt động" và "Điểm" hoặc "Điểm rèn luyện"' })
      }
    }

    // Chuyển Map thành Array
    const finalDataToImport = Array.from(hoatDongMap.values())

    // Không cần loại bỏ trùng lặp nữa vì đã gom ở trên

    // Gọi model xử lý batch import
    const result = await importDiemRenLuyen(finalDataToImport)

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

// =======================================
// 📋 3️⃣ API: Lấy danh sách điểm rèn luyện đã import
// =======================================
router.get('/training-scores', async (req, res) => {
  try {
    const { hoc_ky, nam_hoc, page = 1, limit = 50 } = req.query
    const result = await getDiemRenLuyenList({ hoc_ky, nam_hoc, page: parseInt(page), limit: parseInt(limit) })
    res.json(result)
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách điểm rèn luyện:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách điểm rèn luyện' })
  }
})

// =======================================
// 📋 API: Lấy điểm rèn luyện của sinh viên cụ thể
// =======================================
router.get('/training-scores/sinh-vien/:sinhVienId', async (req, res) => {
  try {
    const { sinhVienId } = req.params
    const { hoc_ky, nam_hoc } = req.query
    const rows = await getDiemRenLuyen(+sinhVienId, hoc_ky, nam_hoc)
    
    // Lấy danh sách hoạt động cho mỗi bản ghi
    for (const row of rows) {
      try {
        const [hoatDongRows] = await pool.execute(
          'SELECT id, ten_hoat_dong, diem, ghi_chu FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ? ORDER BY id',
          [row.id]
        )
        row.hoat_dong = hoatDongRows
      } catch (err) {
        row.hoat_dong = []
      }
    }
    
    res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi lấy điểm rèn luyện sinh viên:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy điểm rèn luyện sinh viên' })
  }
})

// =======================================
// ➕ API: Thêm hoạt động rèn luyện
// =======================================
router.post('/training-scores/hoat-dong', async (req, res) => {
  try {
    const { diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu } = req.body
    if (!diem_ren_luyen_id || !ten_hoat_dong || diem === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }
    await themHoatDongRenLuyen({ diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu })
    res.json({ message: 'Thêm hoạt động thành công' })
  } catch (err) {
    console.error('❌ Lỗi thêm hoạt động:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm hoạt động' })
  }
})

// =======================================
// ✏️ API: Sửa hoạt động rèn luyện
// =======================================
router.put('/training-scores/hoat-dong/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { ten_hoat_dong, diem, ghi_chu } = req.body
    if (!ten_hoat_dong || diem === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }
    await suaHoatDongRenLuyen({ id: +id, ten_hoat_dong, diem, ghi_chu })
    res.json({ message: 'Sửa hoạt động thành công' })
  } catch (err) {
    console.error('❌ Lỗi sửa hoạt động:', err)
    res.status(500).json({ message: 'Lỗi server khi sửa hoạt động' })
  }
})

// =======================================
// ❌ API: Xóa hoạt động rèn luyện
// =======================================
router.delete('/training-scores/hoat-dong/:id', async (req, res) => {
  try {
    const { id } = req.params
    await xoaHoatDongRenLuyen(+id)
    res.json({ message: 'Xóa hoạt động thành công' })
  } catch (err) {
    console.error('❌ Lỗi xóa hoạt động:', err)
    res.status(500).json({ message: 'Lỗi server khi xóa hoạt động' })
  }
})

// =======================================
// 🔄 API: Cập nhật điểm rèn luyện tất cả sinh viên thành 70
// =======================================
router.post('/training-scores/update-all-to-70', async (req, res) => {
  try {
    const result = await updateAllDiemRenLuyenTo70()
    res.json(result)
  } catch (err) {
    console.error('❌ Lỗi cập nhật điểm rèn luyện:', err)
    res.status(500).json({ message: 'Lỗi server khi cập nhật điểm rèn luyện', error: err.message })
  }
})

export default router
