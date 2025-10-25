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

// 📤 Nhập điểm từ file Excel
export async function importGrades(grades) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const sql = `
      INSERT INTO KetQuaHocTap (
        sinh_vien_id, hoc_phan_id,
        diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
        diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
        diem_giua_ky, diem_cuoi_ky,
        diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4,
        nam_hoc, hoc_ky
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_ly_thuyet_1 = COALESCE(VALUES(diem_ly_thuyet_1), diem_ly_thuyet_1),
        diem_ly_thuyet_2 = COALESCE(VALUES(diem_ly_thuyet_2), diem_ly_thuyet_2),
        diem_ly_thuyet_3 = COALESCE(VALUES(diem_ly_thuyet_3), diem_ly_thuyet_3),
        diem_ly_thuyet_4 = COALESCE(VALUES(diem_ly_thuyet_4), diem_ly_thuyet_4),
        diem_thuc_hanh_1 = COALESCE(VALUES(diem_thuc_hanh_1), diem_thuc_hanh_1),
        diem_thuc_hanh_2 = COALESCE(VALUES(diem_thuc_hanh_2), diem_thuc_hanh_2),
        diem_thuc_hanh_3 = COALESCE(VALUES(diem_thuc_hanh_3), diem_thuc_hanh_3),
        diem_giua_ky     = COALESCE(VALUES(diem_giua_ky),     diem_giua_ky),
        diem_cuoi_ky     = COALESCE(VALUES(diem_cuoi_ky),     diem_cuoi_ky),
        -- cập nhật các cột tính toán khi có điểm cuối kỳ
        diem_tong_ket = COALESCE(VALUES(diem_tong_ket), diem_tong_ket),
        diem_chu      = COALESCE(VALUES(diem_chu),      diem_chu),
        hoc_luc       = COALESCE(VALUES(hoc_luc),       hoc_luc),
        xep_loai      = COALESCE(VALUES(xep_loai),      xep_loai),
        dat           = COALESCE(VALUES(dat),           dat),
        diem_thang_4  = COALESCE(VALUES(diem_thang_4),  diem_thang_4)
    `;

    for (const g of grades) {
      // ✅ Đặt mặc định năm học / học kỳ NGAY TRONG VÒNG LẶP
      const namHoc = g.nam_hoc ?? '2025-2026';
      const hocKy = g.hoc_ky ?? 'HK1';

      const vals = [
        g.sinh_vien_id, g.hoc_phan_id,
        g.diem_ly_thuyet_1 ?? null, g.diem_ly_thuyet_2 ?? null, g.diem_ly_thuyet_3 ?? null, g.diem_ly_thuyet_4 ?? null,
        g.diem_thuc_hanh_1 ?? null, g.diem_thuc_hanh_2 ?? null, g.diem_thuc_hanh_3 ?? null,
        g.diem_giua_ky ?? null, g.diem_cuoi_ky ?? null,
        g.diem_tong_ket ?? null, g.diem_chu ?? null, g.hoc_luc ?? null, g.xep_loai ?? null, g.dat ?? null, g.diem_thang_4 ?? null,
        namHoc, hocKy
      ];

      await conn.execute(sql, vals);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('❌ importGrades upsert error:', err);
    throw err;
  } finally {
    conn.release();
  }
}



// 📚 Lấy điểm theo sinh viên
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
    `, [sinhVienId]);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi khi lấy điểm theo sinh viên:', err);
    throw err;
  }
}
