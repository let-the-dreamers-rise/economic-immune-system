/**
 * Script to check wallet details and help troubleshoot funding
 * Run with: node --experimental-modules scripts/check-wallet.js
 */

import dotenv from 'dotenv'
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

dotenv.config()

const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})

async function checkWallet() {
    console.log('🔍 Checking Circle Wallet Configuration...\n')

    const walletId = process.env.AGENT_WALLET_ID
    console.log(`Wallet ID: ${walletId}`)
    console.log(`Wallet Address: ${process.env.AGENT_WALLET_ADDRESS}\n`)

    try {
        // Get wallet info
        console.log('📋 Fetching wallet details...')
        const walletResponse = await circleClient.getWallet({ id: walletId })
        const wallet = walletResponse.data?.wallet

        console.log(`\nWallet Name: ${wallet?.name || 'N/A'}`)
        console.log(`Wallet State: ${wallet?.state}`)
        console.log(`Blockchain: ${wallet?.blockchain}`)
        console.log(`Address: ${wallet?.address}`)
        console.log(`Custody Type: ${wallet?.custodyType}`)

        // Get token balances
        console.log('\n💰 Fetching token balances...')
        const balanceResponse = await circleClient.getWalletTokenBalance({ id: walletId })
        const tokenBalances = balanceResponse.data?.tokenBalances || []

        console.log(`\nFound ${tokenBalances.length} token(s):`)

        for (const token of tokenBalances) {
            const amount = parseInt(token.amount || '0') / 1_000_000
            console.log(`  - ${token.token?.symbol || 'Unknown'}: ${amount.toFixed(6)} (raw: ${token.amount})`)
            console.log(`    Token ID: ${token.token?.id}`)
            console.log(`    Token Name: ${token.token?.name}`)
            console.log(`    Updated: ${token.updateDate}`)
        }

        if (tokenBalances.length === 0) {
            console.log('\n⚠️  No tokens found in wallet!')
            console.log('\nTo fund your wallet:')
            console.log('1. Go to https://console.circle.com')
            console.log('2. Navigate to your wallet')
            console.log('3. Use the testnet faucet within the console')
            console.log('\nOR use the Arc faucet but note that Circle SDK may not sync immediately with on-chain deposits.')
        }

    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.response?.data) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

checkWallet()
