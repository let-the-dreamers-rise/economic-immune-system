import { circleClient, ARC_CONFIG, WALLET_CONFIG } from '../config/circle.js'
import { logger } from '../utils/logger.js'

/**
 * Get USDC balance for the agent wallet
 * @returns {Promise<Object>} Balance information
 */
export async function getBalance() {
  try {
    if (!WALLET_CONFIG.walletId) {
      throw new Error('Wallet ID not configured. Run setup script first.')
    }

    logger.info('Fetching wallet balance', { walletId: WALLET_CONFIG.walletId })

    const response = await circleClient.getWalletTokenBalance({
      id: WALLET_CONFIG.walletId,
    })

    // Find USDC token balance
    const usdcBalance = response.data?.tokenBalances?.find(
      token => token.token?.symbol === 'USDC'
    )

    if (!usdcBalance) {
      logger.warn('No USDC balance found for wallet')
      return {
        balance: '0.00',
        balanceRaw: '0',
        currency: 'USDC',
        blockchain: ARC_CONFIG.blockchain,
      }
    }

    const balanceRaw = usdcBalance.amount || '0'
    const balance = (parseFloat(balanceRaw) / 1_000_000).toFixed(2)

    logger.info('Balance retrieved successfully', { balance, balanceRaw })

    return {
      balance,
      balanceRaw,
      currency: 'USDC',
      blockchain: ARC_CONFIG.blockchain,
      tokenId: usdcBalance.token?.id,
    }
  } catch (error) {
    logger.error('Error fetching balance:', error)
    throw error
  }
}

/**
 * Get wallet details
 * @returns {Promise<Object>} Wallet information
 */
export async function getWalletInfo() {
  try {
    if (!WALLET_CONFIG.walletId) {
      throw new Error('Wallet ID not configured')
    }

    const response = await circleClient.getWallet({
      id: WALLET_CONFIG.walletId,
    })

    return response.data?.wallet
  } catch (error) {
    logger.error('Error fetching wallet info:', error)
    throw error
  }
}
