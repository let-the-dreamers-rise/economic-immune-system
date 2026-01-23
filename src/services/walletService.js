import { circleClient, ARC_CONFIG, WALLET_CONFIG } from '../config/circle.js'
import { logger } from '../utils/logger.js'

/**
 * Get USDC balance for the agent wallet
 * Fetches from Circle SDK first, falls back to on-chain query if needed
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

    // Debug: Log full response to see what Circle returns
    logger.info('Circle SDK raw response', {
      tokenBalances: JSON.stringify(response.data?.tokenBalances),
      fullData: JSON.stringify(response.data)
    })

    // Get all token balances
    const tokenBalances = response.data?.tokenBalances || []

    // Find USDC token balance - check for symbol or native token
    let usdcBalance = tokenBalances.find(
      token => token.token?.symbol === 'USDC' || token.token?.symbol === 'USDC-TESTNET' || token.token?.name?.includes('USD Coin')
    )

    // If exact USDC matches not found, fallback to the first available token (often the case in testnets)
    if (!usdcBalance && tokenBalances.length > 0) {
      usdcBalance = tokenBalances[0];
      logger.info('Using fallback token as USDC', { symbol: usdcBalance.token?.symbol });
    }

    // Calculate total balance safely (using parseFloat instead of BigInt for durability against decimals)
    let totalBalance = '0'
    if (tokenBalances.length > 0) {
      const totalRaw = tokenBalances.reduce((sum, token) => {
        return sum + parseFloat(token.amount || '0')
      }, 0)
      totalBalance = (totalRaw / 1_000_000).toFixed(9)
    }

    if (!usdcBalance && tokenBalances.length === 0) {
      logger.warn('No USDC balance found for wallet')
      return {
        balance: '0.00',
        balanceRaw: '0',
        currency: 'USDC',
        blockchain: ARC_CONFIG.blockchain,
      }
    }

    // Use USDC balance if found, otherwise use the calculated total
    const balanceRaw = usdcBalance?.amount || '0'
    const balance = usdcBalance
      ? (parseFloat(balanceRaw) / 1_000_000).toFixed(9)
      : totalBalance

    logger.info('Balance retrieved successfully', { balance, balanceRaw, totalBalance })

    return {
      balance,
      balanceRaw,
      currency: 'USDC',
      blockchain: ARC_CONFIG.blockchain,
      tokenId: usdcBalance?.token?.id,
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
