import { pool } from '../config/db.js';

// ➕ Thêm điểm số
export async function createKetQuaHocTap(data) {
  const {
    sinh_vien_id, hoc_phan_id,
    diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
    diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
    diem_giua_ky, diem_cuoi_ky,
    diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4
  } = data;

  try {
    const [result] = await pool.execute(
      `INSERT INTO KetQuaHocTap (
        sinh_vien_id, hoc_phan_id,
        diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
        diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
        diem_giua_ky, diem_cuoi_ky,
        diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sinh_vien_id, hoc_phan_id,
        diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
        diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
        diem_giua_ky, diem_cuoi_ky,
        diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4
      ]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi thêm điểm:', err);
    throw err;
  }
}

// 📜 Lấy tất cả điểm số
export async function getAllKetQuaHocTap() {
  try {
    const [rows] = await pool.execute('SELECT * FROM KetQuaHocTap');
    return rows;
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách điểm:', err);
    throw err;
  }
}

// 🔍 Lấy điểm số theo ID
export async function getKetQuaHocTapById(id) {
  try {
    const [rows] = await pool.execute('SELECT * FROM KetQuaHocTap WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm theo ID:', err);
    throw err;
  }
}

// ✏️ Cập nhật điểm số
export async function updateKetQuaHocTap(id, data) {
  const safe = v => (v === undefined ? null : v);
  const {
    diem_giua_ky, diem_cuoi_ky,
    diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
    diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
    diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4
  } = data;

  try {
    const [result] = await pool.execute(
      `UPDATE KetQuaHocTap SET
        diem_giua_ky=?, diem_cuoi_ky=?,
        diem_ly_thuyet_1=?, diem_ly_thuyet_2=?, diem_ly_thuyet_3=?, diem_ly_thuyet_4=?,
        diem_thuc_hanh_1=?, diem_thuc_hanh_2=?, diem_thuc_hanh_3=?,
        diem_tong_ket=?, diem_chu=?, hoc_luc=?, xep_loai=?, dat=?, diem_thang_4=?
       WHERE id=?`,
      [
        safe(diem_giua_ky), safe(diem_cuoi_ky),
        safe(diem_ly_thuyet_1), safe(diem_ly_thuyet_2), safe(diem_ly_thuyet_3), safe(diem_ly_thuyet_4),
        safe(diem_thuc_hanh_1), safe(diem_thuc_hanh_2), safe(diem_thuc_hanh_3),
        safe(diem_tong_ket), safe(diem_chu), safe(hoc_luc), safe(xep_loai), safe(dat), safe(diem_thang_4), id
      ]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật điểm:', err);
    throw err;
  }
}

// ❌ Xóa điểm số
export async function deleteKetQuaHocTap(id) {
  try {
    const [result] = await pool.execute('DELETE FROM KetQuaHocTap WHERE id = ?', [id]);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi xóa điểm:', err);
    throw err;
  }
}

// 📚 Lấy điểm theo sinh viên
// 📚 Lấy điểm theo sinh viên (có học kỳ & năm học)
export async function getKetQuaHocTapBySinhVienId(sinhVienId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        kq.id,
        kq.sinh_vien_id,
        kq.hoc_phan_id,
        hp.ma_hoc_phan AS maLopHocPhan,
        hp.ten_hoc_phan AS tenMonHoc,
        hp.so_tin_chi AS soTinChi,
        kq.hoc_ky AS hocKy,
        kq.nam_hoc AS namHoc,
        kq.diem_ly_thuyet_1 AS diemThuongXuyen1,
        kq.diem_ly_thuyet_2 AS diemThuongXuyen2,
        kq.diem_ly_thuyet_3 AS diemThuongXuyen3,
        kq.diem_ly_thuyet_4 AS diemThuongXuyen4,
        kq.diem_thuc_hanh_1 AS diemThucHanh1,
        kq.diem_thuc_hanh_2 AS diemThucHanh2,
        kq.diem_thuc_hanh_3 AS diemThucHanh3,
        kq.diem_giua_ky AS diemGiuaKy,
        kq.diem_cuoi_ky AS diemCuoiKy,
        kq.diem_tong_ket AS diemTongKet,
        kq.diem_chu AS diemChu,
        kq.hoc_luc AS hocLuc,
        kq.xep_loai AS xepLoai,
        kq.dat AS dat,
        kq.diem_thang_4 AS diemThang4
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
      ORDER BY kq.nam_hoc ASC, kq.hoc_ky ASC
    `, [sinhVienId]);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm theo sinh viên:', err);
    throw err;
  }
}

