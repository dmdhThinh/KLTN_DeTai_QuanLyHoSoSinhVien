import { Router } from 'express';
import * as KetQuaHocTapController from '../controllers/ketQuaHocTapController.js';

const router = Router();

// 📊 Route đặc biệt phải đứng trước /:id
router.get('/chart-data', KetQuaHocTapController.getChartData);
router.get('/by-sinhvien', KetQuaHocTapController.getBySinhVien);

router.post('/', KetQuaHocTapController.create);
router.get('/', KetQuaHocTapController.getAll);
router.get('/:id', KetQuaHocTapController.getById);
router.put('/:id', KetQuaHocTapController.update);
router.delete('/:id', KetQuaHocTapController.deleteGrade);

export default router;
