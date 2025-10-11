import { Router } from 'express'
import { upload, importStudents, downloadTemplate } from '../controllers/importController.js'

const router = Router()

router.post('/students', upload.single('file'), importStudents)
router.get('/students/template', downloadTemplate)

export default router
