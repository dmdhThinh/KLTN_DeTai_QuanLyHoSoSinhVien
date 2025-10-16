import { Router } from 'express'
import { getById ,getAll} from '../controllers/giangVienController.js'
const router = Router()

router.get('/', getAll)  
router.get('/:id', getById)

export default router
