/**
 * Script to create a new Circle wallet on Arc Testnet
 * Run with: node scripts/create-arc-wallet.js
 */

import dotenv from 'dotenv'
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

dotenv.config()

const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})

async function createArcWallet() {
    console.log('🚀 Creating wallet on Arc Testnet...\n')

    try {
        // First, create a wallet set for Arc
        console.log('📋 Creating wallet set for Arc...')
        const walletSetResponse = await circleClient.createWalletSet({
            name: 'AI Agent Wallets - Arc Testnet',
        })

        const walletSetId = walletSetResponse.data?.walletSet?.id
        console.log(`Wallet Set ID: ${walletSetId}`)

        // Create wallet on Arc testnet
        console.log('\n💳 Creating wallet on Arc Testnet...')
        const walletResponse = await circleClient.createWallets({
            walletSetId,
            count: 1,
            blockchains: ['ARC-TESTNET'],
        })

        const wallet = walletResponse.data?.wallets?.[0]

        if (wallet) {
            console.log('\n✅ Wallet created successfully!')
            console.log('=====================================')
            console.log(`Wallet ID: ${wallet.id}`)
            console.log(`Wallet Address: ${wallet.address}`)
            console.log(`Blockchain: ${wallet.blockchain}`)
            console.log(`State: ${wallet.state}`)
            console.log('=====================================')
            console.log('\n📝 Add these to your .env file:')
            console.log(`AGENT_WALLET_ID=${wallet.id}`)
            console.log(`AGENT_WALLET_ADDRESS=${wallet.address}`)
            console.log(`WALLET_SET_ID=${walletSetId}`)
            console.log('\n💰 Then fund your wallet at: https://faucet.circle.com')
            console.log(`   Address: ${wallet.address}`)
            console.log('   Network: Arc Testnet')
        } else {
            console.log('❌ Failed to create wallet')
            console.log('Response:', JSON.stringify(walletResponse.data, null, 2))
        }

    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.response?.data) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

createArcWallet()
