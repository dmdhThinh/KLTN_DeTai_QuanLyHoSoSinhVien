// import multer from 'multer'
// import * as xlsx from 'xlsx'
// import { pool } from '../config/db.js'

// // ===== Multer config: chỉ cho phép CSV/XLSX =====
// const storage = multer.memoryStorage()
// export const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       'text/csv',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ]
//     if (!allowed.includes(file.mimetype)) {
//       return cb(new Error('Chỉ chấp nhận file CSV hoặc Excel (.xlsx)'))
//     }
//     cb(null, true)
//   }
// })

// // ===== Import sinh viên (kiểm tra Khoa → Ngành → Lớp) =====
// export async function importStudents(req, res) {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV hoặc Excel.' })

//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
//     const sheet = workbook.Sheets[workbook.SheetNames[0]]
//     const rows = xlsx.utils.sheet_to_json(sheet)
//     if (!rows.length) return res.status(400).json({ message: 'File không có dữ liệu.' })

//     const errors = []
//     let added = 0

//     for (let [index, row] of rows.entries()) {
//       const ma_sv = String(row['Mã SV'] || '').trim()
//       const ho_ten = String(row['Họ tên'] || '').trim()
//       const ngay_sinh = row['Ngày sinh']
//       const gioi_tinh = row['Giới tính'] || null
//       const email = row['Email'] || null
//       const so_dien_thoai = row['Số điện thoại'] || null
//       const dia_chi = row['Địa chỉ'] || null
//       const khoa_hoc = row['Khóa học'] || null
//       const tenKhoa = String(row['Khoa'] || '').trim()
//       const tenNganh = String(row['Ngành'] || '').trim()
//       const tenLop = String(row['Lớp'] || '').trim()

//       // Kiểm tra dữ liệu bắt buộc
//       if (!ma_sv || !ho_ten || !ngay_sinh || !gioi_tinh || !email || !so_dien_thoai || !dia_chi || !khoa_hoc || !tenKhoa || !tenNganh || !tenLop) {
//         errors.push({ dòng: index + 2, lỗi: 'Thiếu thông tin bắt buộc.' })
//         continue
//       }

//       // === Kiểm tra tuổi hợp lệ ===
//       const birthYear = Number(String(ngay_sinh).slice(0, 4))
//       const currentYear = new Date().getFullYear()
//       if (currentYear - birthYear < 18) {
//         errors.push({ dòng: index + 2, lỗi: 'Tuổi phải >= 18.' })
//         continue
//       }

//       // === Kiểm tra tồn tại Khoa ===
//       const [khoaRows] = await pool.query('SELECT id FROM Khoa WHERE ten_khoa = ?', [tenKhoa])
//       if (!khoaRows.length) {
//         errors.push({ dòng: index + 2, lỗi: `Khoa '${tenKhoa}' không tồn tại.` })
//         continue
//       }
//       const khoa_id = khoaRows[0].id

//       // === Kiểm tra tồn tại Ngành ===
//       const [nganhRows] = await pool.query('SELECT id FROM Nganh WHERE ten_nganh = ? AND khoa_id = ?', [tenNganh, khoa_id])
//       if (!nganhRows.length) {
//         errors.push({ dòng: index + 2, lỗi: `Ngành '${tenNganh}' không thuộc khoa '${tenKhoa}'.` })
//         continue
//       }
//       const nganh_id = nganhRows[0].id

//       // === Kiểm tra tồn tại Lớp ===
//       const [lopRows] = await pool.query('SELECT id FROM Lop WHERE ten_lop = ? AND nganh_id = ?', [tenLop, nganh_id])
//       if (!lopRows.length) {
//         errors.push({ dòng: index + 2, lỗi: `Lớp '${tenLop}' không thuộc ngành '${tenNganh}'.` })
//         continue
//       }
//       const lop_id = lopRows[0].id

//       // === Kiểm tra sinh viên đã tồn tại ===
//       const [exists] = await pool.query('SELECT id FROM SinhVien WHERE ma_sv = ?', [ma_sv])
//       if (exists.length) {
//         errors.push({ dòng: index + 2, lỗi: `Mã SV '${ma_sv}' đã tồn tại.` })
//         continue
//       }

//       // === Thêm sinh viên mới ===
//       await pool.query(
//         `INSERT INTO SinhVien (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, khoa_id, nganh_id, lop_id)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, khoa_id, nganh_id, lop_id]
//       )
//       added++
//     }

//     res.json({ message: `Đã thêm ${added} sinh viên.`, lỗi: errors })
//   } catch (err) {
//     console.error('❌ Lỗi import:', err)
//     res.status(500).json({ message: 'Lỗi máy chủ khi import file.' })
//   }
// }

// // ======= TẢI FILE MẪU EXCEL NHẬP SINH VIÊN (CÓ KHOA, NGÀNH, LỚP) =======
// export async function downloadTemplate(req, res) {
//   try {
//     const data = [
//       {
//         'Mã SV': 'SV001',
//         'Họ tên': 'Nguyễn Văn A',
//         'Ngày sinh': '2003-05-12',
//         'Giới tính': 'Nam',
//         'Email': 'example@gmail.com',
//         'Số điện thoại': '0909123456',
//         'Địa chỉ': '123 Đường ABC, Quận 1, TP.HCM',
//         'Khóa học': 'K47',
//         'Khoa': 'Công nghệ thông tin',
//         'Ngành': 'Kỹ thuật phần mềm',
//         'Lớp': 'DHKTPM18BTT'
//       }
//     ]

