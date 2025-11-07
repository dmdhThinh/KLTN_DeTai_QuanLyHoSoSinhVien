import { Router } from 'express';
import * as DiemTrungBinhController from '../controllers/diemTrungBinhController.js';

const router = Router();

// 🔄 Cập nhật điểm trung bình
router.post('/cap-nhat-hoc-ky', DiemTrungBinhController.capNhatDiemHocKy);
router.post('/cap-nhat-tat-ca', DiemTrungBinhController.capNhatTatCaDiem);

// 📋 Lấy điểm trung bình
router.get('/theo-hoc-ky', DiemTrungBinhController.getDiemTheoHocKy);
router.get('/theo-sinh-vien', DiemTrungBinhController.getDiemTheoSinhVien);
router.get('/tich-luy-moi-nhat', DiemTrungBinhController.getDiemTichLuyMoiNhat);

// ❌ Xóa điểm trung bình
router.delete('/:id', DiemTrungBinhController.xoaDiem);

export default router;
