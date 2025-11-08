// server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import sinhvienRoutes from './routes/sinhVien.js'
import giangvienRoutes from './routes/giangVien.js'
import importRoutes from './routes/import.js'
import lichRoutes from './routes/lich.js'

import khoaRoutes from './routes/khoa.js'
import nganhRoutes from './routes/nganh.js'
import lopRoutes from './routes/lop.js'

import lichAdminRoutes from './routes/lichAdmin.js'
import lophocphanRoutes from './routes/lopHocPhan.js'

import hocphanRoutes from './routes/hocphan.js'

import importGiangVienRoutes from './routes/importGiangVien.js'
import taiKhoanRoutes from './routes/taiKhoan.js'
import ketQuaHocTapRoutes from './routes/ketQuaHocTap.js';
import diemTrungBinhRoutes from './routes/diemTrungBinh.js';

import thongBaoRoutes from './routes/thongBao.js'
import thongBaoDaDocRoutes from './routes/thongBaoDaDoc.js'

import chuongtrinhkhungRoutes from './routes/chuongtrinhkhung.js'
import dkhpRouter from './routes/dkhp.js'
import dotNhapDiemRoutes from './routes/dotNhapDiem.js'
dotenv.config()
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

// ✅ 1️⃣ Cấu hình truy cập file tĩnh (ảnh, video, file đính kèm, ...)
const uploadPath = path.join(__dirname, '..', 'uploads')
app.use('/uploads', express.static(uploadPath))
console.log('📂 Static path:', uploadPath)


// Prefix API để khớp frontend
app.use('/api/auth', authRoutes)
app.use('/api/sinhviens', sinhvienRoutes)
app.use('/api/giangviens', giangvienRoutes)
app.use('/api/import', importGiangVienRoutes)
app.use('/api/taikhoan', taiKhoanRoutes)
app.use('/api/lich', lichRoutes) 

app.use('/api/khoa', khoaRoutes)
app.use('/api/nganh', nganhRoutes)
app.use('/api/lop', lopRoutes)

app.use('/api/lich-admin', lichAdminRoutes)
app.use('/api/lophocphan', lophocphanRoutes)
app.use('/api/hocphan', hocphanRoutes)      

app.use('/api/ket-qua-hoc-tap', ketQuaHocTapRoutes);
app.use('/api/diem-trung-binh', diemTrungBinhRoutes);
app.use('/api/thongbao', thongBaoRoutes)
app.use('/api/thongbao-dadoc', thongBaoDaDocRoutes)

app.use('/api/chuongtrinhkhung', chuongtrinhkhungRoutes)
app.use('/api/dkhp', dkhpRouter)
app.use('/api/dot-nhap-diem', dotNhapDiemRoutes)

// ✅ Public folder cho ảnh thẻ
app.use('/uploads', express.static(path.resolve('uploads')))

// Import routes
app.use('/api/import', importRoutes)
// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint' }))

app.use(express.static('frontend/build'))
app.get('*', (req, res) =>
  res.sendFile(path.resolve('frontend', 'build', 'index.html'))
)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
