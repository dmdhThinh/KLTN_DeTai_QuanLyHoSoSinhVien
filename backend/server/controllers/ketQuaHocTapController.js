import * as KetQuaHocTapModel from '../models/ketQuaHocTap.js'
import * as DiemTrungBinhModel from '../models/diemTrungBinh.js'
import { pool } from "../config/db.js";
// 🧮 Hàm tính điểm tổng kết IUH
function tinhDiemTongKetIUH(data) {
  const toNum = v => (v === undefined || v === null || v === '' ? null : Number(v));
  const pick = k => toNum(data[k]);
  // ... (rest of the code remains the same)

  const ly = [pick('diem_ly_thuyet_1'), pick('diem_ly_thuyet_2'), pick('diem_ly_thuyet_3'), pick('diem_ly_thuyet_4')].filter(v => v !== null);
  const th = [pick('diem_thuc_hanh_1'), pick('diem_thuc_hanh_2'), pick('diem_thuc_hanh_3')].filter(v => v !== null);
  const gk = pick('diem_giua_ky');
  const ck = pick('diem_cuoi_ky');

  const avg = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
  const tx = ly.length ? avg(ly) : null;
  const thx = th.length ? avg(th) : null;

  let qt = null;
  if (tx !== null && thx !== null) qt = (tx + thx) / 2;
  else if (tx !== null) qt = tx;
  else if (thx !== null) qt = thx;

  // ⚠️ CHỈ TÍNH ĐIỂM TỔNG KẾT KHI CÓ ĐIỂM CUỐI KỲ
  if (ck === null) {
    return {
      diem_tong_ket: null,
      diem_chu: null,
      hoc_luc: null,
      xep_loai: null,
      dat: null,
      diem_thang_4: null
    };
  }

  const tongKet = (qt ?? 0) * 0.2 + (gk ?? 0) * 0.3 + ck * 0.5;

  // ✅ Quy tắc cũ: xếp loại theo điểm tổng kết
  let diemChu, hocLuc, xepLoai, dat;
  if (tongKet >= 8.5) { diemChu = 'A'; hocLuc = xepLoai = 'Giỏi'; dat = 'Đạt'; }
  else if (tongKet >= 8.0) { diemChu = 'B+'; hocLuc = xepLoai = 'Khá giỏi'; dat = 'Đạt'; }
  else if (tongKet >= 7.0) { diemChu = 'B'; hocLuc = xepLoai = 'Khá'; dat = 'Đạt'; }
  else if (tongKet >= 6.5) { diemChu = 'C+'; hocLuc = xepLoai = 'Trung Bình khá'; dat = 'Đạt'; }
  else if (tongKet >= 5.5) { diemChu = 'C'; hocLuc = xepLoai = 'Trung Bình'; dat = 'Đạt'; }
  else if (tongKet >= 5.0) { diemChu = 'D+'; hocLuc = xepLoai = 'Trung Bình yếu'; dat = 'Đạt'; }
  else if (tongKet >= 4.0) { diemChu = 'D'; hocLuc = xepLoai = 'Yếu'; dat = 'Đạt'; }
  else { diemChu = 'F'; hocLuc = 'Kém'; xepLoai = 'Không đạt'; dat = 'Không đạt'; }

  // ✅ BỔ SUNG quy tắc rớt bắt buộc:
  //    - Điểm giữa kỳ < 1  -> rớt
  //    - Điểm cuối kỳ  < 3 -> rớt
  const rotBatBuoc = (gk !== null && gk < 1) || (ck !== null && ck < 3);
  if (rotBatBuoc) {
    diemChu = 'F';
    hocLuc = 'Kém';
    xepLoai = 'Không đạt';
    dat = 'Không đạt';
  }
    // 🔢 quy đổi thang 4 theo điểm chữ
  const diemThang4Map = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0 };
  const diem_thang_4 = diemThang4Map[diemChu];

  return {
    diem_tong_ket: Number(tongKet.toFixed(2)),
    diem_chu: diemChu,
    hoc_luc: hocLuc,
    xep_loai: xepLoai,
    dat,
    diem_thang_4
  };
}

