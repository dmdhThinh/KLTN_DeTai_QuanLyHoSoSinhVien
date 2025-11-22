import { pool } from '../config/db.js';

// ➕ Thêm điểm số (UPSERT - CHỈ update các field KHÔNG NULL được gửi lên)
export async function createKetQuaHocTap(data) {
  const {
    sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc,
    diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
    diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
    diem_giua_ky, diem_cuoi_ky,
    diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4,
    tinh_diem = 1  // Mặc định là tính điểm
  } = data;

  try {
    const [result] = await pool.execute(
      `INSERT INTO KetQuaHocTap (
        sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc,
        diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
        diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
        diem_giua_ky, diem_cuoi_ky,
        diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4, tinh_diem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        diem_ly_thuyet_1 = COALESCE(VALUES(diem_ly_thuyet_1), diem_ly_thuyet_1),
        diem_ly_thuyet_2 = COALESCE(VALUES(diem_ly_thuyet_2), diem_ly_thuyet_2),
        diem_ly_thuyet_3 = COALESCE(VALUES(diem_ly_thuyet_3), diem_ly_thuyet_3),
        diem_ly_thuyet_4 = COALESCE(VALUES(diem_ly_thuyet_4), diem_ly_thuyet_4),
        diem_thuc_hanh_1 = COALESCE(VALUES(diem_thuc_hanh_1), diem_thuc_hanh_1),
        diem_thuc_hanh_2 = COALESCE(VALUES(diem_thuc_hanh_2), diem_thuc_hanh_2),
        diem_thuc_hanh_3 = COALESCE(VALUES(diem_thuc_hanh_3), diem_thuc_hanh_3),
        diem_giua_ky = COALESCE(VALUES(diem_giua_ky), diem_giua_ky),
        diem_cuoi_ky = COALESCE(VALUES(diem_cuoi_ky), diem_cuoi_ky),
        diem_tong_ket = VALUES(diem_tong_ket),
        diem_chu = VALUES(diem_chu),
        hoc_luc = VALUES(hoc_luc),
        xep_loai = VALUES(xep_loai),
        dat = VALUES(dat),
        diem_thang_4 = VALUES(diem_thang_4),
        tinh_diem = VALUES(tinh_diem)`,
      [
        sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc,
        diem_ly_thuyet_1, diem_ly_thuyet_2, diem_ly_thuyet_3, diem_ly_thuyet_4,
        diem_thuc_hanh_1, diem_thuc_hanh_2, diem_thuc_hanh_3,
        diem_giua_ky, diem_cuoi_ky,
        diem_tong_ket, diem_chu, hoc_luc, xep_loai, dat, diem_thang_4, tinh_diem
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

// ✏️ Cập nhật điểm số (CHỈ update các field được gửi lên)
export async function updateKetQuaHocTap(id, data) {
  try {
    // Tạo danh sách các cột cần update (chỉ những cột có giá trị)
    const updates = [];
    const values = [];
    
    // Các field điểm thành phần
    const scoreFields = [
      'diem_ly_thuyet_1', 'diem_ly_thuyet_2', 'diem_ly_thuyet_3', 'diem_ly_thuyet_4',
      'diem_thuc_hanh_1', 'diem_thuc_hanh_2', 'diem_thuc_hanh_3',
      'diem_giua_ky', 'diem_cuoi_ky'
    ];
    
    // Các field tính toán (luôn được backend tính lại)
    const calculatedFields = [
      'diem_tong_ket', 'diem_chu', 'hoc_luc', 'xep_loai', 'dat', 'diem_thang_4'
    ];
    
    // Thêm các field điểm thành phần (chỉ khi được gửi lên)
    scoreFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field] === '' ? null : data[field]);
      }
    });
    
    // Thêm các field tính toán (nếu có)
    calculatedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field] === '' ? null : data[field]);
      }
    });
    
    // Nếu không có gì để update
    if (updates.length === 0) {
      return { affectedRows: 0 };
    }
    
    // Thêm ID vào cuối
    values.push(id);
    
    const query = `UPDATE KetQuaHocTap SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    
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

// 🔄 Vô hiệu hóa điểm cũ khi học lại/cải thiện
export async function voHieuHoaDiemCu(sinhVienId, hocPhanId, idMoi) {
  try {
    const [result] = await pool.execute(
      `UPDATE KetQuaHocTap
       SET tinh_diem = 0
       WHERE sinh_vien_id = ?
         AND hoc_phan_id = ?
         AND id != ?`,
      [sinhVienId, hocPhanId, idMoi]
    );
    console.log(`[TINH_DIEM] Vô hiệu hóa ${result.affectedRows} điểm cũ của HP ${hocPhanId}`);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi vô hiệu hóa điểm cũ:', err);
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

