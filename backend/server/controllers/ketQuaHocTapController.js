import * as KetQuaHocTapModel from '../models/ketQuaHocTap.js';
import XLSX from "xlsx";
import fs from "fs";
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

// 📤 Nhập điểm từ file Excel (tự tính và lưu)
export async function importGrades(req, res) {
  if (!req.file) return res.status(400).json({ message: "Không có file Excel được tải lên" });

  try {
    const buffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(buffer, { type: "buffer" }); // ✅ dùng read() thay vì readFile()
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Chuẩn hóa & ánh xạ đồng loạt
    const grades = [];
    for (const r of rows) {
      const maSV = r['Mã sinh viên'] ?? r['Ma sinh vien'] ?? r['ma_sv'];
      const maHP = r['Mã học phần'] ?? r['Ma hoc phan'] ?? r['ma_hp'];

      const sinh_vien_id = await getSinhVienIdByMa(String(maSV).trim());
      const hoc_phan_id  = await getHocPhanIdByMa(String(maHP).trim());
      if (!sinh_vien_id || !hoc_phan_id) continue; // bỏ dòng không hợp lệ

      const v = (x) => (x === '' || x === undefined || x === null ? null : Number(x));

      const item = {
        sinh_vien_id,
        hoc_phan_id,
        diem_ly_thuyet_1: v(r['TX1']),
        diem_ly_thuyet_2: v(r['TX2']),
        diem_ly_thuyet_3: v(r['TX3']),
        diem_ly_thuyet_4: v(r['TX4']),
        diem_thuc_hanh_1: v(r['TH1']),
        diem_thuc_hanh_2: v(r['TH2']),
        diem_thuc_hanh_3: v(r['TH3']),
        diem_giua_ky:     v(r['Giữa kỳ'] ?? r['Giua ky']),
        diem_cuoi_ky:     v(r['Cuối kỳ'] ?? r['Cuoi ky']),
      };

      // CHỈ tính khi có điểm cuối kỳ
      if (item.diem_cuoi_ky !== null) {
        Object.assign(item, tinhDiemTongKetIUH(item));
      }
      grades.push(item);
    }

    await KetQuaHocTapModel.importGrades(grades);
    res.status(200).json({ message: 'Điểm đã được nhập (và tự tính nếu có "Cuối kỳ").' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi nhập điểm từ file Excel', error: err.message });
  }
  fs.unlinkSync(req.file.path);
}
// tra cứu ID từ mã
async function getSinhVienIdByMa(ma) {
  const [rows] = await pool.execute('SELECT id FROM SinhVien WHERE ma_sv = ?', [ma]);
  return rows[0]?.id || null;
}
async function getHocPhanIdByMa(ma) {
  const [rows] = await pool.execute('SELECT id FROM HocPhan WHERE ma_hoc_phan = ?', [ma]);
  return rows[0]?.id || null;
}
