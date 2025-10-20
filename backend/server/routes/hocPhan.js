import { Router } from 'express'
import * as HocPhanController from '../controllers/hocPhanControllers.js'

const router = Router()

router.post('/', HocPhanController.create)
router.get('/', HocPhanController.getAll)
router.get('/:id', HocPhanController.getById)
router.put('/:id', HocPhanController.update)
router.delete('/:id', HocPhanController.deleteHocPhan)

export default router
