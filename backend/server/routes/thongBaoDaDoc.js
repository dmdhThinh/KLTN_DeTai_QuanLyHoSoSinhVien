import express from 'express'
import { getUnreadCount, markAsRead } from '../controllers/thongBaoDaDocController.js'

const router = express.Router()

router.get('/:sinhVienId', getUnreadCount)
router.post('/read', markAsRead)

export default router