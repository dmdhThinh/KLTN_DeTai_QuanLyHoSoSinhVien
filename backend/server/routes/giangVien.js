// server/routes/giangVien.js
import { Router } from 'express'
import {
  listGiangVien,
  getGiangVien,
  createGiangVien,
  updateGiangVien,
  deleteGiangVien
} from '../controllers/giangVienController.js'

const router = Router()

router.get('/', listGiangVien)
router.get('/:id', getGiangVien)
router.post('/', createGiangVien)
router.put('/:id', updateGiangVien)
router.delete('/:id', deleteGiangVien)

export default router