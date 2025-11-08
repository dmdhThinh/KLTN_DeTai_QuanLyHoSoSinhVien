import { Router } from 'express'
import * as ctrl from '../controllers/dkhpController.js'


const router = Router()


// Lấy đợt đăng ký hiện tại (NOW() ∈ [mở, đóng])
router.get('/dot/current', ctrl.getCurrentDot)


// Danh sách lớp học phần khả dụng + slot còn trống + cờ xung đột/đủ điều kiện (theo SV)
router.get('/available', ctrl.listAvailableLHP)


// Xem các đăng ký của SV trong một đợt
router.get('/my', ctrl.listMyRegistrations)


// Đăng ký một lớp học phần
router.post('/register', ctrl.registerLHP)


// Hủy đăng ký (trong thời gian đợt còn mở)
router.delete('/register/:dangKyId', ctrl.cancelRegistration)


// NEW: danh sách "Môn học phần đang chờ đăng ký" (server gom theo hoc_phan_id)
router.get('/hp/pending', ctrl.listPendingCourses)

// NEW: chi tiết lịch của 1 lớp học phần (để hiện modal “Xem”)
router.get('/lich/:lopHocPhanId', ctrl.getClassSchedule)

router.get('/lop-hoc-phan/:lopHocPhanId', ctrl.getStudentsByLopHocPhan)

export default router