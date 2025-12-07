import { pool } from '../config/db.js';

// 📥 Import chứng chỉ tiếng Anh (Bulk Insert/Update)
export async function importChungChiTiengAnh(dataList) {
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
          INSERT INTO ChungChiTiengAnh (sinh_vien_id, loai_chung_chi, ngay_cap, diem, ghi_chu)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            loai_chung_chi = VALUES(loai_chung_chi),
            ngay_cap = VALUES(ngay_cap),
            diem = VALUES(diem),
            ghi_chu = VALUES(ghi_chu),
            updated_at = CURRENT_TIMESTAMP
        `, [
          sinhVienId, 
          item.loai_chung_chi || 'TOEIC',
          item.ngay_cap || null,
          item.diem || null,
          item.ghi_chu || null
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

// 📋 Kiểm tra sinh viên có chứng chỉ tiếng Anh chưa
export async function hasChungChiTiengAnh(sinhVienId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ChungChiTiengAnh WHERE sinh_vien_id = ?',
      [sinhVienId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('❌ Lỗi kiểm tra chứng chỉ tiếng Anh:', err);
    throw err;
  }
}

// 📋 Lấy danh sách chứng chỉ tiếng Anh (có phân trang và filter)
export async function getChungChiTiengAnhList({ page = 1, limit = 50, search = '' }) {
  try {
    let query = `
      SELECT 
        ccta.id,
        ccta.loai_chung_chi,
        ccta.ngay_cap,
        ccta.diem,
        ccta.ghi_chu,
        sv.ma_sv,
        sv.ho_ten,
        sv.lop_id,
        l.ten_lop
      FROM ChungChiTiengAnh ccta
      INNER JOIN SinhVien sv ON ccta.sinh_vien_id = sv.id
      LEFT JOIN Lop l ON sv.lop_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (sv.ma_sv LIKE ? OR sv.ho_ten LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ccta.ngay_cap DESC, sv.ma_sv ASC';

    // Đếm tổng số bản ghi
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Phân trang
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;
    
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.query(query, params);

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách chứng chỉ tiếng Anh:', err);
    throw err;
  }
}

// 📋 Lấy danh sách TẤT CẢ sinh viên với thông tin chứng chỉ (có filter theo khóa học, lớp)
export async function getDanhSachSinhVienVoiChungChi({ 
  page = 1, 
  limit = 50, 
  search = '', 
  khoa_hoc = '', 
  lop_id = '' 
}) {
  try {
    let query = `
      SELECT 
        sv.id AS sinh_vien_id,
        sv.ma_sv,
        sv.ho_ten,
        sv.khoa_hoc,
        sv.lop_id,
        l.ten_lop,
        ccta.id AS chung_chi_id,
        ccta.loai_chung_chi,
        ccta.ngay_cap,
        ccta.diem,
        ccta.ghi_chu,
        CASE WHEN ccta.id IS NOT NULL THEN 1 ELSE 0 END AS co_chung_chi
      FROM SinhVien sv
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN ChungChiTiengAnh ccta ON sv.id = ccta.sinh_vien_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (sv.ma_sv LIKE ? OR sv.ho_ten LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (khoa_hoc) {
      query += ' AND sv.khoa_hoc = ?';
      params.push(khoa_hoc);
    }

    if (lop_id) {
      query += ' AND sv.lop_id = ?';
      params.push(lop_id);
    }

    query += ' ORDER BY sv.khoa_hoc DESC, sv.ma_sv ASC';

    // Đếm tổng số bản ghi
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Phân trang
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;
    
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.query(query, params);

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách sinh viên với chứng chỉ:', err);
    throw err;
  }
}

// ➕ Thêm chứng chỉ mới
export async function createChungChi(sinhVienId, data) {
  try {
    const { loai_chung_chi, ngay_cap, diem, ghi_chu } = data;
    
    const [result] = await pool.query(`
      INSERT INTO ChungChiTiengAnh (sinh_vien_id, loai_chung_chi, ngay_cap, diem, ghi_chu)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        loai_chung_chi = VALUES(loai_chung_chi),
        ngay_cap = VALUES(ngay_cap),
        diem = VALUES(diem),
        ghi_chu = VALUES(ghi_chu),
        updated_at = CURRENT_TIMESTAMP
    `, [sinhVienId, loai_chung_chi || 'TOEIC', ngay_cap || null, diem || null, ghi_chu || null]);

    return { id: result.insertId || null, success: true };
  } catch (err) {
    console.error('❌ Lỗi thêm chứng chỉ:', err);
    throw err;
  }
}

// ✏️ Sửa chứng chỉ
export async function updateChungChi(chungChiId, data) {
  try {
    const { loai_chung_chi, ngay_cap, diem, ghi_chu } = data;
    
    await pool.query(`
      UPDATE ChungChiTiengAnh
      SET loai_chung_chi = ?, ngay_cap = ?, diem = ?, ghi_chu = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [loai_chung_chi || 'TOEIC', ngay_cap || null, diem || null, ghi_chu || null, chungChiId]);

    return { success: true };
  } catch (err) {
    console.error('❌ Lỗi sửa chứng chỉ:', err);
    throw err;
  }
}

// 🗑️ Xóa chứng chỉ
export async function deleteChungChi(chungChiId) {
  try {
    await pool.query('DELETE FROM ChungChiTiengAnh WHERE id = ?', [chungChiId]);
    return { success: true };
  } catch (err) {
    console.error('❌ Lỗi xóa chứng chỉ:', err);
    throw err;
  }
}

// 📋 Lấy danh sách khóa học để filter
export async function getDanhSachKhoaHoc() {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT khoa_hoc 
      FROM SinhVien 
      WHERE khoa_hoc IS NOT NULL AND khoa_hoc != ''
      ORDER BY khoa_hoc DESC
    `);
    return rows.map(row => row.khoa_hoc);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách khóa học:', err);
    throw err;
  }
}

// 📋 Lấy danh sách lớp để filter
export async function getDanhSachLop() {
  try {
    const [rows] = await pool.query(`
      SELECT l.id, l.ten_lop
      FROM Lop l
      ORDER BY l.ten_lop ASC
    `);
    return rows;
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách lớp:', err);
    throw err;
  }
}

