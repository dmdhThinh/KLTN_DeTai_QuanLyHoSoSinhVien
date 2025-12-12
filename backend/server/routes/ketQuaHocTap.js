import { Router } from 'express';
import * as KetQuaHocTapController from '../controllers/ketQuaHocTapController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// 📊 Route đặc biệt phải đứng trước /:id
router.get('/chart-data', KetQuaHocTapController.getChartData);
router.get('/by-sinhvien', KetQuaHocTapController.getBySinhVien);

router.post('/', authenticateToken, KetQuaHocTapController.create);
router.get('/', KetQuaHocTapController.getAll);
router.get('/:id', KetQuaHocTapController.getById);
// Thêm middleware authenticateToken cho route update để lấy thông tin user
router.put('/:id', authenticateToken, KetQuaHocTapController.update);
router.delete('/:id', KetQuaHocTapController.deleteGrade);

export default router;
