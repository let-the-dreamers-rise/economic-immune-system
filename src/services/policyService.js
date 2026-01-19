import { POLICY_CONFIG } from '../config/circle.js'
import { logger } from '../utils/logger.js'
import { actionLogger } from '../utils/actionLogger.js'

/**
 * Policy Hook - Validate payment before execution
 * 
 * This is where you add custom validation logic:
 * - Budget checks
 * - Value evaluation
 * - Risk scoring
 * - Recipient validation
 * - Time-based limits
 * - Multi-signature requirements
 * 
 * @param {Object} paymentRequest - Payment request details
 * @param {string} paymentRequest.recipient - Recipient address
 * @param {string} paymentRequest.amount - Amount in USDC
 * @param {string} paymentRequest.reason - Payment reason
 * @param {string} walletBalance - Current wallet balance in USDC
 * @returns {Promise<Object>} Validation result { allowed: boolean, reason: string }
 */
export async function validatePayment(paymentRequest, walletBalance) {
  const { recipient, amount, reason } = paymentRequest
  const amountNum = parseFloat(amount)
  const balanceNum = parseFloat(walletBalance)

  logger.info('Validating payment through policy hook', {
    recipient,
    amount,
    walletBalance,
    reason,
  })

  // Rule 1: Amount must be positive
  if (amountNum <= 0) {
    return {
      allowed: false,
      reason: 'Amount must be greater than zero',
    }
  }

  // Rule 2: Check maximum transaction amount
  if (amountNum > POLICY_CONFIG.maxTransactionAmount) {
    return {
      allowed: false,
      reason: `Amount exceeds maximum transaction limit of ${POLICY_CONFIG.maxTransactionAmount} USDC`,
    }
  }

  // Rule 3: Check sufficient balance (with buffer for gas)
  const gasBuffer = 0.01 // Small buffer for gas fees
  if (amountNum > balanceNum - gasBuffer) {
    return {
      allowed: false,
      reason: 'Insufficient balance (including gas buffer)',
    }
  }

  // Rule 4: Check daily spending limit
  const todaySpent = await getDailySpending()
  if (todaySpent + amountNum > POLICY_CONFIG.dailySpendingLimit) {
    return {
      allowed: false,
      reason: `Would exceed daily spending limit of ${POLICY_CONFIG.dailySpendingLimit} USDC (spent today: ${todaySpent.toFixed(2)})`,
    }
  }

  // Rule 5: Validate recipient address format (basic check)
  if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
    return {
      allowed: false,
      reason: 'Invalid recipient address format',
    }
  }

  // TODO: Add your custom policy rules here
  // Examples:
  // - Whitelist/blacklist checks
  // - Risk scoring based on recipient
  // - Time-based restrictions (e.g., no payments after hours)
  // - Multi-signature requirements for large amounts
  // - Velocity checks (max transactions per hour)
  // - Geographic restrictions
  // - Compliance checks

  logger.info('Payment approved by policy', { recipient, amount })

  return {
    allowed: true,
    reason: 'Payment approved by policy',
  }
}

/**
 * Calculate total spending for today
 * @returns {Promise<number>} Total spent today in USDC
 */
async function getDailySpending() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const logs = actionLogger.getLogs()
    
    const todayPayments = logs.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      return logDate === today && log.action === 'payment' && log.executed
    })

    const totalSpent = todayPayments.reduce((sum, log) => {
      return sum + parseFloat(log.amount || 0)
    }, 0)

    return totalSpent
  } catch (error) {
    logger.error('Error calculating daily spending:', error)
    return 0
  }
}
