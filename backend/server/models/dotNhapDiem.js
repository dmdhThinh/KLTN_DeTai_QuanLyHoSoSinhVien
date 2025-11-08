import { pool } from '../config/db.js';

// Lấy trạng thái đợt nhập điểm theo học kỳ + năm học
export async function getTrangThaiDotNhapDiem(hocKy, namHoc) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM DotNhapDiem WHERE hoc_ky = ? AND nam_hoc = ?`,
      [hocKy, namHoc]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('❌ Lỗi lấy trạng thái đợt nhập điểm:', err);
    throw err;
  }
}

// Lấy tất cả đợt nhập điểm (cho admin)
export async function getAllDotNhapDiem() {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM DotNhapDiem ORDER BY nam_hoc DESC, hoc_ky ASC`
    );
    return rows;
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách đợt nhập điểm:', err);
    throw err;
  }
}

// Cập nhật trạng thái đợt nhập điểm (cho admin)
export async function updateTrangThaiDot(hocKy, namHoc, trangThai) {
  try {
    const [result] = await pool.execute(
      `UPDATE DotNhapDiem 
       SET trang_thai = ?, updated_at = NOW()
       WHERE hoc_ky = ? AND nam_hoc = ?`,
      [trangThai, hocKy, namHoc]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái đợt:', err);
    throw err;
  }
}

// Tạo đợt nhập điểm mới (cho admin)
export async function createDotNhapDiem(hocKy, namHoc, ghiChu) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO DotNhapDiem (hoc_ky, nam_hoc, trang_thai, ghi_chu)
       VALUES (?, ?, 'CHUA_MO', ?)`,
      [hocKy, namHoc, ghiChu || `Học kỳ ${hocKy} năm học ${namHoc}`]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi tạo đợt nhập điểm:', err);
    throw err;
  }
}

// Xóa đợt nhập điểm (cho admin)
export async function deleteDotNhapDiem(hocKy, namHoc) {
  try {
    const [result] = await pool.execute(
      `DELETE FROM DotNhapDiem WHERE hoc_ky = ? AND nam_hoc = ?`,
      [hocKy, namHoc]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi xóa đợt nhập điểm:', err);
    throw err;
  }
}
