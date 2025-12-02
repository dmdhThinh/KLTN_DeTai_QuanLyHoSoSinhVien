import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// 📊 1. API Xét học bổng (Preview & Save)
// POST /api/hoc-bong/xet-duyet
router.post('/xet-duyet', async (req, res) => {
  const { hoc_ky, nam_hoc, min_tin_chi = 14, limit_percent = 10, save = false } = req.body;

  try {
    // 1. Lấy danh sách sinh viên đủ điều kiện sàn
    // - GPA >= 2.5
    // - ĐRL >= 70
    // - Tín chỉ đạt >= min_tin_chi
    // - Không rớt môn nào trong kỳ (Check NOT EXISTS KetQuaHocTap 'Không đạt')
    
    const query = `
      SELECT 
        sv.id, sv.ma_sv, sv.ho_ten, 
        l.ten_lop, n.ten_nganh, k.ten_khoa,
        dtb.diem_tb_hoc_ky_thang4 as gpa,
        dtb.tong_tin_chi_dang_ky,
        dtb.tong_tin_chi_dat,
        drl.so_diem as drl
      FROM DiemTrungBinh dtb
      JOIN SinhVien sv ON dtb.sinh_vien_id = sv.id
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON sv.nganh_id = n.id
      LEFT JOIN Khoa k ON sv.khoa_id = k.id
      JOIN DiemRenLuyen drl ON dtb.sinh_vien_id = drl.sinh_vien_id 
          AND dtb.hoc_ky = drl.hoc_ky AND dtb.nam_hoc = drl.nam_hoc
      WHERE dtb.hoc_ky = ? 
        AND dtb.nam_hoc = ?
        AND dtb.diem_tb_hoc_ky_thang4 >= 2.5
        AND dtb.tong_tin_chi_dat >= ?
        AND drl.so_diem >= 70
        -- Điều kiện: Không có môn nào rớt trong kỳ
        AND NOT EXISTS (
          SELECT 1 FROM KetQuaHocTap kq
          WHERE kq.sinh_vien_id = dtb.sinh_vien_id
            AND kq.hoc_ky = dtb.hoc_ky
            AND kq.nam_hoc = dtb.nam_hoc
            AND kq.dat = 'Không đạt'
        )
    `;

    const [candidates] = await pool.query(query, [hoc_ky, nam_hoc, min_tin_chi]);

    // 2. Phân loại & Xếp hạng
    let results = candidates.map(sv => {
      let loai = 'Khá';
      let muc_tien = 0; 

      // Quy tắc phân loại (Tham khảo)
      // Xuất sắc: GPA >= 3.6 && DRL >= 90
      // Giỏi: GPA >= 3.2 && DRL >= 80
      // Khá: GPA >= 2.5 && DRL >= 70
      
      if (sv.gpa >= 3.6 && sv.drl >= 90) {
        loai = 'Xuất sắc';
        muc_tien = 5000000; // Ví dụ
      } else if (sv.gpa >= 3.2 && sv.drl >= 80) {
        loai = 'Giỏi';
        muc_tien = 3000000;
      } else {
        loai = 'Khá';
        muc_tien = 2000000;
      }

      return {
        ...sv,
        loai_hoc_bong: loai,
        so_tien: muc_tien
      };
    });

    // Sắp xếp: Loại (ưu tiên) > GPA (giảm) > DRL (giảm)
    const priority = { 'Xuất sắc': 3, 'Giỏi': 2, 'Khá': 1 };
    results.sort((a, b) => {
      if (priority[b.loai_hoc_bong] !== priority[a.loai_hoc_bong]) {
        return priority[b.loai_hoc_bong] - priority[a.loai_hoc_bong];
      }
      if (b.gpa !== a.gpa) return b.gpa - a.gpa;
      return b.drl - a.drl;
    });

    // Cắt theo limit (nếu cần - ở đây trả về hết hoặc cắt theo % tổng sv khoa?)
    // Nếu limit_percent > 0, có thể cắt top %
    // const limitCount = Math.ceil(results.length * (limit_percent / 100));
    // results = results.slice(0, limitCount);

    // 3. Lưu vào DB nếu save = true
    if (save) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Xóa dữ liệu cũ của kỳ này (nếu có) để cập nhật mới
        await conn.query(
          'DELETE FROM HocBong WHERE hoc_ky = ? AND nam_hoc = ?', 
          [hoc_ky, nam_hoc]
        );

        for (const item of results) {
          await conn.query(`
            INSERT INTO HocBong (sinh_vien_id, hoc_ky, nam_hoc, diem_tb_hoc_ky, diem_ren_luyen, loai_hoc_bong, so_tien)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            item.id, hoc_ky, nam_hoc, 
            item.gpa, item.drl, 
            item.loai_hoc_bong, item.so_tien
          ]);
        }

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    res.json({
      success: true,
      total: results.length,
      data: results,
      saved: save
    });

  } catch (err) {
    console.error('Lỗi xét học bổng:', err);
    res.status(500).json({ message: 'Lỗi server khi xét học bổng' });
  }
});

// 📋 2. API Lấy danh sách học bổng đã lưu
router.get('/', async (req, res) => {
  const { hoc_ky, nam_hoc } = req.query;
  try {
    let sql = `
      SELECT hb.*, sv.ma_sv, sv.ho_ten, l.ten_lop, n.ten_nganh, k.ten_khoa
      FROM HocBong hb
      JOIN SinhVien sv ON hb.sinh_vien_id = sv.id
      LEFT JOIN Lop l ON sv.lop_id = l.id
      LEFT JOIN Nganh n ON sv.nganh_id = n.id
      LEFT JOIN Khoa k ON sv.khoa_id = k.id
    `;
    const params = [];

    if (hoc_ky && nam_hoc) {
      sql += ` WHERE hb.hoc_ky = ? AND hb.nam_hoc = ?`;
      params.push(hoc_ky, nam_hoc);
    }

    sql += ` ORDER BY 
      CASE hb.loai_hoc_bong 
        WHEN 'Xuất sắc' THEN 1 
        WHEN 'Giỏi' THEN 2 
        WHEN 'Khá' THEN 3 
        ELSE 4 
      END,
      hb.diem_tb_hoc_ky DESC, 
      hb.diem_ren_luyen DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách học bổng' });
  }
});

// 🗑️ 3. Xóa kết quả học bổng
router.delete('/', async (req, res) => {
  const { hoc_ky, nam_hoc } = req.query;
  try {
    if (!hoc_ky || !nam_hoc) return res.status(400).json({ message: 'Thiếu học kỳ/năm học' });
    
    await pool.query('DELETE FROM HocBong WHERE hoc_ky = ? AND nam_hoc = ?', [hoc_ky, nam_hoc]);
    res.json({ success: true, message: 'Đã xóa danh sách học bổng' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa học bổng' });
  }
});

export default router;
