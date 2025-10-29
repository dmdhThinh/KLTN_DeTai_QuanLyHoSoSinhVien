// server/routes/importGiangVien.js
import { Router } from 'express'
import multer from 'multer'
import XLSX from 'xlsx'
import { pool } from '../config/db.js'
import path from 'path'
import fs from 'fs'
import { createAccount } from '../models/taikhoan.js'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// =======================================
// 📄 1️⃣ API: Tải file mẫu nhập giảng viên
// =======================================
router.get('/teachers/template', (req, res) => {
  const wsData = [
    [
      'ma_gv', 'ho_ten', 'email', 'so_dien_thoai',
      'gioi_tinh', 'ngay_sinh', 'dia_chi',
      'ten_khoa', 'ten_nganh', 'ten_lop', 'chuc_vu'
    ],
    [
      'GV001', 'Nguyễn Văn A', 'nva@iuh.edu.vn', '0901234567',
      'Nam', '1980-01-01', '123 Lê Lợi',
      'Công nghệ thông tin', 'Kỹ thuật phần mềm', 'DHKTPM16A', 'Giảng viên chính'
    ],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'GiangVienMau')

  const filePath = path.join('uploads', 'MauNhapGiangVien.xlsx')
  XLSX.writeFile(wb, filePath)

  res.download(filePath, 'MauNhapGiangVien.xlsx', () => fs.unlinkSync(filePath))
})

// =======================================
// 📥 2️⃣ API: Import danh sách giảng viên
// =======================================
router.post('/teachers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file nào được tải lên' })

    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    const errors = []
    let successCount = 0

    // Lấy danh sách Khoa, Ngành, Lớp để ánh xạ tên → id
    const [khoaList] = await pool.query('SELECT id, ten_khoa FROM Khoa')
    const [nganhList] = await pool.query('SELECT id, ten_nganh, khoa_id FROM Nganh')
    const [lopList] = await pool.query('SELECT id, ten_lop, nganh_id FROM Lop')

    for (let i = 0; i < sheet.length; i++) {
      const {
        ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh,
        ngay_sinh, dia_chi, ten_khoa, ten_nganh, ten_lop, chuc_vu
      } = sheet[i]

      // 🧩 Kiểm tra dữ liệu bắt buộc
      if (!ma_gv || !ho_ten || !ten_khoa) {
        errors.push({ dòng: i + 2, lỗi: 'Thiếu mã, họ tên hoặc tên khoa' })
        continue
      }

      // 🔍 Ánh xạ tên khoa/ngành/lớp sang id
      const khoa = khoaList.find(k =>
        k.ten_khoa.trim().toLowerCase() === ten_khoa.trim().toLowerCase()
      )
      if (!khoa) {
        errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Khoa "${ten_khoa}"` })
        continue
      }

      let nganhId = null
      if (ten_nganh) {
        const nganh = nganhList.find(n =>
          n.ten_nganh.trim().toLowerCase() === ten_nganh.trim().toLowerCase() &&
          n.khoa_id === khoa.id
        )
        if (!nganh) {
          errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Ngành "${ten_nganh}" trong "${ten_khoa}"` })
          continue
        }
        nganhId = nganh.id
      }

      let lopId = null
      if (ten_lop) {
        const lop = lopList.find(l =>
          l.ten_lop.trim().toLowerCase() === ten_lop.trim().toLowerCase() &&
          (!nganhId || l.nganh_id === nganhId)
        )
        if (!lop) {
          errors.push({ dòng: i + 2, lỗi: `Không tìm thấy Lớp "${ten_lop}" trong Ngành "${ten_nganh || '-'}"` })
          continue
        }
        lopId = lop.id
      }

      try {
        // ✅ 1. Thêm giảng viên
        const [rs] = await pool.execute(
          `INSERT INTO GiangVien 
           (ma_gv, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, dia_chi,
            khoa_id, nganh_id, lop_id, chuc_vu)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ma_gv, ho_ten, email || null, so_dien_thoai || null, gioi_tinh || null,
            ngay_sinh || null, dia_chi || null,
            khoa.id, nganhId, lopId, chuc_vu || null
          ]
        )
        successCount++

        // ✅ 2. Tạo tài khoản tự động
        try {
          const acc = await createAccount({
            username: ma_gv,
            ho_ten,
            password: '123456',
            role: 'Giảng viên',
            trang_thai: 'Hoạt động'
          })
          await pool.query('UPDATE GiangVien SET tai_khoan_id = ? WHERE id = ?', [acc.id, rs.insertId])
        } catch (accErr) {
          console.error(`⚠️ Lỗi tạo tài khoản GV ${ma_gv}:`, accErr.message)
        }
      } catch (err) {
        errors.push({ dòng: i + 2, lỗi: err.message })
      }
    }

    fs.unlinkSync(req.file.path)
    res.json({
      message: `Đã xử lý ${sheet.length} dòng.`,
      thành_công: successCount,
      lỗi: errors
    })
  } catch (err) {
    console.error('❌ Lỗi import giảng viên:', err)
    res.status(500).json({ message: 'Lỗi server khi import danh sách giảng viên' })
  }
})

export default router