import * as KetQuaHocTapModel from '../models/ketQuaHocTap.js';
import * as xlsx from 'xlsx';

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
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file Excel được tải lên' });
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const grades = data.map(row => ({
      sinh_vien_id: row['Mã sinh viên'],
      hoc_phan_id: row['Mã học phần'],
      diem_giua_ky: row['Giữa kỳ'],
      diem_cuoi_ky: row['Cuối kỳ'],
      diem_ly_thuyet_1: row['TX1'],
      diem_ly_thuyet_2: row['TX2'],
      diem_thuc_hanh_1: row['TH1'],
      diem_thuc_hanh_2: row['TH2'],
      diem_thuc_hanh_3: row['TH3'],
    })).map(item => ({ ...item, ...tinhDiemTongKetIUH(item) }));

    await KetQuaHocTapModel.importGrades(grades);
    res.status(200).json({ message: 'Điểm đã được nhập và tính tự động từ file Excel' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi nhập điểm từ file Excel', error: err.message });
  }
}
