import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import sinhvienRoutes from './routes/sinhVien.js'
import giangvienRoutes from './routes/giangVien.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// Prefix API để khớp frontend
app.use('/api/auth', authRoutes)
app.use('/api/sinhviens', sinhvienRoutes)
app.use('/api/giangviens', giangvienRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint' }))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