// ➕ Thêm điểm số (UPSERT - tự động merge với data cũ nếu đã tồn tại)
export async function create(req, res) {
  try {
    const { sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc } = req.body;
    const user = req.user || {};
    const isAdmin = user.role === 'Quản trị';
    
    // Lấy số tín chỉ của môn học
    const [hocPhan] = await pool.execute(
      'SELECT so_tin_chi FROM HocPhan WHERE id = ?',
      [hoc_phan_id]
    );
    const soTinChi = hocPhan[0]?.so_tin_chi || 0;
    
    // Kiểm tra xem đã tồn tại record chưa
    const [existing] = await pool.execute(
      `SELECT * FROM KetQuaHocTap 
       WHERE sinh_vien_id = ? AND hoc_phan_id = ? AND hoc_ky = ? AND nam_hoc = ?`,
      [sinh_vien_id, hoc_phan_id, hoc_ky, nam_hoc]
    );

    // Merge data cũ (nếu có) với data mới
    const oldData = existing[0] || {};
    
    // Nếu đã có record và không phải admin → kiểm tra xem có cố gắng sửa điểm đã có không
    if (existing.length > 0 && !isAdmin) {
      // Danh sách các field điểm
      const scoreFields = [
        'diem_ly_thuyet_1', 'diem_ly_thuyet_2', 'diem_ly_thuyet_3', 'diem_ly_thuyet_4',
        'diem_thuc_hanh_1', 'diem_thuc_hanh_2', 'diem_thuc_hanh_3',
        'diem_giua_ky', 'diem_cuoi_ky'
      ];
      
      // Kiểm tra xem có cố gắng sửa điểm đã có (không phải NULL) không
      // Lưu ý: Điểm 0 cũng là điểm hợp lệ, cần xử lý đúng
      let isTryingToModifyExistingScore = false;
      for (const field of scoreFields) {
        const newValue = req.body[field];
        const oldValue = oldData[field];
        
        // Nếu frontend gửi giá trị mới (bao gồm cả 0) VÀ điểm cũ đã có (không phải NULL)
        // → Cố gắng sửa điểm đã có → Chặn
        // Lưu ý: newValue có thể là 0 (số) hoặc "0" (string), cần kiểm tra đúng
        const hasNewValue = newValue !== undefined && newValue !== null && newValue !== '';
        const hasOldValue = oldValue !== null && oldValue !== undefined && oldValue !== '';
        
        if (hasNewValue && hasOldValue) {
          // Kiểm tra xem giá trị mới có khác giá trị cũ không
          const newNum = Number(newValue);
          const oldNum = Number(oldValue);
          if (!isNaN(newNum) && !isNaN(oldNum) && newNum !== oldNum) {
            isTryingToModifyExistingScore = true;
            break;
          }
        }
      }
      
      if (isTryingToModifyExistingScore) {
        return res.status(409).json({
          message: 'Điểm đã được lưu cho sinh viên này, không thể sửa lại. Chỉ có thể cập nhật các cột còn trống (NULL). Liên hệ admin nếu cần chỉnh sửa.'
        });
      }
    }
    
    // Merge: Nếu frontend gửi giá trị mới → dùng giá trị mới (bao gồm cả 0)
    // Nếu frontend không gửi (undefined) → giữ giá trị cũ (nếu có)
    // Nếu frontend gửi null hoặc rỗng → dùng null (xóa điểm - chỉ admin mới được)
    // Lưu ý: Điểm 0 cũng là điểm hợp lệ, cần xử lý đúng (không dùng || vì 0 || null = null)
    const mergeScore = (newValue, oldValue) => {
      if (newValue !== undefined) {
        // Frontend gửi giá trị mới
        if (newValue === null || newValue === '') {
          return null; // Xóa điểm (chỉ admin)
        }
        return Number(newValue); // Bao gồm cả 0
      }
      // Frontend không gửi → giữ giá trị cũ
      return oldValue ?? null;
    };
    
    let data = {
      sinh_vien_id,
      hoc_phan_id,
      hoc_ky,
      nam_hoc,
      diem_ly_thuyet_1: mergeScore(req.body.diem_ly_thuyet_1, oldData.diem_ly_thuyet_1),
      diem_ly_thuyet_2: mergeScore(req.body.diem_ly_thuyet_2, oldData.diem_ly_thuyet_2),
      diem_ly_thuyet_3: mergeScore(req.body.diem_ly_thuyet_3, oldData.diem_ly_thuyet_3),
      diem_ly_thuyet_4: mergeScore(req.body.diem_ly_thuyet_4, oldData.diem_ly_thuyet_4),
      diem_thuc_hanh_1: mergeScore(req.body.diem_thuc_hanh_1, oldData.diem_thuc_hanh_1),
      diem_thuc_hanh_2: mergeScore(req.body.diem_thuc_hanh_2, oldData.diem_thuc_hanh_2),
      diem_thuc_hanh_3: mergeScore(req.body.diem_thuc_hanh_3, oldData.diem_thuc_hanh_3),
      diem_giua_ky: mergeScore(req.body.diem_giua_ky, oldData.diem_giua_ky),
      diem_cuoi_ky: mergeScore(req.body.diem_cuoi_ky, oldData.diem_cuoi_ky),
    };
    
    const auto = tinhDiemTongKetIUH(data);
    data = { ...data, ...auto };
    
    // Tính tin_chi_no: nếu không đạt thì = số tín chỉ, đạt thì = 0
    data.tin_chi_no = auto.dat === 'Không đạt' ? soTinChi : 0;
    
    const result = await KetQuaHocTapModel.createKetQuaHocTap(data);
    
    // 🔄 Tự động cập nhật bảng DiemTrungBinh
    if (sinh_vien_id && hoc_ky && nam_hoc) {
      try {
        await DiemTrungBinhModel.capNhatDiemTrungBinh(sinh_vien_id, hoc_ky, nam_hoc);
      } catch (err) {
        console.error('⚠️ Lỗi khi cập nhật điểm TB:', err.message);
      }
    }
    
    res.status(201).json({ 
      message: 'Điểm số đã được tạo và tính tự động', 
      data: { insertId: result.insertId } 
    });
  } catch (err) {
    console.error('❌ Lỗi CREATE:', err);
    res.status(500).json({ message: 'Lỗi khi tạo điểm số', error: err.message });
  }
}

