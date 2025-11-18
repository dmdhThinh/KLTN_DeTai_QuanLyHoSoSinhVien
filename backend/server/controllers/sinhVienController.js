// server/controllers/sinhVienController.js
import { pool } from '../config/db.js'   // ✅ Đúng cú pháp với export const pool
import * as SinhVienModel from '../models/sinhvien.js'
import { createAccount, deleteAccount } from '../models/taikhoan.js'

// GET ALL (có lọc theo Khoa, Ngành, Lớp)
export const getAll = async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      limit = 10,
      sort = 'desc',
      khoaId,
      nganhId,
      lopId
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)
    const where = []
    const params = []

    // Tìm kiếm theo mã SV hoặc họ tên
    if (q) {
      if (/^sv\d+/i.test(q)) {
        where.push('sv.ma_sv = ?')
        params.push(q)
      } else {
        where.push('sv.ho_ten LIKE ?')
        params.push(`%${q}%`)
      }
    }

    // Lọc theo khoa/ngành/lớp
    if (khoaId) {
      where.push('k.id = ?')
      params.push(Number(khoaId))
    }
    if (nganhId) {
      where.push('n.id = ?')
      params.push(Number(nganhId))
    }
    if (lopId) {
      where.push('l.id = ?')
      params.push(Number(lopId))
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // ✅ Lấy danh sách sinh viên kèm Khoa - Ngành - Lớp
    const [rows] = await pool.query(
      `
      SELECT 
        sv.id,
        sv.ma_sv AS maSv,
        sv.ho_ten AS hoTen,
        DATE_FORMAT(sv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
        sv.gioi_tinh AS gioiTinh,
        sv.khoa_hoc AS khoaHoc,
        sv.email,
        sv.so_dien_thoai AS soDienThoai,
        sv.dia_chi AS diaChi,
        l.ten_lop AS tenLop,
        n.ten_nganh AS tenNganh,
        k.ten_khoa AS tenKhoa
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      ${whereSQL}
      ORDER BY sv.id ${String(sort).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    )

    // ✅ Tổng số dòng
    const [[{ total } = { total: 0 }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      ${whereSQL}
      `,
      params
    )

    return res.json({
      data: rows || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / Number(limit)))
      }
    })
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách sinh viên:', err)
    return res.status(500).json({ message: 'Lỗi lấy danh sách sinh viên' })
  }
}


// server/controllers/sinhVienController.js  (bổ sung trong getById)
export const getById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `
      SELECT 
        sv.id,
        sv.ma_sv AS maSv,
        sv.ho_ten AS hoTen,
        DATE_FORMAT(sv.ngay_sinh, '%Y-%m-%d') AS ngaySinh,
        sv.gioi_tinh AS gioiTinh,
        sv.can_cuoc_cong_dan AS cccd,
        sv.email,
        sv.so_dien_thoai AS soDienThoai,
        sv.dia_chi AS diaChi,
        sv.khoa_hoc AS khoaHoc,
        sv.anh_the AS anhThe,
        sv.khoa_id AS khoaId,
        sv.nganh_id AS nganhId,
        sv.lop_id AS lopId,
        k.ten_khoa AS tenKhoa,
        n.ten_nganh AS tenNganh,
        l.ten_lop AS tenLop
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON l.nganh_id = n.id
      LEFT JOIN Khoa k ON n.khoa_id = k.id
      WHERE sv.id = ?
      `,
      [Number(id)]
    )

    const sinhVien = rows[0]
    if (!sinhVien) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })

    // 👉 lấy người thân
    const [rels] = await pool.query(
      `SELECT quan_he, ho_ten, can_cuoc_cong_dan, so_dien_thoai, 
              DATE_FORMAT(ngay_sinh, '%Y-%m-%d') AS ngay_sinh, 
              nghe_nghiep, email, dia_chi
       FROM NguoiThan WHERE sinh_vien_id = ?`,
      [Number(id)]
    )

    const nguoiThan = {
      cha: {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '',
        so_dien_thoai: '', email: '', dia_chi: ''
      },
      me:  {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '',
        so_dien_thoai: '', email: '', dia_chi: ''
      },
      nguoiGiamHo: {
        ho_ten: '', cccd: '', ngay_sinh: '', nghe_nghiep: '',
        so_dien_thoai: '', email: '', dia_chi: ''
      }
    }

    for (const r of rels) {
      const obj = {
        ho_ten: r.ho_ten || '',
        cccd: r.can_cuoc_cong_dan || '',
        ngay_sinh: r.ngay_sinh || '',
        nghe_nghiep: r.nghe_nghiep || '',
        so_dien_thoai: r.so_dien_thoai || '',
        email: r.email || '',
        dia_chi: r.dia_chi || ''
      }
      if (r.quan_he === 'Cha') nguoiThan.cha = obj
      else if (r.quan_he === 'Mẹ') nguoiThan.me = obj
      else if (r.quan_he === 'Người giám hộ') nguoiThan.nguoiGiamHo = obj
    }

    return res.json({ ...sinhVien, nguoiThan })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Lỗi lấy thông tin sinh viên' })
  }
}


