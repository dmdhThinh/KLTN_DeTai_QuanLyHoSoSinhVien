import { pool } from '../config/db.js';

// Tính xếp loại từ điểm
function tinhXepLoai(diem) {
  if (diem >= 90) return 'Xuất sắc';
  if (diem >= 80) return 'Tốt';
  if (diem >= 65) return 'Khá';
  if (diem >= 50) return 'Trung bình';
  return 'Yếu';
}

// Tính tổng điểm từ các hoạt động và cập nhật vào DiemRenLuyen
// Điểm cơ bản 70 được lưu như một hoạt động riêng, tổng điểm = SUM(tất cả hoạt động)
async function capNhatTongDiem(connection, diemRenLuyenId) {
  const [hoatDongRows] = await connection.query(
    'SELECT SUM(diem) as tong_diem FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ?',
    [diemRenLuyenId]
  );
  const tongDiem = hoatDongRows[0]?.tong_diem || 0;
  const xepLoai = tinhXepLoai(tongDiem);

  await connection.query(
    'UPDATE DiemRenLuyen SET so_diem = ?, xep_loai = ? WHERE id = ?',
    [tongDiem, xepLoai, diemRenLuyenId]
  );

  return tongDiem;
}

// 📥 Import điểm rèn luyện với hoạt động (Bulk Insert/Update)
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

        // Lấy hoặc tạo bản ghi DiemRenLuyen
        let [drlRows] = await connection.query(
          'SELECT id FROM DiemRenLuyen WHERE sinh_vien_id = ? AND hoc_ky = ? AND nam_hoc = ?',
          [sinhVienId, item.hoc_ky, item.nam_hoc]
        );

        let diemRenLuyenId;
        let isNewRecord = false;
        if (drlRows.length === 0) {
          // Tạo mới
          const [insertResult] = await connection.query(
            'INSERT INTO DiemRenLuyen (sinh_vien_id, hoc_ky, nam_hoc, so_diem, xep_loai) VALUES (?, ?, ?, 70, ?)',
            [sinhVienId, item.hoc_ky, item.nam_hoc, 'Khá']
          );
          diemRenLuyenId = insertResult.insertId;
          isNewRecord = true;
        } else {
          diemRenLuyenId = drlRows[0].id;
        }

        // Nếu là bản ghi mới, tạo hoạt động "Điểm rèn luyện cơ bản" = 70
        if (isNewRecord) {
          const [existingBasic] = await connection.query(
            'SELECT id FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ? AND ten_hoat_dong LIKE ?',
            [diemRenLuyenId, '%Điểm rèn luyện cơ bản%']
          );
          if (existingBasic.length === 0) {
            await connection.query(
              'INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu) VALUES (?, ?, ?, ?)',
              [diemRenLuyenId, `Điểm rèn luyện cơ bản (${item.hoc_ky} ${item.nam_hoc})`, 70, 'Điểm rèn luyện cơ bản mặc định']
            );
          }
        }

        // Xử lý hoạt động từ file import: có thể là mảng hoặc đơn lẻ
        const hoatDongList = Array.isArray(item.hoat_dong) ? item.hoat_dong : 
                            (item.ten_hoat_dong ? [{ ten_hoat_dong: item.ten_hoat_dong, diem: item.diem || item.so_diem }] : []);

        // Thêm các hoạt động từ file import (cộng thêm vào điểm cơ bản)
        for (const hd of hoatDongList) {
          if (hd.ten_hoat_dong && hd.diem !== undefined) {
            await connection.query(
              'INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu) VALUES (?, ?, ?, ?)',
              [diemRenLuyenId, hd.ten_hoat_dong, hd.diem, hd.ghi_chu || null]
            );
          }
        }

        // Cập nhật tổng điểm từ các hoạt động
        await capNhatTongDiem(connection, diemRenLuyenId);

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

    // Lấy danh sách hoạt động cho mỗi bản ghi
    for (const row of rows) {
      try {
        const [hoatDongRows] = await pool.query(
          'SELECT id, ten_hoat_dong, diem, ghi_chu FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ? ORDER BY id',
          [row.id]
        );
        row.hoat_dong = hoatDongRows;
        
        // Kiểm tra xem đã có hoạt động cơ bản chưa
        const hasBasicActivity = hoatDongRows.some(hd => hd.ten_hoat_dong?.includes('Điểm rèn luyện cơ bản'));
        
        // Nếu chưa có hoạt động cơ bản, tạo mặc định 70 điểm
        if (!hasBasicActivity) {
          await pool.query(
            'INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu) VALUES (?, ?, ?, ?)',
            [row.id, `Điểm rèn luyện cơ bản (${row.hoc_ky} ${row.nam_hoc})`, 70, 'Điểm rèn luyện cơ bản mặc định']
          );
          // Load lại
          const [newHoatDongRows] = await pool.query(
            'SELECT id, ten_hoat_dong, diem, ghi_chu FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ? ORDER BY id',
            [row.id]
          );
          row.hoat_dong = newHoatDongRows;
          
          // Cập nhật lại tổng điểm
          const conn = await pool.getConnection();
          try {
            await capNhatTongDiem(conn, row.id);
          } finally {
            conn.release();
          }
        }
      } catch (err) {
        // Nếu bảng HoatDongRenLuyen chưa tồn tại, bỏ qua
        console.warn('Bảng HoatDongRenLuyen chưa tồn tại:', err.message);
        row.hoat_dong = [];
      }
    }

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

