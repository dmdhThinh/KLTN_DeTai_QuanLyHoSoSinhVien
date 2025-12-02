import { pool } from '../config/db.js';

// 📥 Import điểm rèn luyện (Bulk Insert/Update)
export async function importDiemRenLuyen(dataList) {
  let successCount = 0;
  let errors = [];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const [index, item] of dataList.entries()) {
      try {
        // Tìm sinh viên theo mã
        const [svRows] = await connection.query(
          'SELECT id FROM SinhVien WHERE ma_sv = ?', 
          [item.ma_sv]
        );

        if (svRows.length === 0) {
          errors.push({ 
            dòng: index + 2, 
            lỗi: `Không tìm thấy sinh viên có mã "${item.ma_sv}"` 
          });
          continue;
        }

        const sinhVienId = svRows[0].id;

        // Insert hoặc Update
        await connection.query(`
          INSERT INTO DiemRenLuyen (sinh_vien_id, hoc_ky, nam_hoc, so_diem, xep_loai)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            so_diem = VALUES(so_diem),
            xep_loai = VALUES(xep_loai)
        `, [
          sinhVienId, 
          item.hoc_ky, 
          item.nam_hoc, 
          item.so_diem, 
          item.xep_loai
        ]);

        successCount++;
      } catch (err) {
        errors.push({ 
          dòng: index + 2, 
          lỗi: err.message 
        });
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { successCount, errors };
}

// 📋 Lấy điểm rèn luyện của sinh viên
export async function getDiemRenLuyen(sinhVienId, hocKy, namHoc) {
  try {
    let query = 'SELECT * FROM DiemRenLuyen WHERE sinh_vien_id = ?';
    const params = [sinhVienId];

    if (hocKy && namHoc) {
      query += ' AND hoc_ky = ? AND nam_hoc = ?';
      params.push(hocKy, namHoc);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi lấy điểm rèn luyện:', err);
    throw err;
  }
}
