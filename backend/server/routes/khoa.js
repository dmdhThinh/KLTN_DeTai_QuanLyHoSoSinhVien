// server/routes/khoa.js
import { Router } from 'express'
import multer from 'multer'
import { getAll, getById, create, update, remove, importKhoaFromExcel } from '../controllers/khoaController.js'
const router = Router()


// Cấu hình multer để upload file Excel
const upload = multer({ dest: 'uploads/' })

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

// 🧩 Import nhiều khoa
router.post('/import', upload.single('file'), importKhoaFromExcel)
export default router
