import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// GET /api/dot-dang-ky - Lấy tất cả đợt đăng ký
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM DotDangKy ORDER BY nam_hoc DESC, hoc_ky DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đợt đăng ký', error: err.message })
  }
})

export default router