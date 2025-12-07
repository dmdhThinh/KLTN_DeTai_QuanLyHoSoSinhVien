import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { 
  importChungChiTiengAnh, 
  getChungChiTiengAnhList,
  getDanhSachSinhVienVoiChungChi,
  createChungChi,
  updateChungChi,
  deleteChungChi,
  getDanhSachKhoaHoc,
  getDanhSachLop
} from '../models/chungChiTiengAnh.js'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// =======================================
// 📄 1️⃣ API: Tải file mẫu nhập chứng chỉ tiếng Anh
// =======================================
router.get('/english-certificate/template', (req, res) => {
  const wsData = [
    [
      'Mã sinh viên', 'Loại chứng chỉ', 'Ngày cấp', 'Điểm', 'Ghi chú'
    ],
    [
      '21000123', 'TOEIC', '2024-01-15', 650, 'Đã nộp bản gốc'
    ],
    [
      '21000124', 'IELTS', '2024-02-20', 6.5, 'Đã nộp bản gốc'
    ],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Set column widths
  ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 30 }]
  
  XLSX.utils.book_append_sheet(wb, ws, 'ChungChiTiengAnhMau')

  const filePath = path.join('uploads', 'MauNhapChungChiTiengAnh.xlsx')
  
  // Ensure uploads dir exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  XLSX.writeFile(wb, filePath)

  res.download(filePath, 'MauNhapChungChiTiengAnh.xlsx', () => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (e) {
      console.error('Lỗi xóa file tạm:', e)
    }
  })
})

// =======================================
// 📥 2️⃣ API: Import chứng chỉ tiếng Anh
// =======================================
router.post('/english-certificate', upload.single('file'), async (req, res) => {
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
      const loai_chung_chi = row['Loại chứng chỉ'] || row['Loại'] || 'TOEIC'
      const ngay_cap = row['Ngày cấp']
      const diem = row['Điểm']
      const ghi_chu = row['Ghi chú'] || ''

      if (!ma_sv) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu mã sinh viên' })
        continue
      }

      // Xử lý ngày cấp
      let ngayCapISO = null
      if (ngay_cap) {
        try {
          if (typeof ngay_cap === 'number') {
            // Excel date serial number
            const d = XLSX.SSF.parse_date_code(ngay_cap)
            ngayCapISO = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
          } else {
            const d = new Date(ngay_cap)
            if (!isNaN(d.getTime())) {
              ngayCapISO = d.toISOString().split('T')[0]
            }
          }
        } catch (e) {
          errors.push({ dòng: i + 2, lỗi: 'Ngày cấp không hợp lệ' })
          continue
        }
      }

      dataToImport.push({
        ma_sv: ma_sv.toString().trim(),
        loai_chung_chi: loai_chung_chi.toString().trim(),
        ngay_cap: ngayCapISO,
        diem: diem ? Number(diem) : null,
        ghi_chu: ghi_chu.toString().trim()
      })
    }

    // Loại bỏ trùng lặp trong file: chỉ giữ dòng cuối cùng (mới nhất) cho mỗi mã SV
    const uniqueData = new Map()
    const duplicateLines = []
    
    for (const item of dataToImport) {
      const key = item.ma_sv
      if (uniqueData.has(key)) {
        duplicateLines.push({
          dòng: uniqueData.get(key).dong || '-',
          lỗi: `Bị ghi đè bởi dòng ${dataToImport.indexOf(item) + 2} (cùng mã SV)`
        })
      }
      uniqueData.set(key, { ...item, dong: dataToImport.indexOf(item) + 2 })
    }

    const finalDataToImport = Array.from(uniqueData.values()).map(({dong, ...rest}) => rest)

    // Gọi model xử lý batch import
    const result = await importChungChiTiengAnh(finalDataToImport)

    // Gộp lỗi parse, lỗi duplicate trong file, và lỗi db
    const finalErrors = [...errors, ...duplicateLines, ...result.errors]

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path)

    const duplicateCount = duplicateLines.length
    const message = duplicateCount > 0 
      ? `Đã xử lý ${sheet.length} dòng. ${duplicateCount} dòng trùng đã được ghi đè bằng dòng mới nhất.`
      : `Đã xử lý ${sheet.length} dòng.`

    res.json({
      message,
      thành_công: result.successCount,
      lỗi: finalErrors,
      duplicate_count: duplicateCount
    })

  } catch (err) {
    console.error('❌ Lỗi import chứng chỉ tiếng Anh:', err)
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Lỗi server khi import chứng chỉ tiếng Anh' })
  }
})

// =======================================
// 📋 3️⃣ API: Lấy danh sách chứng chỉ tiếng Anh đã import
// =======================================
router.get('/english-certificate', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query
    const result = await getChungChiTiengAnhList({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      search: search.toString() 
    })
    res.json(result)
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách chứng chỉ tiếng Anh:', err)
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách chứng chỉ tiếng Anh' })
  }
})

// =======================================
// 📋 4️⃣ API: Lấy danh sách TẤT CẢ sinh viên với thông tin chứng chỉ (để quản lý)
// =======================================
router.get('/english-certificates/manage', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', khoa_hoc = '', lop_id = '' } = req.query
    const result = await getDanhSachSinhVienVoiChungChi({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      search: search.toString(),
      khoa_hoc: khoa_hoc.toString(),
      lop_id: lop_id.toString()
    })
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách sinh viên với chứng chỉ:', err)
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sinh viên' })
  }
})

// =======================================
// 📋 5️⃣ API: Lấy danh sách khóa học và lớp để filter
// =======================================
router.get('/english-certificates/filters', async (req, res) => {
  try {
    const [khoaHocList, lopList] = await Promise.all([
      getDanhSachKhoaHoc(),
      getDanhSachLop()
    ])
    res.json({ success: true, khoaHocList, lopList })
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách filter:', err)
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách filter' })
  }
})

// =======================================
// ➕ 6️⃣ API: Thêm chứng chỉ mới
// =======================================
router.post('/english-certificates', async (req, res) => {
  try {
    const { sinh_vien_id, loai_chung_chi, ngay_cap, diem, ghi_chu } = req.body
    
    if (!sinh_vien_id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã sinh viên' })
    }

    const result = await createChungChi(sinh_vien_id, {
      loai_chung_chi,
      ngay_cap,
      diem,
      ghi_chu
    })
    
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('❌ Lỗi thêm chứng chỉ:', err)
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm chứng chỉ' })
  }
})

// =======================================
// ✏️ 7️⃣ API: Sửa chứng chỉ
// =======================================
router.put('/english-certificates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { loai_chung_chi, ngay_cap, diem, ghi_chu } = req.body
    
    await updateChungChi(id, {
      loai_chung_chi,
      ngay_cap,
      diem,
      ghi_chu
    })
    
    res.json({ success: true, message: 'Cập nhật chứng chỉ thành công' })
  } catch (err) {
    console.error('❌ Lỗi sửa chứng chỉ:', err)
    res.status(500).json({ success: false, message: 'Lỗi server khi sửa chứng chỉ' })
  }
})

// =======================================
// 🗑️ 8️⃣ API: Xóa chứng chỉ
// =======================================
router.delete('/english-certificates/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await deleteChungChi(id)
    
    res.json({ success: true, message: 'Xóa chứng chỉ thành công' })
  } catch (err) {
    console.error('❌ Lỗi xóa chứng chỉ:', err)
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa chứng chỉ' })
  }
})

export default router

