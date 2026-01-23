/**
 * Script to execute a test micro-transaction on Arc Testnet
 * Run with: node scripts/test-payment.js
 */

import dotenv from 'dotenv'
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

dotenv.config()

const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})

async function testPayment() {
    console.log('🚀 Executing test micro-transaction on Arc Testnet...\n')

    const walletId = process.env.AGENT_WALLET_ID
    const recipient = process.env.SECONDARY_WALLET_ADDRESS
    const amount = '0.000001' // 1 micro-unit

    console.log(`From (Wallet ID): ${walletId}`)
    console.log(`To (Address): ${recipient}`)
    console.log(`Amount: ${amount} USDC\n`)

    try {
        // 1. Get Token ID
        console.log('🔍 Finding USDC token ID...')
        const balanceResponse = await circleClient.getWalletTokenBalance({ id: walletId })
        const usdcToken = balanceResponse.data?.tokenBalances?.find(
            token => token.token?.symbol === 'USDC' || token.token?.symbol === 'USDC-TESTNET'
        )

        if (!usdcToken) {
            console.error('❌ USDC token not found in wallet!')
            console.log('Tokens found:', JSON.stringify(balanceResponse.data?.tokenBalances, null, 2))
            return
        }

        const tokenId = usdcToken.token.id
        console.log(`✅ Token ID found: ${tokenId} (${usdcToken.token.symbol})\n`)

        // 2. Execute Transaction
        console.log('💸 Creating transaction...')
        const txResponse = await circleClient.createTransaction({
            walletId,
            tokenId,
            amount: [amount],
            destinationAddress: recipient,
            fee: {
                type: 'level',
                config: {
                    feeLevel: 'MEDIUM',
                },
            },
            refId: `TEST-${Date.now()}`,
        })

        const txId = txResponse.data?.id
        console.log(`✅ Transaction created! ID: ${txId}`)
        console.log(`Current State: ${txResponse.data?.state}\n`)

        // 3. Poll for Status
        console.log('⏳ Polling for status and TxHash...')
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
            const statusResponse = await circleClient.getTransaction({ id: txId })
            const tx = statusResponse.data?.transaction

            console.log(`Attempt ${attempts + 1}: State=${tx?.state}, TxHash=${tx?.txHash || 'Pending...'}`)

            if (tx?.txHash) {
                console.log('\n🎉 Transaction broadcast to blockchain!')
                console.log(`TxHash: ${tx.txHash}`)
                console.log(`Explorer: https://testnet.arcscan.app/tx/${tx.txHash}`)
                return
            }

            if (tx?.state === 'FAILED') {
                console.error('\n❌ Transaction FAILED in Circle system!')
                return
            }

            await new Promise(r => setTimeout(r, 2000))
            attempts++
        }

        console.log('\n⚠️ Transaction taking longer than expected to broadcast.')
        console.log('Check status later in Circle Console or Explorer.')

    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.response?.data) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

testPayment()
