import { pool } from '../config/db.js';

// Lấy danh sách tất cả đợt đăng ký
export async function getAllDotDangKy() {
  try {
    // Tự động cập nhật trạng thái dựa trên thời gian
    await autoUpdateStatus();

    const [rows] = await pool.execute(
      `SELECT * FROM DotDangKy ORDER BY nam_hoc DESC, hoc_ky ASC, thoi_gian_mo DESC`
    );
    return rows;
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách đợt đăng ký:', err);
    throw err;
  }
}

// Tạo đợt đăng ký mới
export async function createDotDangKy(data) {
  try {
    const { hocKy, namHoc, thoiGianMo, thoiGianDong, ghiChu } = data;
    
    // Validate thời gian
    if (new Date(thoiGianMo) >= new Date(thoiGianDong)) {
      throw new Error('Thời gian đóng phải sau thời gian mở');
    }

    // Xác định trạng thái ban đầu
    const now = new Date();
    let trangThai = 'SAP_MO';
    if (now >= new Date(thoiGianMo) && now <= new Date(thoiGianDong)) {
      trangThai = 'DANG_MO';
    } else if (now > new Date(thoiGianDong)) {
      trangThai = 'DA_DONG';
    }

    const [result] = await pool.execute(
      `INSERT INTO DotDangKy (hoc_ky, nam_hoc, thoi_gian_mo, thoi_gian_dong, trang_thai, ghi_chu)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hocKy, namHoc, thoiGianMo, thoiGianDong, trangThai, ghiChu]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi tạo đợt đăng ký:', err);
    throw err;
  }
}

// Cập nhật đợt đăng ký
export async function updateDotDangKy(id, data) {
  try {
    const { thoiGianMo, thoiGianDong, ghiChu, trangThai } = data;

    let sql = `UPDATE DotDangKy SET id = id`; // Dummy update to start the chain
    const params = [];

    if (thoiGianMo) {
      sql += `, thoi_gian_mo = ?`;
      params.push(thoiGianMo);
    }
    if (thoiGianDong) {
      sql += `, thoi_gian_dong = ?`;
      params.push(thoiGianDong);
    }
    if (ghiChu !== undefined) {
      sql += `, ghi_chu = ?`;
      params.push(ghiChu);
    }
    if (trangThai) {
      sql += `, trang_thai = ?`;
      params.push(trangThai);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    const [result] = await pool.execute(sql, params);
    
    // Sau khi update, chạy lại auto update status để đảm bảo tính nhất quán
    await autoUpdateStatus();
    
    return result;
  } catch (err) {
    console.error('❌ Lỗi cập nhật đợt đăng ký:', err);
    throw err;
  }
}

// Helper: Tính ngày thứ 2 đầu tiên của tháng/năm
function getFirstMonday(year, monthZeroIndexed) {
  const date = new Date(year, monthZeroIndexed, 1);
  const day = date.getDay(); // 0: Sun, 1: Mon, ...
  const diff = day === 1 ? 0 : (day === 0 ? 1 : 8 - day);
  date.setDate(date.getDate() + diff);
  return date;
}

// Tự động sinh đợt đăng ký cho cả năm học
export async function generateHocKyNamHoc(namHoc) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Parse năm học "2025-2026" -> 2025
    const parts = namHoc.split('-');
    const startYear = parseInt(parts[0]);
    const endYear = parseInt(parts[1]);

    if (!startYear || !endYear || endYear !== startYear + 1) {
      throw new Error('Định dạng năm học không hợp lệ (VD: 2025-2026)');
    }

    // Cấu hình 3 học kỳ
    const configs = [
      {
        hocKy: 'HK1',
        regStart: `${startYear}-08-01 00:00:00`,
        regEnd: `${startYear}-08-15 23:59:59`,
        semStartMonth: 8 // Tháng 9 (index 8)
      },
      {
        hocKy: 'HK2',
        regStart: `${startYear}-12-01 00:00:00`,
        regEnd: `${startYear}-12-15 23:59:59`,
        semStartMonth: 0, // Tháng 1 (index 0) năm sau
        isNextYear: true
      },
      {
        hocKy: 'HK3',
        regStart: `${endYear}-05-01 00:00:00`,
        regEnd: `${endYear}-05-15 23:59:59`,
        semStartMonth: 5, // Tháng 6 (index 5) năm sau
        isNextYear: true
      }
    ];

    for (const cfg of configs) {
      // Tính ngày bắt đầu học kỳ (Thứ 2 đầu tiên)
      const semYear = cfg.isNextYear ? endYear : startYear;
      const semStartDate = getFirstMonday(semYear, cfg.semStartMonth);
      const semStartDateStr = semStartDate.toLocaleDateString('vi-VN');

      // Xác định trạng thái
      const now = new Date();
      const openDate = new Date(cfg.regStart);
      const closeDate = new Date(cfg.regEnd);
      
      let trangThai = 'SAP_MO';
      if (now >= openDate && now <= closeDate) trangThai = 'DANG_MO';
      else if (now > closeDate) trangThai = 'DA_DONG';

      const ghiChu = `Tự động tạo: Học kỳ bắt đầu từ ${semStartDateStr}`;

      // Kiểm tra xem đã tồn tại chưa, nếu có thì update, chưa thì insert
      // Ở đây ta chọn cách: Xóa cái cũ của kỳ đó đi tạo lại cho sạch (hoặc update)
      // Để đơn giản và tránh ID tăng quá nhanh, ta dùng Insert On Duplicate Key hoặc check trước
      
      const [exist] = await conn.execute(
        `SELECT id FROM DotDangKy WHERE hoc_ky = ? AND nam_hoc = ?`,
        [cfg.hocKy, namHoc]
      );

      if (exist.length > 0) {
        await conn.execute(
          `UPDATE DotDangKy 
           SET thoi_gian_mo = ?, thoi_gian_dong = ?, trang_thai = ?, ghi_chu = ?
           WHERE id = ?`,
          [cfg.regStart, cfg.regEnd, trangThai, ghiChu, exist[0].id]
        );
      } else {
        await conn.execute(
          `INSERT INTO DotDangKy (hoc_ky, nam_hoc, thoi_gian_mo, thoi_gian_dong, trang_thai, ghi_chu)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cfg.hocKy, namHoc, cfg.regStart, cfg.regEnd, trangThai, ghiChu]
        );
      }
    }

    await conn.commit();
    return { message: `Đã tạo/cập nhật dữ liệu cho năm học ${namHoc}` };
  } catch (err) {
    await conn.rollback();
    console.error('❌ Lỗi generate năm học:', err);
    throw err;
  } finally {
    conn.release();
  }
}

