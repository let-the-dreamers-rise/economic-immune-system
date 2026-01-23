/**
 * Script to create a secondary wallet on Arc Testnet for receiving test transfers
 * Run with: node scripts/create-secondary-arc-wallet.js
 */

import dotenv from 'dotenv'
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

dotenv.config()

const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})

async function createSecondaryWallet() {
    console.log('🚀 Creating SECONDARY wallet on Arc Testnet for demo transfers...\n')

    const walletSetId = process.env.WALLET_SET_ID
    console.log(`Using Wallet Set: ${walletSetId}\n`)

    try {
        // Create wallet on Arc testnet in the same wallet set
        console.log('💳 Creating secondary wallet...')
        const walletResponse = await circleClient.createWallets({
            walletSetId,
            count: 1,
            blockchains: ['ARC-TESTNET'],
        })

        const wallet = walletResponse.data?.wallets?.[0]

        if (wallet) {
            console.log('\n✅ Secondary wallet created!')
            console.log('=====================================')
            console.log(`Secondary Wallet ID: ${wallet.id}`)
            console.log(`Secondary Address: ${wallet.address}`)
            console.log(`Blockchain: ${wallet.blockchain}`)
            console.log('=====================================')
            console.log('\n📝 Update your .env with:')
            console.log(`SECONDARY_WALLET_ID=${wallet.id}`)
            console.log(`SECONDARY_WALLET_ADDRESS=${wallet.address}`)
            console.log('\n🔄 For demo, transfer from main wallet to this secondary wallet')
        } else {
            console.log('❌ Failed to create wallet')
        }

    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.response?.data) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

createSecondaryWallet()
