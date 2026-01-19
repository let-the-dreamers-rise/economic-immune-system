import express from 'express'
import { getTransactionStatus } from '../services/paymentService.js'
import { logger } from '../utils/logger.js'

export const transactionRouter = express.Router()

/**
 * GET /transaction/:id
 * Get transaction status
 */
transactionRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required',
      })
    }

    const transaction = await getTransactionStatus(id)

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    logger.error('Failed to fetch transaction:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message,
    })
  }
})
