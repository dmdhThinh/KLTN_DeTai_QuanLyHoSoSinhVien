import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import sinhvienRoutes from './routes/sinhVien.js'
import giangvienRoutes from './routes/giangVien.js'
import importGiangVienRoutes from './routes/importGiangVien.js'

import importRoutes from './routes/import.js'
import lichRoutes from './routes/lich.js'

import khoaRoutes from './routes/khoa.js'
import nganhRoutes from './routes/nganh.js'
import lopRoutes from './routes/lop.js'

import lichAdminRoutes from './routes/lichAdmin.js'
import lophocphanRoutes from './routes/lopHocPhan.js'

import hocphanRoutes from './routes/hocphan.js'

import path from 'path'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// Prefix API để khớp frontend
app.use('/api/auth', authRoutes)
app.use('/api/sinhviens', sinhvienRoutes)
app.use('/api/giangviens', giangvienRoutes)
app.use('/api/import', importGiangVienRoutes)
app.use('/api/lich', lichRoutes) 

app.use('/api/khoa', khoaRoutes)
app.use('/api/nganh', nganhRoutes)
app.use('/api/lop', lopRoutes)

app.use('/api/lich-admin', lichAdminRoutes)
app.use('/api/lophocphan', lophocphanRoutes)
app.use('/api/hocphan', hocphanRoutes)

// ✅ Public folder cho ảnh thẻ
app.use('/uploads', express.static(path.resolve('uploads')))

// Import routes
app.use('/api/import', importRoutes)
// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint' }))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
