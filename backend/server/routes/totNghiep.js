import { Router } from 'express';
import * as TotNghiepController from '../controllers/totNghiepController.js';

const router = Router();

// Kiểm tra điều kiện tốt nghiệp
router.get('/kiem-tra/:sinhVienId', TotNghiepController.kiemTraDieuKien);

// Tạo hồ sơ tốt nghiệp
router.post('/tao-ho-so', TotNghiepController.taoHoSo);

// Tạo hồ sơ tốt nghiệp hàng loạt
router.post('/tao-ho-so-hang-loat', TotNghiepController.taoHoSoHangLoat);

// Xét tốt nghiệp
router.post('/xet/:hoSoId', TotNghiepController.xetTotNghiep);

// Xét tốt nghiệp hàng loạt
router.post('/xet-hang-loat', TotNghiepController.xetHangLoat);

// Lấy hồ sơ theo đợt xét
router.get('/ho-so/:dotXetId', TotNghiepController.getHoSoTheoDot);

// Lấy danh sách đợt xét
router.get('/dot-xet', TotNghiepController.getDotXet);

// Tạo đợt xét mới
router.post('/dot-xet', TotNghiepController.taoDotXet);

// Lấy danh sách khóa học
router.get('/khoa-hoc', TotNghiepController.getKhoaHoc);

export default router;

