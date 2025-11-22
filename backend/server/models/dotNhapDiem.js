import { pool } from '../config/db.js';

// Lấy trạng thái đợt nhập điểm theo học kỳ + năm học
export async function getTrangThaiDotNhapDiem(hocKy, namHoc) {
  try {
    // Tự động đóng đợt 1 nếu quá hạn
    await pool.execute(`
      UPDATE DotNhapDiem 
      SET trang_thai = 'DOT_1_DA_DONG', updated_at = NOW()
      WHERE hoc_ky = ? AND nam_hoc = ? 
      AND trang_thai = 'DOT_1_DANG_MO' 
      AND ngay_dong_dot_1 < NOW()
    `, [hocKy, namHoc]);

    // Tự động khóa nếu đợt 2 quá hạn
    await pool.execute(`
      UPDATE DotNhapDiem 
      SET trang_thai = 'DA_KHOA', updated_at = NOW()
      WHERE hoc_ky = ? AND nam_hoc = ? 
      AND trang_thai = 'DOT_2_DANG_MO' 
      AND ngay_dong_dot_2 < NOW()
    `, [hocKy, namHoc]);

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
    // Tự động đóng các đợt 1 đã quá hạn
    await pool.execute(`
      UPDATE DotNhapDiem 
      SET trang_thai = 'DOT_1_DA_DONG', updated_at = NOW()
      WHERE trang_thai = 'DOT_1_DANG_MO' 
      AND ngay_dong_dot_1 < NOW()
    `);

    // Tự động khóa các đợt 2 đã quá hạn
    await pool.execute(`
      UPDATE DotNhapDiem 
      SET trang_thai = 'DA_KHOA', updated_at = NOW()
      WHERE trang_thai = 'DOT_2_DANG_MO' 
      AND ngay_dong_dot_2 < NOW()
    `);

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
    let sql = `UPDATE DotNhapDiem SET trang_thai = ?, updated_at = NOW()`;
    const params = [trangThai];

    // Nếu mở đợt 1 => Set ngày mở là NOW, ngày đóng là 7 ngày sau
    if (trangThai === 'DOT_1_DANG_MO') {
      sql += `, ngay_mo_dot_1 = NOW(), ngay_dong_dot_1 = DATE_ADD(NOW(), INTERVAL 7 DAY)`;
    }
    // Nếu mở đợt 2 => Set ngày mở là NOW, ngày đóng là 7 ngày sau
    else if (trangThai === 'DOT_2_DANG_MO') {
      sql += `, ngay_mo_dot_2 = NOW(), ngay_dong_dot_2 = DATE_ADD(NOW(), INTERVAL 7 DAY)`;
    }

    sql += ` WHERE hoc_ky = ? AND nam_hoc = ?`;
    params.push(hocKy, namHoc);

    const [result] = await pool.execute(sql, params);
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
