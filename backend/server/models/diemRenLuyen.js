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

// 📋 Lấy danh sách điểm rèn luyện (có phân trang và filter)
export async function getDiemRenLuyenList({ hoc_ky, nam_hoc, page = 1, limit = 50 }) {
  try {
    let query = `
      SELECT 
        drl.id,
        drl.hoc_ky,
        drl.nam_hoc,
        drl.so_diem,
        drl.xep_loai,
        sv.ma_sv,
        sv.ho_ten,
        sv.lop_id,
        l.ten_lop
      FROM DiemRenLuyen drl
      INNER JOIN SinhVien sv ON drl.sinh_vien_id = sv.id
      LEFT JOIN Lop l ON sv.lop_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (hoc_ky) {
      query += ' AND drl.hoc_ky = ?';
      params.push(hoc_ky);
    }

    if (nam_hoc) {
      query += ' AND drl.nam_hoc = ?';
      params.push(nam_hoc);
    }

    query += ' ORDER BY drl.nam_hoc DESC, drl.hoc_ky DESC, sv.ma_sv ASC';

    // Đếm tổng số bản ghi
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Phân trang
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách điểm rèn luyện:', err);
    throw err;
  }
}
