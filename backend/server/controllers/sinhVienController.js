// server/controllers/sinhVienController.js
import { getSinhVienDetailById, isMaSvExists, createSinhVien } from '../models/sinhvien.js'
import { pool } from '../config/db.js'

export async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ message: 'ID không hợp lệ' })
    const data = await getSinhVienDetailById(id)
    if (!data) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}

// ====== Thêm mới sinh viên (Admin) ======
export async function create(req, res) {
  try {
    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, anh_the,
      khoa_hoc, khoa_id, nganh_id, lop_id, co_van_id
    } = req.body || {}

    // 1) Ràng buộc bắt buộc
    if (!ma_sv || !ho_ten || !ngay_sinh) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường bắt buộc: mã sinh viên, họ tên, ngày sinh.' })
    }

    // 2) Tuổi > 18 theo năm
    const birthYear = Number(String(ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    const ageByYear = currentYear - birthYear
    if (!(birthYear > 1900) || ageByYear <= 18) {
      return res.status(400).json({ message: 'Tuổi phải lớn hơn 18 (tính theo năm hiện tại trừ năm sinh).' })
    }

    // 3) Mã SV không trùng
    if (await isMaSvExists(ma_sv)) {
      return res.status(409).json({ message: 'Mã sinh viên đã tồn tại.' })
    }

    // 4) Tạo mới
    const newId = await createSinhVien({
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, anh_the,
      khoa_hoc, khoa_id, nganh_id, lop_id, co_van_id
    })

    // Trả về bản ghi vừa tạo (hoặc chỉ id)
    const created = await getSinhVienDetailById(newId)
    return res.status(201).json({ message: 'Tạo sinh viên thành công', data: created })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
// ======= LẤY DANH SÁCH SINH VIÊN =======
export async function getAll(req, res) {
  try {
    const search = req.query.q ? `%${req.query.q}%` : '%'

    const [rows] = await pool.execute(
      `SELECT id,
              ma_sv AS maSv,
              ho_ten AS hoTen,
              ngay_sinh AS ngaySinh,
              gioi_tinh AS gioiTinh,
              khoa_hoc AS khoaHoc
       FROM SinhVien
       WHERE ma_sv LIKE :search OR ho_ten LIKE :search
       ORDER BY id DESC`,
      { search }
    )

    return res.json(rows)
  } catch (err) {
    console.error('❌ Lỗi getAll SinhVien:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách sinh viên' })
  }
}
// ======= XOÁ SINH VIÊN =======
export async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res.status(400).json({ message: 'ID không hợp lệ' })
    }

    // Kiểm tra sinh viên có tồn tại không
    const [check] = await pool.execute('SELECT id FROM SinhVien WHERE id = :id', { id })
    if (check.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa' })
    }

    // Thực hiện xoá
    await pool.execute('DELETE FROM SinhVien WHERE id = :id', { id })
    return res.json({ message: 'Đã xoá sinh viên thành công' })
  } catch (err) {
    console.error('❌ Lỗi xoá sinh viên:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi xoá sinh viên' })
  }
}
// ======= CẬP NHẬT THÔNG TIN SINH VIÊN =======
export async function update(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res.status(400).json({ message: 'ID không hợp lệ' })
    }

    const {
      ma_sv, ho_ten, ngay_sinh, gioi_tinh,
      email, so_dien_thoai, dia_chi, anh_the, khoa_hoc
    } = req.body || {}

    if (!ma_sv || !ho_ten || !ngay_sinh) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường bắt buộc.' })
    }

    const birthYear = Number(String(ngay_sinh).slice(0, 4))
    const currentYear = new Date().getFullYear()
    if (currentYear - birthYear <= 18) {
      return res.status(400).json({ message: 'Tuổi phải lớn hơn 18.' })
    }

    // Kiểm tra mã SV trùng (trừ chính nó)
    const [exist] = await pool.execute(
      'SELECT id FROM SinhVien WHERE ma_sv = :ma_sv AND id <> :id LIMIT 1',
      { ma_sv, id }
    )
    if (exist.length > 0) {
      return res.status(409).json({ message: 'Mã sinh viên đã tồn tại.' })
    }

    await pool.execute(
  `UPDATE SinhVien
   SET ma_sv = :ma_sv,
       ho_ten = :ho_ten,
       ngay_sinh = :ngay_sinh,
       gioi_tinh = :gioi_tinh,
       email = :email,
       so_dien_thoai = :so_dien_thoai,
       dia_chi = :dia_chi,
       anh_the = :anh_the,
       khoa_hoc = :khoa_hoc
   WHERE id = :id`,
  {
    id,
    ma_sv: ma_sv ?? null,
    ho_ten: ho_ten ?? null,
    ngay_sinh: ngay_sinh ?? null,
    gioi_tinh: gioi_tinh ?? null,
    email: email ?? null,
    so_dien_thoai: so_dien_thoai ?? null,
    dia_chi: dia_chi ?? null,
    anh_the: anh_the ?? null,
    khoa_hoc: khoa_hoc ?? null
  }
)


    const [updated] = await pool.execute(
      `SELECT id, ma_sv AS maSv, ho_ten AS hoTen, ngay_sinh AS ngaySinh,
              gioi_tinh AS gioiTinh, khoa_hoc AS khoaHoc
       FROM SinhVien WHERE id = :id`, { id })

    return res.json({ message: 'Cập nhật thành công', data: updated[0] })
  } catch (err) {
    console.error('❌ Lỗi cập nhật sinh viên:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật sinh viên' })
  }
}
