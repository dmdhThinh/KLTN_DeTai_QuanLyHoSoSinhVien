import multer from 'multer'
import xlsx from 'xlsx'
import { pool } from '../config/db.js'
import { isMaSvExists, createSinhVien } from '../models/sinhvien.js'

// Cấu hình multer (lưu file tạm trong bộ nhớ)
const storage = multer.memoryStorage()
export const upload = multer({ storage })

// ======= XỬ LÝ IMPORT FILE CSV/EXCEL =======
export async function importStudents(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file CSV hoặc Excel.' })
    }

    // Đọc file (dưới dạng buffer)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet)

    if (!rows.length) {
      return res.status(400).json({ message: 'File không có dữ liệu.' })
    }

    const errors = []
    let added = 0

    for (let [index, row] of rows.entries()) {
      const ma_sv = String(row['Mã SV'] || row['MaSV'] || '').trim()
      const ho_ten = String(row['Họ tên'] || row['HoTen'] || '').trim()
      const ngay_sinh = row['Ngày sinh'] || row['NgaySinh']
      const gioi_tinh = row['Giới tính'] || row['GioiTinh'] || null
      const email = row['Email'] || null
      const khoa_hoc = row['Khóa học'] || row['KhoaHoc'] || null

      if (!ma_sv || !ho_ten || !ngay_sinh) {
        errors.push({ dòng: index + 2, lỗi: 'Thiếu thông tin bắt buộc.' })
        continue
      }

      const birthYear = Number(String(ngay_sinh).slice(0, 4))
      const currentYear = new Date().getFullYear()
      if (currentYear - birthYear <= 18) {
        errors.push({ dòng: index + 2, lỗi: 'Tuổi phải > 18.' })
        continue
      }

      const exists = await isMaSvExists(ma_sv)
      if (exists) {
        errors.push({ dòng: index + 2, lỗi: `Mã SV ${ma_sv} đã tồn tại.` })
        continue
      }

      await createSinhVien({
        ma_sv, ho_ten, ngay_sinh,
        gioi_tinh, email,
        khoa_hoc, dia_chi: null,
        so_dien_thoai: null, anh_the: null,
        khoa_id: null, nganh_id: null, lop_id: null, co_van_id: null
      })
      added++
    }

    return res.json({
      message: `Đã thêm ${added} sinh viên.`,
      lỗi: errors
    })
  } catch (err) {
    console.error('❌ Lỗi import:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi import file.' })
  }
}
// ======= TẢI FILE MẪU EXCEL NHẬP SINH VIÊN =======
export async function downloadTemplate(req, res) {
  try {
    const data = [
      {
        'Mã SV': 'SV001',
        'Họ tên': 'Nguyễn Văn A',
        'Ngày sinh': '2003-05-12',
        'Giới tính': 'Nam',
        'Email': 'example@gmail.com',
        'Khóa học': 'K47'
      }
    ]

    const ws = xlsx.utils.json_to_sheet(data)
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'MauNhapSinhVien')

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Disposition', 'attachment; filename="MauNhapSinhVien.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    res.send(buffer)
  } catch (err) {
    console.error('❌ Lỗi tạo file mẫu:', err)
    res.status(500).json({ message: 'Không thể tạo file mẫu Excel.' })
  }
}
