/**
 * Setup Script - Initialize Circle Wallet for AI Agent
 * 
 * This script:
 * 1. Validates Circle API credentials
 * 2. Creates a wallet set (if needed)
 * 3. Creates an agent wallet on Arc Testnet
 * 4. Displays wallet address for funding
 */

import { circleClient, ARC_CONFIG } from '../config/circle.js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

async function setup() {
  console.log('🚀 Arc Agentic Commerce Backend Setup\n')

  try {
    // Step 1: Validate API credentials
    console.log('1️⃣  Validating Circle API credentials...')
    
    try {
      await circleClient.listWalletSets({ pageSize: 1 })
      console.log('✅ API credentials valid\n')
    } catch (error) {
      console.error('❌ Invalid API credentials')
      console.error('   Please check your CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET in .env')
      console.error('   Get credentials from: https://console.circle.com\n')
      process.exit(1)
    }

    // Step 2: Create or get wallet set
    console.log('2️⃣  Setting up wallet set...')
    
    let walletSetId = process.env.WALLET_SET_ID
    
    if (!walletSetId) {
      console.log('   Creating new wallet set...')
      const walletSetResponse = await circleClient.createWalletSet({
        name: 'AI Agent Wallet Set',
      })
      
      walletSetId = walletSetResponse.data?.walletSet?.id
      
      if (!walletSetId) {
        throw new Error('Failed to create wallet set')
      }
      
      console.log(`✅ Wallet set created: ${walletSetId}\n`)
      
      // Update .env file
      updateEnvFile('WALLET_SET_ID', walletSetId)
    } else {
      console.log(`✅ Using existing wallet set: ${walletSetId}\n`)
    }

    // Step 3: Create agent wallet on Arc Testnet
    console.log('3️⃣  Creating agent wallet on Arc Testnet...')
    
    const walletsResponse = await circleClient.createWallets({
      blockchains: [ARC_CONFIG.blockchain],
      count: 1,
      walletSetId,
      metadata: [{
        name: 'AI Agent Wallet',
        refId: 'ai-agent-main',
      }],
    })

    const wallet = walletsResponse.data?.wallets?.[0]
    
    if (!wallet) {
      throw new Error('Failed to create wallet')
    }

    console.log(`✅ Wallet created successfully!`)
    console.log(`   Address: ${wallet.address}`)
    console.log(`   Wallet ID: ${wallet.id}`)
    console.log(`   Blockchain: ${wallet.blockchain}\n`)

    // Update .env file with wallet ID
    updateEnvFile('AGENT_WALLET_ID', wallet.id)

    // Step 4: Display funding instructions
    console.log('4️⃣  Next Steps:\n')
    console.log('   📝 Your wallet address has been saved to .env')
    console.log(`   💰 Fund your wallet with testnet USDC:`)
    console.log(`      ${ARC_CONFIG.faucetUrl}`)
    console.log(`   🔍 View your wallet on Arc Explorer:`)
    console.log(`      ${ARC_CONFIG.explorerUrl}/address/${wallet.address}`)
    console.log(`   🚀 Start the server:`)
    console.log(`      npm run dev\n`)

    console.log('✅ Setup complete!\n')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error('\nPlease check your configuration and try again.')
    process.exit(1)
  }
}

/**
 * Update .env file with new value
 */
function updateEnvFile(key, value) {
  const envPath = path.resolve(process.cwd(), '.env')
  let envContent = ''

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  const regex = new RegExp(`^${key}=.*$`, 'm')
  
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`)
  } else {
    envContent += `\n${key}=${value}`
  }

  fs.writeFileSync(envPath, envContent)
}

// Run setup
setup()
