import { Router } from 'express';
import * as LopHocPhanController from '../controllers/lophocphanController.js';

const router = Router();

// CRUD operations for LopHocPhan
router.get('/by-giangvien/:giangVienId', LopHocPhanController.getLopHocPhanByGiangVien);
router.get('/:id/sinhvien', LopHocPhanController.getSinhVienByLopHocPhan);  // Lấy SV trong lớp
router.post('/', LopHocPhanController.create);  // Create
router.get('/', LopHocPhanController.getAll);  // Read All
router.get('/:id', LopHocPhanController.getById);  // Read by ID
router.put('/:id', LopHocPhanController.update);  // Update
router.delete('/:id', LopHocPhanController.deleteLopHocPhan);  // Delete

export default router;
