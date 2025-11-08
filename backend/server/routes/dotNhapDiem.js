import { Router } from 'express';
import * as ctrl from '../controllers/dotNhapDiemController.js';

const router = Router();

// Lấy trạng thái đợt nhập điểm theo học kỳ + năm học
router.get('/trang-thai', ctrl.getTrangThaiDot);

// Lấy tất cả đợt nhập điểm (cho admin)
router.get('/all', ctrl.getAllDot);

// Tạo đợt nhập điểm mới (cho admin)
router.post('/create', ctrl.createDot);

// Cập nhật trạng thái đợt (cho admin)
router.put('/update', ctrl.updateTrangThaiDot);

// Xóa đợt nhập điểm (cho admin)
router.delete('/delete/:hocKy/:namHoc', ctrl.deleteDot);

export default router;
