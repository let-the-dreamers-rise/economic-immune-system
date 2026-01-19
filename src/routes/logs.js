import express from 'express'
import { actionLogger } from '../utils/actionLogger.js'

export const logsRouter = express.Router()

/**
 * GET /logs
 * Retrieve action logs
 */
logsRouter.get('/', (req, res) => {
  try {
    const logs = actionLogger.getLogs()

    res.json({
      success: true,
      count: logs.length,
      logs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
      message: error.message,
    })
  }
})
