// server/controllers/importController.js
import multer from 'multer'
import * as xlsx from 'xlsx'
import { pool } from '../config/db.js'
import { createAccount } from '../models/taikhoan.js'

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

// ===== Import sinh viên (có phụ huynh) =====
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
      const line = index + 2
      const ma_sv = String(row['Mã SV'] || '').trim()
      const ho_ten = String(row['Họ tên'] || '').trim()
      const cccd = String(row['CCCD'] || '').trim() || null
      const ngay_sinh = row['Ngày sinh']
      const gioi_tinh = row['Giới tính'] || null
      const email = row['Email'] || null
      const so_dien_thoai = row['Số điện thoại'] || null
      const dia_chi = row['Địa chỉ'] || null
      const khoa_hoc = row['Khóa học'] || null
      const tenKhoa = String(row['Khoa'] || '').trim()
      const tenNganh = String(row['Ngành'] || '').trim()
      const tenLop = String(row['Lớp'] || '').trim()

      // ✅ Thông tin Cha
      const cha = {
        ho_ten: row['Họ tên cha'] || null,
        cccd: row['CCCD cha'] || null,
        ngay_sinh: row['Ngày sinh cha'] || null,
        nghe_nghiep: row['Nghề nghiệp cha'] || null,
        so_dien_thoai: row['SĐT cha'] || null,
        email: row['Email cha'] || null,
        dia_chi: row['Địa chỉ cha'] || null
      }

      // ✅ Thông tin Mẹ
      const me = {
        ho_ten: row['Họ tên mẹ'] || null,
        cccd: row['CCCD mẹ'] || null,
        ngay_sinh: row['Ngày sinh mẹ'] || null,
        nghe_nghiep: row['Nghề nghiệp mẹ'] || null,
        so_dien_thoai: row['SĐT mẹ'] || null,
        email: row['Email mẹ'] || null,
        dia_chi: row['Địa chỉ mẹ'] || null
      }

      if (!ma_sv || !ho_ten || !ngay_sinh || !tenKhoa || !tenNganh || !tenLop) {
        errors.push({ dòng: line, lỗi: 'Thiếu thông tin bắt buộc.' })
        continue
      }

      // Chuẩn hoá ngày sinh
      let ngaySinhISO = null
      try {
        if (typeof ngay_sinh === 'number') {
          const d = xlsx.SSF.parse_date_code(ngay_sinh)
          ngaySinhISO = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
        } else {
          const d = new Date(ngay_sinh)
          if (Number.isNaN(d.getTime())) throw new Error()
          ngaySinhISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        }
      } catch {
        errors.push({ dòng: line, lỗi: 'Ngày sinh không hợp lệ.' })
        continue
      }

      const gioiTinhEnum = ['Nam','Nữ','Khác'].includes((gioi_tinh||'').toString().trim()) ? (gioi_tinh||'').toString().trim() : null

      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()

        const [khoaRows]  = await conn.query('SELECT id FROM Khoa  WHERE ten_khoa  = ?', [tenKhoa])
        if (!khoaRows.length) throw new Error(`Khoa '${tenKhoa}' không tồn tại.`)
        const khoa_id = khoaRows[0].id

        const [nganhRows] = await conn.query('SELECT id FROM Nganh WHERE ten_nganh = ? AND khoa_id = ?', [tenNganh, khoa_id])
        if (!nganhRows.length) throw new Error(`Ngành '${tenNganh}' không thuộc khoa '${tenKhoa}'.`)
        const nganh_id = nganhRows[0].id

        const [lopRows]   = await conn.query('SELECT id FROM Lop WHERE ten_lop = ? AND nganh_id = ?', [tenLop, nganh_id])
        if (!lopRows.length) throw new Error(`Lớp '${tenLop}' không thuộc ngành '${tenNganh}'.`)
        const lop_id = lopRows[0].id

        const [exists] = await conn.query('SELECT id FROM SinhVien WHERE ma_sv = ?', [ma_sv])
        if (exists.length) throw new Error(`Mã SV '${ma_sv}' đã tồn tại.`)

        // 🔑 Tài khoản sinh viên
        const [accIns] = await conn.query(
          `INSERT INTO TaiKhoan (username, password_hash, role, trang_thai, ho_ten, da_doi_mat_khau)
           VALUES (?, ?, 'Sinh viên', 'Hoạt động', ?, 0)
           ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), ho_ten = VALUES(ho_ten)`,
          [ma_sv, '123456', ho_ten]
        )
        const tai_khoan_id = accIns.insertId

        // 🧑‍🎓 Thêm sinh viên
        const [rs] = await conn.query(
          `INSERT INTO SinhVien
            (ma_sv, ho_ten, can_cuoc_cong_dan, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, khoa_hoc,
             khoa_id, nganh_id, lop_id, tai_khoan_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ma_sv, ho_ten, cccd, ngaySinhISO, gioiTinhEnum, email, so_dien_thoai, dia_chi, khoa_hoc,
           khoa_id, nganh_id, lop_id, tai_khoan_id]
        )
        const sinh_vien_id = rs.insertId

        // 👨‍👩‍👧 Thêm người thân (Cha/Mẹ)
        const nguoiThanSQL = `
          INSERT INTO NguoiThan
          (sinh_vien_id, quan_he, ho_ten, can_cuoc_cong_dan, ngay_sinh, nghe_nghiep, so_dien_thoai, email, dia_chi)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        if (cha.ho_ten)
          await conn.query(nguoiThanSQL, [
            sinh_vien_id, 'Cha', cha.ho_ten, cha.cccd, cha.ngay_sinh, cha.nghe_nghiep, cha.so_dien_thoai, cha.email, cha.dia_chi
          ])
        if (me.ho_ten)
          await conn.query(nguoiThanSQL, [
            sinh_vien_id, 'Mẹ', me.ho_ten, me.cccd, me.ngay_sinh, me.nghe_nghiep, me.so_dien_thoai, me.email, me.dia_chi
          ])

        await conn.commit()
        added++
      } catch (e) {
        await conn.rollback()
        errors.push({ dòng: line, lỗi: e.message })
      } finally {
        conn.release()
      }
    }

    return res.json({ message: `Đã thêm ${added} sinh viên.`, lỗi: errors })
  } catch (err) {
    console.error('❌ Lỗi import:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi import file.' })
  }
}



