import { Router } from 'express'
import { chatWithBot } from '../controllers/chatbotController.js'

const router = Router()

router.post('/chat', chatWithBot)

export default router
