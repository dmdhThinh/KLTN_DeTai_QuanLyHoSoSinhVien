import * as KetQuaHocTapModel from '../models/ketQuaHocTap.js';
import * as DiemTrungBinhModel from '../models/diemTrungBinh.js';
import { pool } from "../config/db.js";
// 🧮 Hàm tính điểm tổng kết IUH
function tinhDiemTongKetIUH(data) {
  const toNum = v => (v === undefined || v === null || v === '' ? null : Number(v));
  const pick = k => toNum(data[k]);

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

  const tongKet = (qt ?? 0) * 0.3 + (gk ?? 0) * 0.2 + (ck ?? 0) * 0.5;

  let diemChu, hocLuc, xepLoai, dat;
  if (tongKet >= 8.5) { diemChu = 'A'; hocLuc = xepLoai = 'Giỏi'; dat = 'Đạt'; }
  else if (tongKet >= 8.0) { diemChu = 'B+'; hocLuc = xepLoai = 'Khá giỏi'; dat = 'Đạt'; }
  else if (tongKet >= 7.0) { diemChu = 'B'; hocLuc = xepLoai = 'Khá'; dat = 'Đạt'; }
  else if (tongKet >= 6.5) { diemChu = 'C+'; hocLuc = xepLoai = 'TB khá'; dat = 'Đạt'; }
  else if (tongKet >= 5.5) { diemChu = 'C'; hocLuc = xepLoai = 'TB'; dat = 'Đạt'; }
  else if (tongKet >= 5.0) { diemChu = 'D+'; hocLuc = xepLoai = 'TB yếu'; dat = 'Đạt'; }
  else if (tongKet >= 4.0) { diemChu = 'D'; hocLuc = xepLoai = 'Yếu'; dat = 'Đạt'; }
  else { diemChu = 'F'; hocLuc = 'Kém'; xepLoai = 'Không đạt'; dat = 'Không đạt'; }
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

// ➕ Thêm điểm số (tự tính luôn khi tạo)
export async function create(req, res) {
  try {
    let data = req.body;
    const auto = tinhDiemTongKetIUH(data);
    data = { ...data, ...auto };
    const result = await KetQuaHocTapModel.createKetQuaHocTap(data);
    
    // 🔄 Tự động cập nhật bảng DiemTrungBinh
    const { sinh_vien_id, hoc_ky, nam_hoc } = data;
    if (sinh_vien_id && hoc_ky && nam_hoc) {
      try {
        await DiemTrungBinhModel.capNhatDiemTrungBinh(sinh_vien_id, hoc_ky, nam_hoc);
        console.log('✅ Đã cập nhật điểm TB cho SV:', sinh_vien_id, hoc_ky, nam_hoc);
      } catch (err) {
        console.error('⚠️ Lỗi khi cập nhật điểm TB:', err.message);
      }
    }
    
    res.status(201).json({ message: 'Điểm số đã được tạo và tính tự động', data: result });
  } catch (err) {
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
    // 1️⃣ Lấy bản ghi hiện có
    const current = await KetQuaHocTapModel.getKetQuaHocTapById(id);
    if (!current) return res.status(404).json({ message: 'Không tìm thấy điểm số để sửa' });

    // 2️⃣ Hợp nhất dữ liệu mới và cũ
    const merged = { ...current, ...req.body };

    // 3️⃣ Tính lại theo dữ liệu hợp nhất
    const auto = tinhDiemTongKetIUH(merged);
    const payload = { ...merged, ...auto };

    // 4️⃣ Update vào DB
    const result = await KetQuaHocTapModel.updateKetQuaHocTap(id, payload);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy điểm số để sửa' });

    // 🔄 Tự động cập nhật bảng DiemTrungBinh
    const { sinh_vien_id, hoc_ky, nam_hoc } = current;
    if (sinh_vien_id && hoc_ky && nam_hoc) {
      try {
        await DiemTrungBinhModel.capNhatDiemTrungBinh(sinh_vien_id, hoc_ky, nam_hoc);
        console.log('✅ Đã cập nhật điểm TB cho SV:', sinh_vien_id, hoc_ky, nam_hoc);
      } catch (err) {
        console.error('⚠️ Lỗi khi cập nhật điểm TB:', err.message);
      }
    }

    res.status(200).json({
      message: 'Điểm số đã được cập nhật và tính tự động thành công',
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