// ======= TẢI FILE MẪU EXCEL SINH VIÊN =======
export async function downloadTemplate(req, res) {
  try {
    const data = [
      {
        'Mã SV': 'SV001',
        'Họ tên': 'Nguyễn Văn A',
        'CCCD': '012345678900',
        'Ngày sinh': '2003-05-12',
        'Giới tính': 'Nam',
        'Email': 'example@gmail.com',
        'Số điện thoại': '0909123456',
        'Địa chỉ': '123 Đường ABC, Quận 1, TP.HCM',
        'Khóa học': 'K47',
        'Khoa': 'Công nghệ thông tin',
        'Ngành': 'Kỹ thuật phần mềm',
        'Lớp': 'DHKTPM18BTT',
        // ✅ Thông tin Cha
        'Họ tên cha': 'Nguyễn Văn B',
        'CCCD cha': '012345678901',
        'Ngày sinh cha': '1975-06-20',
        'Nghề nghiệp cha': 'Kỹ sư',
        'SĐT cha': '0909555666',
        'Email cha': 'cha@gmail.com',
        'Địa chỉ cha': '123 Đường ABC, Quận 1, TP.HCM',
        // ✅ Thông tin Mẹ
        'Họ tên mẹ': 'Trần Thị C',
        'CCCD mẹ': '012345678902',
        'Ngày sinh mẹ': '1977-03-15',
        'Nghề nghiệp mẹ': 'Giáo viên',
        'SĐT mẹ': '0909777888',
        'Email mẹ': 'me@gmail.com',
        'Địa chỉ mẹ': '123 Đường ABC, Quận 1, TP.HCM'
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
