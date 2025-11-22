import * as QuanLyDotDangKyModel from '../models/quanLyDotDangKy.js';

// Lấy danh sách tất cả đợt đăng ký
export async function getAll(req, res) {
  try {
    const list = await QuanLyDotDangKyModel.getAllDotDangKy();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đợt đăng ký', error: err.message });
  }
}

// Tạo đợt đăng ký mới
export async function create(req, res) {
  try {
    const { hocKy, namHoc, thoiGianMo, thoiGianDong, ghiChu } = req.body;
    
    if (!hocKy || !namHoc || !thoiGianMo || !thoiGianDong) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    await QuanLyDotDangKyModel.createDotDangKy({ hocKy, namHoc, thoiGianMo, thoiGianDong, ghiChu });
    res.status(201).json({ message: 'Tạo đợt đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo đợt đăng ký', error: err.message });
  }
}

// Cập nhật đợt đăng ký
export async function update(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    await QuanLyDotDangKyModel.updateDotDangKy(id, data);
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật đợt đăng ký', error: err.message });
  }
}

// Xóa đợt đăng ký
export async function remove(req, res) {
  try {
    const { id } = req.params;
    const result = await QuanLyDotDangKyModel.deleteDotDangKy(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đợt đăng ký' });
    }
    
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa đợt đăng ký', error: err.message });
  }
}

// Tự động tạo đợt đăng ký theo năm
export async function autoGenerate(req, res) {
  try {
    const { namHoc } = req.body;
    if (!namHoc) {
      return res.status(400).json({ message: 'Vui lòng cung cấp năm học (VD: 2025-2026)' });
    }
    const result = await QuanLyDotDangKyModel.generateHocKyNamHoc(namHoc);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo tự động', error: err.message });
  }
}
