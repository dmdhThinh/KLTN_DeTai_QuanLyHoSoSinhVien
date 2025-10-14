// routes/nganhRoutes.js
import express from 'express'
import {
  getAllNganh,
  getNganhById,
  createNganh,
  updateNganh,
  deleteNganh
} from '../controllers/nganhController.js'

const router = express.Router()

router.get('/', getAllNganh)
router.get('/:id', getNganhById)
router.post('/', createNganh)
router.put('/:id', updateNganh)
router.delete('/:id', deleteNganh)

export default router
