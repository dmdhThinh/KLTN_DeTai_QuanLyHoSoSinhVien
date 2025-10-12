import { Router } from 'express'
import { getLichHoc, getLichThi } from '../controllers/lich.js'

const router = Router()

router.get('/hoc', getLichHoc)
router.get('/thi', getLichThi)

export default router