// ➕ Thêm hoạt động rèn luyện
export async function themHoatDongRenLuyen({ diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Kiểm tra xem đã có hoạt động cơ bản chưa, nếu chưa thì tạo
    const [drlInfo] = await connection.query(
      'SELECT sinh_vien_id, hoc_ky, nam_hoc FROM DiemRenLuyen WHERE id = ?',
      [diem_ren_luyen_id]
    );
    if (drlInfo.length > 0) {
      const [existingBasic] = await connection.query(
        'SELECT id FROM HoatDongRenLuyen WHERE diem_ren_luyen_id = ? AND ten_hoat_dong LIKE ?',
        [diem_ren_luyen_id, '%Điểm rèn luyện cơ bản%']
      );
      if (existingBasic.length === 0) {
        await connection.query(
          'INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu) VALUES (?, ?, ?, ?)',
          [diem_ren_luyen_id, `Điểm rèn luyện cơ bản (${drlInfo[0].hoc_ky} ${drlInfo[0].nam_hoc})`, 70, 'Điểm rèn luyện cơ bản mặc định']
        );
      }
    }

    await connection.query(
      'INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu) VALUES (?, ?, ?, ?)',
      [diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu || null]
    );

    await capNhatTongDiem(connection, diem_ren_luyen_id);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ✏️ Sửa hoạt động rèn luyện
export async function suaHoatDongRenLuyen({ id, ten_hoat_dong, diem, ghi_chu }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lấy diem_ren_luyen_id
    const [hdRows] = await connection.query(
      'SELECT diem_ren_luyen_id FROM HoatDongRenLuyen WHERE id = ?',
      [id]
    );
    if (hdRows.length === 0) throw new Error('Không tìm thấy hoạt động');

    await connection.query(
      'UPDATE HoatDongRenLuyen SET ten_hoat_dong = ?, diem = ?, ghi_chu = ? WHERE id = ?',
      [ten_hoat_dong, diem, ghi_chu || null, id]
    );

    await capNhatTongDiem(connection, hdRows[0].diem_ren_luyen_id);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ❌ Xóa hoạt động rèn luyện
export async function xoaHoatDongRenLuyen(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lấy thông tin hoạt động
    const [hdRows] = await connection.query(
      'SELECT diem_ren_luyen_id, ten_hoat_dong FROM HoatDongRenLuyen WHERE id = ?',
      [id]
    );
    if (hdRows.length === 0) throw new Error('Không tìm thấy hoạt động');

    // Không cho phép xóa hoạt động cơ bản
    if (hdRows[0].ten_hoat_dong?.includes('Điểm rèn luyện cơ bản')) {
      throw new Error('Không thể xóa hoạt động cơ bản (70 điểm). Đây là điểm mặc định của tất cả sinh viên.');
    }

    await connection.query('DELETE FROM HoatDongRenLuyen WHERE id = ?', [id]);

    await capNhatTongDiem(connection, hdRows[0].diem_ren_luyen_id);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// 🔄 Cập nhật điểm rèn luyện của tất cả sinh viên: tạo hoạt động cơ bản 70 điểm
export async function updateAllDiemRenLuyenTo70() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Tạo hoạt động cơ bản 70 điểm cho tất cả bản ghi chưa có hoạt động cơ bản
    await connection.query(`
      INSERT INTO HoatDongRenLuyen (diem_ren_luyen_id, ten_hoat_dong, diem, ghi_chu)
      SELECT 
          drl.id,
          CONCAT('Điểm rèn luyện cơ bản (', drl.hoc_ky, ' ', drl.nam_hoc, ')') AS ten_hoat_dong,
          70 AS diem,
          'Điểm rèn luyện cơ bản mặc định'
      FROM DiemRenLuyen drl
      WHERE NOT EXISTS (
        SELECT 1 
        FROM HoatDongRenLuyen hdrl 
        WHERE hdrl.diem_ren_luyen_id = drl.id
          AND hdrl.ten_hoat_dong LIKE '%Điểm rèn luyện cơ bản%'
      )
    `);

    // 2. Cập nhật lại tổng điểm từ tất cả hoạt động (bao gồm hoạt động cơ bản 70)
    await connection.query(`
      UPDATE DiemRenLuyen drl
      SET 
        so_diem = COALESCE((
          SELECT SUM(diem) 
          FROM HoatDongRenLuyen hdrl 
          WHERE hdrl.diem_ren_luyen_id = drl.id
        ), 70),
        xep_loai = CASE 
          WHEN COALESCE((
            SELECT SUM(diem) 
            FROM HoatDongRenLuyen hdrl 
            WHERE hdrl.diem_ren_luyen_id = drl.id
          ), 70) >= 90 THEN 'Xuất sắc'
          WHEN COALESCE((
            SELECT SUM(diem) 
            FROM HoatDongRenLuyen hdrl 
            WHERE hdrl.diem_ren_luyen_id = drl.id
          ), 70) >= 80 THEN 'Tốt'
          WHEN COALESCE((
            SELECT SUM(diem) 
            FROM HoatDongRenLuyen hdrl 
            WHERE hdrl.diem_ren_luyen_id = drl.id
          ), 70) >= 65 THEN 'Khá'
          WHEN COALESCE((
            SELECT SUM(diem) 
            FROM HoatDongRenLuyen hdrl 
            WHERE hdrl.diem_ren_luyen_id = drl.id
          ), 70) >= 50 THEN 'Trung bình'
          ELSE 'Yếu'
        END
      WHERE drl.id > 0
    `);

    // 3. Đếm số bản ghi đã cập nhật
    const [countRows] = await connection.query(
      'SELECT COUNT(*) as total FROM DiemRenLuyen'
    );
    const total = countRows[0]?.total || 0;

    await connection.commit();
    return { message: `Đã tạo hoạt động cơ bản 70 điểm cho ${total} sinh viên. Các hoạt động import sẽ được cộng thêm vào.`, total };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