//     const ws = xlsx.utils.json_to_sheet(data)
//     const wb = xlsx.utils.book_new()
//     xlsx.utils.book_append_sheet(wb, ws, 'MauNhapSinhVien')

//     const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
//     res.setHeader('Content-Disposition', 'attachment; filename="MauNhapSinhVien.xlsx"')
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
//     res.send(buffer)
//   } catch (err) {
//     console.error('❌ Lỗi tạo file mẫu:', err)
//     res.status(500).json({ message: 'Không thể tạo file mẫu Excel.' })
//   }
// }
import multer from 'multer'
import * as xlsx from 'xlsx'
import { pool } from '../config/db.js'

// ===== Multer config: chỉ cho phép CSV/XLSX =====
const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận file CSV hoặc Excel (.xlsx)'))
    }
    cb(null, true)
  }
})

// ===== Import sinh viên (kiểm tra Khoa → Ngành → Lớp) =====
export async function importStudents(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file CSV hoặc Excel.' })

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet)
    if (!rows.length) return res.status(400).json({ message: 'File không có dữ liệu.' })

    const errors = []
    let added = 0

    for (let [index, row] of rows.entries()) {
      const ma_sv = String(row['Mã SV'] || '').trim()
      const ho_ten = String(row['Họ tên'] || '').trim()
      const ngay_sinh = row['Ngày sinh']
      const gioi_tinh = row['Giới tính'] || null
      const email = row['Email'] || null
      const so_dien_thoai = row['Số điện thoại'] || null
      const dia_chi = row['Địa chỉ'] || null
      const khoa_hoc = row['Khóa học'] || null
      const tenKhoa = String(row['Khoa'] || '').trim()
      const tenNganh = String(row['Ngành'] || '').trim()
      const tenLop = String(row['Lớp'] || '').trim()

      // === Kiểm tra bắt buộc ===
      if (!ma_sv || !ho_ten || !ngay_sinh || !gioi_tinh || !email || !so_dien_thoai || !dia_chi || !khoa_hoc || !tenKhoa || !tenNganh || !tenLop) {
        errors.push({ dòng: index + 2, lỗi: ['Thiếu thông tin bắt buộc.'] })
        continue
      }

      // === Tuổi hợp lệ ===
      const birthYear = Number(String(ngay_sinh).slice(0, 4))
      const currentYear = new Date().getFullYear()
      if (currentYear - birthYear < 18) {
        errors.push({ dòng: index + 2, lỗi: ['Tuổi phải >= 18.'] })
        continue
      }

      // === Kiểm tra tồn tại Khoa ===
      const [khoaRows] = await pool.query('SELECT id FROM Khoa WHERE ten_khoa = ?', [tenKhoa])
      if (!khoaRows.length) {
        errors.push({ dòng: index + 2, lỗi: [`Khoa '${tenKhoa}' không tồn tại.`] })
        continue
      }
      const khoa_id = khoaRows[0].id

      // === Kiểm tra tồn tại Ngành ===
      const [nganhRows] = await pool.query('SELECT id FROM Nganh WHERE ten_nganh = ? AND khoa_id = ?', [tenNganh, khoa_id])
      if (!nganhRows.length) {
        errors.push({ dòng: index + 2, lỗi: [`Ngành '${tenNganh}' không thuộc khoa '${tenKhoa}'.`] })
        continue
      }
      const nganh_id = nganhRows[0].id

      // === Kiểm tra tồn tại Lớp ===
      const [lopRows] = await pool.query('SELECT id FROM Lop WHERE ten_lop = ? AND nganh_id = ?', [tenLop, nganh_id])
      if (!lopRows.length) {
        errors.push({ dòng: index + 2, lỗi: [`Lớp '${tenLop}' không thuộc ngành '${tenNganh}'.`] })
        continue
      }
      const lop_id = lopRows[0].id

      // === Kiểm tra sinh viên đã tồn tại ===
      const [exists] = await pool.query('SELECT id FROM SinhVien WHERE ma_sv = ?', [ma_sv])
      if (exists.length) {
        errors.push({ dòng: index + 2, lỗi: [`Mã SV '${ma_sv}' đã tồn tại.`] })
        continue
      }

      // === Thêm sinh viên ===
      await pool.query(
        `INSERT INTO SinhVien (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, khoa_id, nganh_id, lop_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc, khoa_id, nganh_id, lop_id]
      )
      added++
    }

    res.json({ message: `Đã thêm ${added} sinh viên.`, lỗi: errors })
  } catch (err) {
    console.error('❌ Lỗi import:', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi import file.' })
  }
}

// ======= TẢI FILE MẪU EXCEL =======
export async function downloadTemplate(req, res) {
  try {
    const data = [
      {
        'Mã SV': 'SV001',
        'Họ tên': 'Nguyễn Văn A',
        'Ngày sinh': '2003-05-12',
        'Giới tính': 'Nam',
        'Email': 'example@gmail.com',
        'Số điện thoại': '0909123456',
        'Địa chỉ': '123 Đường ABC, Quận 1, TP.HCM',
        'Khóa học': 'K47',
        'Khoa': 'Công nghệ thông tin',
        'Ngành': 'Kỹ thuật phần mềm',
        'Lớp': 'DHKTPM18BTT'
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