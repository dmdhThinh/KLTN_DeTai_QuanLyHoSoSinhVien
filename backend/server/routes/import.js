import express from 'express'
import { upload, importStudents, downloadTemplate } from '../controllers/importController.js'

const router = express.Router()

// 📥 Import danh sách sinh viên
router.post('/students', upload.single('file'), importStudents)

// 📤 Tải file mẫu sinh viên (đầy đủ Khoa - Ngành - Lớp)
router.get('/students/template', downloadTemplate)

export default router