// Xóa đợt đăng ký
export async function deleteDotDangKy(id) {
  try {
    const [result] = await pool.execute(
      `DELETE FROM DotDangKy WHERE id = ?`,
      [id]
    );
    return result;
  } catch (err) {
    console.error('❌ Lỗi xóa đợt đăng ký:', err);
    throw err;
  }
}

// Helper: Tự động cập nhật trạng thái dựa trên thời gian hiện tại
async function autoUpdateStatus() {
  try {
    // 1. Cập nhật SAP_MO -> DANG_MO
    await pool.execute(`
      UPDATE DotDangKy 
      SET trang_thai = 'DANG_MO'
      WHERE trang_thai = 'SAP_MO' AND thoi_gian_mo <= NOW() AND thoi_gian_dong > NOW()
    `);

    // 2. Cập nhật DANG_MO -> DA_DONG
    await pool.execute(`
      UPDATE DotDangKy 
      SET trang_thai = 'DA_DONG'
      WHERE trang_thai = 'DANG_MO' AND thoi_gian_dong <= NOW()
    `);
    
    // 3. Cập nhật SAP_MO -> DA_DONG (nếu thời gian đóng đã qua mà chưa kịp mở)
    await pool.execute(`
      UPDATE DotDangKy 
      SET trang_thai = 'DA_DONG'
      WHERE trang_thai = 'SAP_MO' AND thoi_gian_dong <= NOW()
    `);

  } catch (err) {
    console.error('Lỗi tự động cập nhật trạng thái đợt đăng ký:', err);
    // Không throw lỗi ở đây để không chặn luồng chính
  }
}