// 📜 Lấy tất cả điểm số
export async function getAll(req, res) {
  try {
    const rows = await KetQuaHocTapModel.getAllKetQuaHocTap();
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách điểm số', error: err.message });
  }
}

// 📚 Lấy điểm theo sinh viên
export async function getBySinhVien(req, res) {
  const { sinhVienId } = req.query;
  if (!sinhVienId) return res.status(400).json({ message: 'Thiếu sinhVienId' });
  try {
    const rows = await KetQuaHocTapModel.getKetQuaHocTapBySinhVienId(sinhVienId);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy điểm theo sinh viên', error: err.message });
  }
}

// 🔍 Lấy điểm theo ID
export async function getById(req, res) {
  const { id } = req.params;
  try {
    const row = await KetQuaHocTapModel.getKetQuaHocTapById(id);
    if (!row) return res.status(404).json({ message: 'Không tìm thấy điểm số' });
    res.status(200).json(row);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy điểm theo ID', error: err.message });
  }
}

// ✏️ Cập nhật điểm (merge dữ liệu cũ + mới, tự tính & lưu)
export async function update(req, res) {
  const { id } = req.params;
  try {
    const user = req.user;
    const isAdmin = user && user.role === 'Quản trị';

    if (!isAdmin) {
      return res.status(403).json({
        message: 'Chỉ admin mới được phép sửa điểm đã lưu.'
      });
    }

    // 1️⃣ Lấy bản ghi hiện có
    const current = await KetQuaHocTapModel.getKetQuaHocTapById(id);
    if (!current) {
      return res.status(404).json({ message: 'Không tìm thấy điểm số để sửa' });
    }
    
    // 3️⃣ Nếu là admin, kiểm tra học kỳ tương ứng (nếu có trong request body)
    if (isAdmin && req.body.hoc_ky && req.body.nam_hoc) {
      // Admin chỉ được sửa điểm trong cùng học kỳ
      if (req.body.hoc_ky !== current.hoc_ky || req.body.nam_hoc !== current.nam_hoc) {
        return res.status(400).json({ 
          message: 'Admin chỉ được sửa điểm trong cùng học kỳ và năm học' 
        });
      }
    }
    
    // Lấy số tín chỉ của môn học
    const [hocPhan] = await pool.execute(
      'SELECT so_tin_chi FROM HocPhan WHERE id = ?',
      [current.hoc_phan_id]
    );
    const soTinChi = hocPhan[0]?.so_tin_chi || 0;

    // 4️⃣ Hợp nhất dữ liệu mới và cũ
    const merged = { ...current, ...req.body };

    // 5️⃣ Tính lại theo dữ liệu hợp nhất
    const auto = tinhDiemTongKetIUH(merged);
    // Tính tin_chi_no: nếu không đạt thì = số tín chỉ, đạt thì = 0
    auto.tin_chi_no = auto.dat === 'Không đạt' ? soTinChi : 0;
    const payload = { ...req.body, ...auto }; // CHỈ gửi field frontend gửi + auto

    // 6️⃣ Update vào DB
    const result = await KetQuaHocTapModel.updateKetQuaHocTap(id, payload);
    
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy điểm số để sửa' });

    // 🔄 Tự động cập nhật bảng DiemTrungBinh
    const { sinh_vien_id, hoc_ky, nam_hoc } = current;
    if (sinh_vien_id && hoc_ky && nam_hoc) {
      try {
        await DiemTrungBinhModel.capNhatDiemTrungBinh(sinh_vien_id, hoc_ky, nam_hoc);
      } catch (err) {
        console.error('⚠️ Lỗi khi cập nhật điểm TB:', err.message);
      }
    }

    res.status(200).json({
      message: isAdmin ? 'Admin đã cập nhật điểm thành công' : 'Điểm số đã được cập nhật và tính tự động thành công',
      data: auto
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật điểm số', error: err.message });
  }
}

// ❌ Xóa điểm số
export async function deleteGrade(req, res) {
  const { id } = req.params;
  try {
    const result = await KetQuaHocTapModel.deleteKetQuaHocTap(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy điểm số để xóa' });
    res.status(200).json({ message: 'Điểm số đã được xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa điểm số', error: err.message });
  }
}

// 📊 API lấy dữ liệu biểu đồ điểm theo học kỳ
export async function getChartData(req, res) {
 
  try {
    const { sinhVienId, hocKy, namHoc } = req.query;

    if (!sinhVienId || !hocKy || !namHoc) {
      return res.status(400).json({ 
        message: 'Thiếu tham số: sinhVienId, hocKy, namHoc' 
      });
    }

    // Lấy điểm của sinh viên với điểm TB lớp học phần
    const [rows] = await pool.execute(`
      SELECT 
        hp.ten_hoc_phan as tenMonHoc,
        hp.ma_hoc_phan as maHocPhan,
        kq.diem_tong_ket as diemCuaBan,
        (
          SELECT ROUND(AVG(kq2.diem_tong_ket), 2)
          FROM KetQuaHocTap kq2
          WHERE kq2.hoc_phan_id = hp.id
            AND kq2.hoc_ky = ?
            AND kq2.nam_hoc = ?
            AND kq2.diem_tong_ket IS NOT NULL
        ) as diemTBLop
      FROM KetQuaHocTap kq
      JOIN HocPhan hp ON kq.hoc_phan_id = hp.id
      WHERE kq.sinh_vien_id = ?
        AND kq.hoc_ky = ?
        AND kq.nam_hoc = ?
        AND kq.diem_tong_ket IS NOT NULL
      ORDER BY hp.ten_hoc_phan
    `, [hocKy, namHoc, sinhVienId, hocKy, namHoc]);

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi lấy dữ liệu biểu đồ', 
      error: err.message 
    });
  }
}