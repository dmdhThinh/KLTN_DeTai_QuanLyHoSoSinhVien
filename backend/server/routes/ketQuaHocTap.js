import { Router } from 'express';
import multer from 'multer';
import * as KetQuaHocTapController from '../controllers/ketQuaHocTapController.js';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // thư mục tạm

router.post('/', KetQuaHocTapController.create);
router.get('/by-sinhvien', KetQuaHocTapController.getBySinhVien);
router.get('/', KetQuaHocTapController.getAll);
router.get('/:id', KetQuaHocTapController.getById);

// 👇 dùng multer để có req.file
router.post('/import', upload.single('file'), KetQuaHocTapController.importGrades);

router.put('/:id', KetQuaHocTapController.update);
router.delete('/:id', KetQuaHocTapController.deleteGrade);

export default router;
