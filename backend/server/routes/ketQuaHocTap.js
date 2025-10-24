import { Router } from 'express';
import * as KetQuaHocTapController from '../controllers/ketQuaHocTapController.js';

const router = Router();

router.post('/', KetQuaHocTapController.create);
router.get('/by-sinhvien', KetQuaHocTapController.getBySinhVien);
router.get('/', KetQuaHocTapController.getAll);
router.get('/:id', KetQuaHocTapController.getById);


router.put('/:id', KetQuaHocTapController.update);
router.delete('/:id', KetQuaHocTapController.deleteGrade);
router.post('/import', KetQuaHocTapController.importGrades); // Để nhập điểm từ file Excel

export default router;
