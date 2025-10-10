import { Router } from 'express'
import { getById } from '../controllers/sinhVienController.js'
const router = Router()

router.get('/:id', getById)


export default router
