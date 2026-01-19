import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'
import dotenv from 'dotenv'

dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['CIRCLE_API_KEY', 'CIRCLE_ENTITY_SECRET']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// Initialize Circle SDK client
export const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})

// Arc Testnet configuration
export const ARC_CONFIG = {
  blockchain: 'ARC-TESTNET',
  chainId: 5042002,
  explorerUrl: 'https://testnet.arcscan.app',
  rpcUrl: 'https://rpc.testnet.arc.network',
  usdcAddress: '0x3600000000000000000000000000000000000000',
  faucetUrl: 'https://faucet.circle.com'
}

// Wallet configuration
export const WALLET_CONFIG = {
  walletId: process.env.AGENT_WALLET_ID,
}

// Policy configuration
export const POLICY_CONFIG = {
  maxTransactionAmount: parseFloat(process.env.MAX_TRANSACTION_AMOUNT_USDC || '100'),
  dailySpendingLimit: parseFloat(process.env.DAILY_SPENDING_LIMIT_USDC || '1000'),
}
