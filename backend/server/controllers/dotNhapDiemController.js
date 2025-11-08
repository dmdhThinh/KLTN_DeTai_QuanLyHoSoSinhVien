import * as DotNhapDiemModel from '../models/dotNhapDiem.js';

// Lấy trạng thái đợt nhập điểm theo học kỳ + năm học
export async function getTrangThaiDot(req, res) {
  try {
    const { hocKy, namHoc } = req.query;
    if (!hocKy || !namHoc) {
      return res.status(400).json({ message: 'Thiếu hocKy hoặc namHoc' });
    }

    const dot = await DotNhapDiemModel.getTrangThaiDotNhapDiem(hocKy, namHoc);
    if (!dot) {
      return res.json({ 
        trang_thai: 'CHUA_MO',
        message: 'Chưa có đợt nhập điểm cho học kỳ này'
      });
    }

    res.json(dot);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy trạng thái đợt', error: err.message });
  }
}

// Lấy tất cả đợt nhập điểm (cho admin)
export async function getAllDot(req, res) {
  try {
    const rows = await DotNhapDiemModel.getAllDotNhapDiem();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đợt', error: err.message });
  }
}

// Cập nhật trạng thái đợt (cho admin)
export async function updateTrangThaiDot(req, res) {
  try {
    const { hocKy, namHoc, trangThai } = req.body;
    if (!hocKy || !namHoc || !trangThai) {
      return res.status(400).json({ message: 'Thiếu hocKy, namHoc hoặc trangThai' });
    }

    const validStates = ['CHUA_MO', 'DOT_1_DANG_MO', 'DOT_1_DA_DONG', 'DOT_2_DANG_MO', 'DA_KHOA'];
    if (!validStates.includes(trangThai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const result = await DotNhapDiemModel.updateTrangThaiDot(hocKy, namHoc, trangThai);
    res.json({ message: 'Cập nhật trạng thái thành công', result });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: err.message });
  }
}

// Tạo đợt nhập điểm mới (cho admin)
export async function createDot(req, res) {
  try {
    const { hocKy, namHoc, ghiChu } = req.body;
    if (!hocKy || !namHoc) {
      return res.status(400).json({ message: 'Thiếu hocKy hoặc namHoc' });
    }

    const result = await DotNhapDiemModel.createDotNhapDiem(hocKy, namHoc, ghiChu);
    res.status(201).json({ message: 'Tạo đợt nhập điểm thành công', result });
  } catch (err) {
    // Nếu trùng unique key
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Học kỳ và năm học này đã tồn tại!' });
    }
    res.status(500).json({ message: 'Lỗi tạo đợt nhập điểm', error: err.message });
  }
}

// Xóa đợt nhập điểm (cho admin)
export async function deleteDot(req, res) {
  try {
    const { hocKy, namHoc } = req.params;
    if (!hocKy || !namHoc) {
      return res.status(400).json({ message: 'Thiếu hocKy hoặc namHoc' });
    }

    const result = await DotNhapDiemModel.deleteDotNhapDiem(hocKy, namHoc);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đợt nhập điểm' });
    }

    res.json({ message: 'Xóa đợt nhập điểm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa đợt nhập điểm', error: err.message });
  }
}