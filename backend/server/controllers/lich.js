import { pool } from '../config/db.js'

// 🧩 Lịch học (hiển thị lặp lại mỗi tuần)
export async function getLichHoc(req, res) {
  try {
    const { sinhVienId, from } = req.query;
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' });

    // Lấy lớp của sinh viên
    const [[sv]] = await pool.execute(
      'SELECT lop_id FROM SinhVien WHERE id = ?',
      [sinhVienId]
    );
    if (!sv) return res.status(404).json({ message: 'Không tìm thấy sinh viên' });

    const params = [sv.lop_id];
    let dateFilter = '';

    if (from) {
      dateFilter = `
        AND DATE(?) BETWEEN lhp.ngay_bat_dau AND lhp.ngay_ket_thuc
      `;
      params.push(from);
    }

    const query = `
      SELECT 
        lh.id, lh.thu, lh.ca,
        CONCAT(hp.ten_hoc_phan, ' (', hp.ma_hoc_phan, ')') AS monHoc,
        CONCAT(lhp.ma_lop_hoc_phan, ' - ', hp.ma_hoc_phan) AS lopHocPhan,
        CONCAT(lh.tiet_bat_dau, ' - ', lh.tiet_ket_thuc) AS tiet,
        CONCAT(lh.phong, ' (', lh.co_so, ')') AS phong,
        gv.ho_ten AS giangVien,
        lh.loai
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
      WHERE lh.loai IN ('lythuyet','thuchanh','tructuyen')
        AND lhp.lop_id = ?
      ${dateFilter}
    `;

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy lịch học:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch học' });
  }
}



// 🧩 Lịch thi (chỉ hiển thị trong tuần có ngày học)
export async function getLichThi(req, res) {
  try {
    const { sinhVienId, from } = req.query;
    if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' });

    const [[sv]] = await pool.execute(
      'SELECT lop_id FROM SinhVien WHERE id = ?',
      [sinhVienId]
    );
    if (!sv) return res.status(404).json({ message: 'Không tìm thấy sinh viên' });

    const params = [sv.lop_id];
    let dateFilter = '';

    if (from) {
      dateFilter = 'AND lh.ngay_hoc BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)';
      params.push(from, from);
    }

    const query = `
      SELECT 
        lh.id, lh.thu, lh.ca, lh.ngay_hoc,
        CONCAT(hp.ten_hoc_phan, ' (', hp.ma_hoc_phan, ')') AS monHoc,
        CONCAT(lhp.ma_lop_hoc_phan, ' - ', hp.ma_hoc_phan) AS lopHocPhan,
        CONCAT(lh.tiet_bat_dau, ' - ', lh.tiet_ket_thuc) AS tiet,
        CONCAT(lh.phong, ' (', lh.co_so, ')') AS phong,
        gv.ho_ten AS giangVien,
        lh.loai
      FROM LichHoc lh
      JOIN LopHocPhan lhp ON lh.lop_hoc_phan_id = lhp.id
      JOIN HocPhan hp ON lhp.hoc_phan_id = hp.id
      JOIN GiangVien gv ON lhp.giang_vien_id = gv.id
      WHERE lh.loai = 'thi'
        AND lhp.lop_id = ?
      ${dateFilter}
    `;
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy lịch thi:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}


