import * as DiemTrungBinhModel from '../models/diemTrungBinh.js';

// 🔄 Cập nhật điểm trung bình cho một học kỳ cụ thể
export async function capNhatDiemHocKy(req, res) {
  const { sinhVienId, hocKy, namHoc } = req.body;
  
  if (!sinhVienId || !hocKy || !namHoc) {
    return res.status(400).json({ 
      message: 'Thiếu thông tin: cần sinhVienId, hocKy và namHoc' 
    });
  }
  
  try {
    await DiemTrungBinhModel.capNhatDiemTrungBinh(sinhVienId, hocKy, namHoc);
    res.status(200).json({ 
      message: 'Đã cập nhật điểm trung bình thành công',
      data: { sinhVienId, hocKy, namHoc }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật điểm trung bình', 
      error: err.message 
    });
  }
}

// 🔄 Cập nhật điểm trung bình cho tất cả học kỳ của sinh viên
export async function capNhatTatCaDiem(req, res) {
  const { sinhVienId } = req.body;
  
  if (!sinhVienId) {
    return res.status(400).json({ message: 'Thiếu sinhVienId' });
  }
  
  try {
    const result = await DiemTrungBinhModel.capNhatTatCaDiemTrungBinh(sinhVienId);
    res.status(200).json({ 
      message: 'Đã cập nhật tất cả điểm trung bình',
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật tất cả điểm', 
      error: err.message 
    });
  }
}

// 📋 Lấy điểm trung bình theo học kỳ
export async function getDiemTheoHocKy(req, res) {
  const { sinhVienId, hocKy, namHoc } = req.query;
  
  if (!sinhVienId || !hocKy || !namHoc) {
    return res.status(400).json({ 
      message: 'Thiếu thông tin: cần sinhVienId, hocKy và namHoc' 
    });
  }
  
  try {
    const result = await DiemTrungBinhModel.getDiemTrungBinhTheoHocKy(sinhVienId, hocKy, namHoc);
    
    if (!result) {
      return res.status(404).json({ 
        message: 'Chưa có điểm trung bình cho học kỳ này' 
      });
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi lấy điểm theo học kỳ', 
      error: err.message 
    });
  }
}

// 📋 Lấy tất cả điểm trung bình của sinh viên
export async function getDiemTheoSinhVien(req, res) {
  const { sinhVienId } = req.query;
  
  if (!sinhVienId) {
    return res.status(400).json({ message: 'Thiếu sinhVienId' });
  }
  
  try {
    const rows = await DiemTrungBinhModel.getDiemTrungBinhTheoSinhVien(sinhVienId);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi lấy điểm sinh viên', 
      error: err.message 
    });
  }
}

// 📋 Lấy điểm tích lũy mới nhất
export async function getDiemTichLuyMoiNhat(req, res) {
  const { sinhVienId } = req.query;
  
  if (!sinhVienId) {
    return res.status(400).json({ message: 'Thiếu sinhVienId' });
  }
  
  try {
    const result = await DiemTrungBinhModel.getDiemTichLuyMoiNhat(sinhVienId);
    
    if (!result) {
      return res.status(404).json({ 
        message: 'Chưa có điểm tích lũy' 
      });
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi lấy điểm tích lũy', 
      error: err.message 
    });
  }
}

// ❌ Xóa điểm trung bình
export async function xoaDiem(req, res) {
  const { id } = req.params;
  
  try {
    const result = await DiemTrungBinhModel.xoaDiemTrungBinh(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy điểm để xóa' });
    }
    
    res.status(200).json({ message: 'Đã xóa điểm trung bình thành công' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Lỗi khi xóa điểm', 
      error: err.message 
    });
  }
}
