import { circleClient, ARC_CONFIG, WALLET_CONFIG } from '../config/circle.js'
import { logger } from '../utils/logger.js'
import { getBalance } from './walletService.js'

/**
 * Execute a USDC payment on Arc
 * @param {string} recipient - Recipient wallet address
 * @param {string} amount - Amount in USDC (decimal format)
 * @param {string} reason - Human-readable reason for payment
 * @returns {Promise<Object>} Transaction details
 */
export async function executePayment(recipient, amount, reason = '') {
  try {
    if (!WALLET_CONFIG.walletId) {
      throw new Error('Wallet ID not configured')
    }

    logger.info('Executing payment', { recipient, amount, reason })

    // Get current balance to include token ID
    const balanceInfo = await getBalance()
    
    if (!balanceInfo.tokenId) {
      throw new Error('USDC token not found in wallet')
    }

    // Create transaction
    const response = await circleClient.createTransaction({
      walletId: WALLET_CONFIG.walletId,
      tokenId: balanceInfo.tokenId,
      amount: [amount],
      destinationAddress: recipient,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM',
        },
      },
      refId: reason || 'AI Agent Payment',
    })

    const transactionId = response.data?.id
    const state = response.data?.state

    logger.info('Payment transaction created', {
      transactionId,
      state,
      recipient,
      amount,
    })

    return {
      transactionId,
      state,
      amount,
      recipient,
    }
  } catch (error) {
    logger.error('Error executing payment:', error)
    throw error
  }
}

/**
 * Get transaction status
 * @param {string} transactionId - Circle transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export async function getTransactionStatus(transactionId) {
  try {
    logger.info('Fetching transaction status', { transactionId })

    const response = await circleClient.getTransaction({
      id: transactionId,
    })

    const transaction = response.data?.transaction

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    return {
      id: transaction.id,
      state: transaction.state,
      txHash: transaction.txHash,
      amount: transaction.amounts?.[0],
      recipient: transaction.destinationAddress,
      blockchain: transaction.blockchain,
      createDate: transaction.createDate,
      firstConfirmDate: transaction.firstConfirmDate,
      networkFee: transaction.networkFee,
      explorerUrl: transaction.txHash 
        ? `${ARC_CONFIG.explorerUrl}/tx/${transaction.txHash}`
        : null,
    }
  } catch (error) {
    logger.error('Error fetching transaction status:', error)
    throw error
  }
}
