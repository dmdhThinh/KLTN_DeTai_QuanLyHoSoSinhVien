// server/routes/auth.js
import { Router } from 'express'
import { login, changePassword, updatePassword } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.post('/change-password', changePassword)
router.post('/update-password', updatePassword)

export default router