import express from 'express'
import { getBalance, getWalletInfo } from '../services/walletService.js'
import { actionLogger } from '../utils/actionLogger.js'
import { logger } from '../utils/logger.js'

export const balanceRouter = express.Router()

/**
 * GET /balance
 * Check USDC balance of agent wallet
 */
balanceRouter.get('/', async (req, res) => {
  try {
    const balanceInfo = await getBalance()
    const walletInfo = await getWalletInfo()

    // Log the balance check action
    actionLogger.log({
      action: 'balance_check',
      walletBalance: balanceInfo.balance,
      executed: true,
    })

    res.json({
      success: true,
      data: {
        ...balanceInfo,
        walletAddress: walletInfo?.address,
        walletId: walletInfo?.id,
      },
    })
  } catch (error) {
    logger.error('Balance check failed:', error)
    
    actionLogger.log({
      action: 'balance_check',
      executed: false,
      error: error.message,
    })

    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance',
      message: error.message,
    })
  }
})
