import express from 'express'
import { executePayment } from '../services/paymentService.js'
import { getBalance } from '../services/walletService.js'
import { validatePayment } from '../services/policyService.js'
import { actionLogger } from '../utils/actionLogger.js'
import { logger } from '../utils/logger.js'
import { ARC_CONFIG } from '../config/circle.js'

export const paymentRouter = express.Router()

/**
 * POST /pay
 * Execute a USDC payment
 * 
 * Body:
 * {
 *   "recipient": "0x...",
 *   "amount": "10.50",
 *   "reason": "Payment for AI service"
 * }
 */
paymentRouter.post('/', async (req, res) => {
  try {
    const { recipient, amount, reason } = req.body

    // Validate request
    if (!recipient || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipient and amount',
      })
    }

    // Get current balance
    const balanceInfo = await getBalance()
    const walletBalance = balanceInfo.balance

    // Run through policy hook
    const policyResult = await validatePayment(
      { recipient, amount, reason },
      walletBalance
    )

    // Log the payment attempt
    const logEntry = {
      action: 'payment',
      amount,
      recipient,
      reason,
      walletBalance,
      executed: policyResult.allowed,
      policyReason: policyResult.reason,
    }

    if (!policyResult.allowed) {
      logger.warn('Payment blocked by policy', logEntry)
      actionLogger.log(logEntry)

      return res.status(403).json({
        success: false,
        error: 'Payment denied by policy',
        reason: policyResult.reason,
      })
    }

    // Execute payment
    const result = await executePayment(recipient, amount, reason)

    // Update log with transaction details
    logEntry.executed = true
    logEntry.transactionId = result.transactionId
    logEntry.state = result.state
    actionLogger.log(logEntry)

    logger.info('Payment executed successfully', result)

    res.json({
      success: true,
      data: {
        transactionId: result.transactionId,
        state: result.state,
        amount: result.amount,
        recipient: result.recipient,
        message: 'Payment initiated. Use /transaction/:id to check status.',
      },
    })
  } catch (error) {
    logger.error('Payment execution failed:', error)

    actionLogger.log({
      action: 'payment',
      amount: req.body.amount,
      recipient: req.body.recipient,
      executed: false,
      error: error.message,
    })

    res.status(500).json({
      success: false,
      error: 'Failed to execute payment',
      message: error.message,
    })
  }
})