export const create = async (req, res) => {
  const conn = await pool.getConnection();        // dùng transaction
  try {
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh, cccd,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the,
      nguoi_than                      // có thể là array hoặc object {cha, me}
    } = req.body || {};

    if (!ma_sv || !ho_ten || !ngay_sinh) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' });
    }

    // trùng mã SV?
    const isDup = await SinhVienModel.isMaSvExists(ma_sv);
    if (isDup) return res.status(400).json({ message: 'Mã sinh viên đã tồn tại.' });

    await conn.beginTransaction();

    // 1) Tạo sinh viên
    const [rs] = await conn.query(
      `INSERT INTO SinhVien
       (ma_sv, ho_ten, ngay_sinh, gioi_tinh, can_cuoc_cong_dan, email, so_dien_thoai, dia_chi, khoa_hoc,
        khoa_id, nganh_id, lop_id, anh_the)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ma_sv, ho_ten, ngay_sinh, gioi_tinh || null, cccd || null, email || null, so_dien_thoai || null,
       dia_chi || null, khoa_hoc || null, khoa_id || null, nganh_id || null, lop_id || null, anh_the || null]
    );
    const newId = rs.insertId;

    // 2) Chuẩn hoá "nguoi_than" -> mảng
    let relatives = [];
    if (Array.isArray(nguoi_than)) relatives = nguoi_than;
    else if (nguoi_than && typeof nguoi_than === 'object') {
      // dạng { cha: {...}, me: {...} }
      if (nguoi_than.cha) relatives.push({ quan_he: 'Cha', ...nguoi_than.cha });
      if (nguoi_than.me)  relatives.push({ quan_he: 'Mẹ',  ...nguoi_than.me  });
    }

    // 3) Chèn vào bảng NguoiThan (đúng tên cột trong schema)
    if (relatives.length) {
      const sql = `
        INSERT INTO NguoiThan
        (sinh_vien_id, quan_he, ho_ten, can_cuoc_cong_dan, so_dien_thoai, ngay_sinh, nghe_nghiep, email, dia_chi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      for (const r of relatives) {
        await conn.query(sql, [
          newId,
          r.quan_he || 'Người giám hộ',                       // 'Cha' | 'Mẹ' | 'Người giám hộ'
          r.ho_ten || null,
          r.cccd || r.can_cuoc_cong_dan || null,              // map cccd -> can_cuoc_cong_dan
          r.so_dien_thoai || null,
          r.ngay_sinh || null,                                 // kiểu DATE
          r.nghe_nghiep || null,
          r.email || null,
          r.dia_chi || null
        ]);
      }
    }

    await conn.commit();

    // 4) Tạo tài khoản (làm sau commit để không khoá transaction lâu)
    try {
      const item = await SinhVienModel.getSinhVienDetailById(newId);
      const accId = await createAccount({
        username: item.maSv,
        ho_ten: item.hoTen,
        password: '123456',
        role: 'Sinh viên',
        trang_thai: 'Hoạt động'
      });
      await pool.query('UPDATE SinhVien SET tai_khoan_id = ? WHERE id = ?', [accId, newId]);
    } catch (e) {
      console.error('⚠️ Lỗi tạo tài khoản SV:', e);
    }

    return res.status(201).json({ id: newId, message: 'Tạo sinh viên + người thân thành công' });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error('❌ Lỗi tạo SV:', err);
    return res.status(500).json({ message: 'Lỗi tạo sinh viên' });
  } finally {
    if (conn) conn.release();
  }
};



