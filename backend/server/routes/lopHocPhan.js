import { Router } from 'express'
import { getAll } from '../controllers/lophocphanController.js'

const router = Router()

// Lấy tất cả lớp học phần
router.get('/', getAll)

export default router
