// server/routes/statistics.js
import express from 'express'
import { getStatistics } from '../controllers/statisticsController.js'

const router = express.Router()

router.get('/', getStatistics)

export default router