export const update = async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { id } = req.params
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh, cccd,
      email, so_dien_thoai, dia_chi, khoa_hoc,
      khoa_id, nganh_id, lop_id, anh_the,
      nguoi_than
    } = req.body || {}

    await conn.beginTransaction()

    // 1) cập nhật sinh viên
    await conn.query(
      `UPDATE SinhVien SET 
         ma_sv=?, ho_ten=?, ngay_sinh=?, gioi_tinh=?, can_cuoc_cong_dan=?, email=?, so_dien_thoai=?, 
         dia_chi=?, khoa_hoc=?, khoa_id=?, nganh_id=?, lop_id=?, anh_the=?
       WHERE id=?`,
      [
        ma_sv, ho_ten, ngay_sinh || null, gioi_tinh || null, cccd || null, email || null, so_dien_thoai || null,
        dia_chi || null, khoa_hoc || null, khoa_id || null, nganh_id || null, lop_id || null, anh_the || null,
        Number(id)
      ]
    )

    // 2) chuẩn hoá relatives
    let relatives = []
    if (Array.isArray(nguoi_than)) relatives = nguoi_than
    else if (nguoi_than && typeof nguoi_than === 'object') {
      if (nguoi_than.cha) relatives.push({ quan_he: 'Cha', ...nguoi_than.cha })
      if (nguoi_than.me)  relatives.push({ quan_he: 'Mẹ',  ...nguoi_than.me  })
    }

    // 3) xoá cũ, chèn mới
    await conn.query('DELETE FROM NguoiThan WHERE sinh_vien_id = ?', [Number(id)])

    if (relatives.length) {
      const sql = `
        INSERT INTO NguoiThan
        (sinh_vien_id, quan_he, ho_ten, can_cuoc_cong_dan, so_dien_thoai, ngay_sinh, nghe_nghiep, email, dia_chi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      for (const r of relatives) {
        await conn.query(sql, [
          Number(id),
          r.quan_he || 'Người giám hộ',
          r.ho_ten || null,
          r.cccd || r.can_cuoc_cong_dan || null,
          r.so_dien_thoai || null,
          r.ngay_sinh || null,
          r.nghe_nghiep || null,
          r.email || null,
          r.dia_chi || null
        ])
      }
    }

    await conn.commit()
    return res.json({ message: 'Cập nhật sinh viên + người thân thành công' })
  } catch (err) {
    try { await conn.rollback() } catch {}
    console.error('❌ Lỗi cập nhật SV:', err)
    return res.status(500).json({ message: 'Lỗi cập nhật sinh viên' })
  } finally {
    conn.release()
  }
}


export const remove = async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { id } = req.params
    const studentId = Number(id)
 
    await conn.beginTransaction()

    // Lấy tai_khoan_id của sinh viên
    const [rows] = await conn.query('SELECT tai_khoan_id FROM SinhVien WHERE id = ?', [studentId])
    const taiKhoanId = rows[0]?.tai_khoan_id

    // Xóa các bản ghi liên quan không có ON DELETE CASCADE
    await conn.query('DELETE FROM ThongBao_DaDoc WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM DangKyHocPhan WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM HoSoHanhChinh WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM HocPhi WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM KeHoachHocTap WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM KetQuaHocTap WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM RenLuyen WHERE sinh_vien_id = ?', [studentId])
    await conn.query('DELETE FROM ThamGiaHoatDong WHERE sinh_vien_id = ?', [studentId])

    // Xóa sinh viên (các bảng có ON DELETE CASCADE sẽ tự xóa)
    await conn.query('DELETE FROM SinhVien WHERE id = ?', [studentId])

    await conn.commit()

    // Nếu có tài khoản, xóa tài khoản sau
    if (taiKhoanId) {
      await deleteAccount(taiKhoanId)
    }

    return res.status(204).send()
  } catch (err) {
    try { await conn.rollback() } catch {}
    console.error(err)
    return res.status(500).json({ message: 'Lỗi xoá sinh viên' })
  } finally {
    conn.release()
  }
}
export const removeMany = async (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Thiếu danh sách id cần xoá.' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // lấy các tài khoản liên quan
    const [acc] = await conn.query(
      'SELECT tai_khoan_id FROM SinhVien WHERE id IN (?)',
      [ids]
    )
    const accountIds = (acc || []).map(r => r.tai_khoan_id).filter(Boolean)

    // xoá các bản ghi liên quan không có ON DELETE CASCADE
    await conn.query('DELETE FROM ThongBao_DaDoc WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM DangKyHocPhan WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM HoSoHanhChinh WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM HocPhi WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM KeHoachHocTap WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM KetQuaHocTap WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM RenLuyen WHERE sinh_vien_id IN (?)', [ids])
    await conn.query('DELETE FROM ThamGiaHoatDong WHERE sinh_vien_id IN (?)', [ids])

    // xoá sinh viên (các bảng có ON DELETE CASCADE như NguoiThan sẽ tự xoá)
    await conn.query('DELETE FROM SinhVien WHERE id IN (?)', [ids])

    // xoá tài khoản
    if (accountIds.length) {
      await conn.query('DELETE FROM TaiKhoan WHERE id IN (?)', [accountIds])
    }

    await conn.commit()
    return res.json({ deleted: ids.length })
  } catch (err) {
    try { await conn.rollback() } catch {}
    console.error('❌ Bulk delete error:', err)
    return res.status(500).json({ message: 'Lỗi xoá nhiều sinh viên' })
  } finally {
    conn.release()
  }
}

// Upload ảnh thẻ sinh viên lên S3
export const uploadStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params
    
    console.log('🚀 Upload request received:', {
      studentId: id,
      hasFile: !!req.file,
      body: req.body
    })
    
    // Kiểm tra file có được upload không
    if (!req.file) {
      console.error('❌ Không có file trong request')
      return res.status(400).json({ message: 'Không có file ảnh được upload' })
    }

    console.log('📁 File info:', {
      key: req.file.key,
      location: req.file.location,
      size: req.file.size,
      mimetype: req.file.mimetype
    })

    // URL ảnh từ S3
    const photoUrl = req.file.location

    // Cập nhật URL ảnh vào database
    const [result] = await pool.query(
      'UPDATE SinhVien SET anh_the = ? WHERE id = ?',
      [photoUrl, Number(id)]
    )

    console.log('✅ Updated database:', {
      affectedRows: result.affectedRows,
      url: photoUrl
    })

    return res.json({
      message: 'Upload ảnh thẻ thành công',
      url: photoUrl
    })
  } catch (err) {
    console.error('❌ Lỗi upload ảnh thẻ:', err)
    console.error('Error stack:', err.stack)
    return res.status(500).json({ 
      message: 'Lỗi upload ảnh thẻ',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Kiểm tra trùng lặp mã SV, SĐT, Email
export const checkDuplicate = async (req, res) => {
  try {
    const { ma_sv, so_dien_thoai, email, exclude_id } = req.query
    const errors = []

    // Kiểm tra mã sinh viên trùng
    if (ma_sv) {
      let query = 'SELECT id FROM SinhVien WHERE ma_sv = ?'
      const params = [ma_sv]
      
      if (exclude_id) {
        query += ' AND id != ?'
        params.push(Number(exclude_id))
      }
      
      const [rows] = await pool.query(query, params)
      if (rows.length > 0) {
        errors.push({ field: 'ma_sv', message: 'Mã sinh viên đã tồn tại.' })
      }
    }

    // Kiểm tra số điện thoại trùng
    if (so_dien_thoai) {
      let query = 'SELECT id FROM SinhVien WHERE so_dien_thoai = ?'
      const params = [so_dien_thoai]
      
      if (exclude_id) {
        query += ' AND id != ?'
        params.push(Number(exclude_id))
      }
      
      const [rows] = await pool.query(query, params)
      if (rows.length > 0) {
        errors.push({ field: 'so_dien_thoai', message: 'Số điện thoại đã được sử dụng.' })
      }
    }

    // Kiểm tra email trùng
    if (email) {
      let query = 'SELECT id FROM SinhVien WHERE email = ?'
      const params = [email]
      
      if (exclude_id) {
        query += ' AND id != ?'
        params.push(Number(exclude_id))
      }
      
      const [rows] = await pool.query(query, params)
      if (rows.length > 0) {
        errors.push({ field: 'email', message: 'Email đã được sử dụng.' })
      }
    }

    // Trả về kết quả
    if (errors.length > 0) {
      return res.status(200).json({ 
        isDuplicate: true, 
        errors 
      })
    }

    return res.status(200).json({ 
      isDuplicate: false, 
      errors: [] 
    })

  } catch (err) {
    console.error('❌ Lỗi kiểm tra trùng lặp:', err)
    return res.status(500).json({ message: 'Lỗi server khi kiểm tra trùng lặp' })
  }
}