import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create developer-controlled wallets following Circle's official guide
 * Step 1: Create a wallet set
 * Step 2: Create two wallets (for transfers between them)
 */
async function createWallets() {
  console.log('💼 Creating Circle Developer-Controlled Wallets\n');

  // Validate environment variables
  if (!process.env.CIRCLE_API_KEY) {
    throw new Error('CIRCLE_API_KEY not found in .env file');
  }

  if (!process.env.CIRCLE_ENTITY_SECRET || process.env.CIRCLE_ENTITY_SECRET.includes('your_')) {
    throw new Error('CIRCLE_ENTITY_SECRET not configured. Run: npm run circle:register');
  }

  try {
    // Initialize Circle SDK
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    // Step 1: Create a Wallet Set (following Circle's official guide)
    console.log('Step 1: Creating wallet set...');
    const walletSetResponse = await client.createWalletSet({
      name: "Agentic Finance Dashboard WalletSet",
    });

    const walletSet = walletSetResponse.data?.walletSet;
    if (!walletSet) {
      throw new Error('Failed to create wallet set');
    }

    console.log('✅ Wallet set created successfully!');
    console.log(`   Wallet Set ID: ${walletSet.id}`);
    console.log(`   Custody Type: ${walletSet.custodyType}\n`);

    // Step 2: Create Wallets (creating 2 as per Circle guide for transfers)
    console.log('Step 2: Creating wallets...');
    const walletsResponse = await client.createWallets({
      accountType: 'SCA', // Smart Contract Account
      blockchains: ['MATIC-AMOY'], // Using Polygon Amoy as per Circle guide
      count: 2, // Create 2 wallets for transfers between them
      walletSetId: walletSet.id,
    });

    const wallets = walletsResponse.data?.wallets;
    if (!wallets || wallets.length === 0) {
      throw new Error('Failed to create wallets');
    }

    console.log('\n✅ Wallets created successfully!\n');
    
    // Display wallet details
    wallets.forEach((wallet, index) => {
      console.log(`Wallet ${index + 1} Details:`);
      console.log('─────────────────────────────────────────────────────');
      console.log(`Wallet ID:     ${wallet.id}`);
      console.log(`Address:       ${wallet.address}`);
      console.log(`Blockchain:    ${wallet.blockchain}`);
      console.log(`Account Type:  ${wallet.accountType}`);
      console.log(`State:         ${wallet.state}`);
      console.log(`Wallet Set ID: ${wallet.walletSetId}`);
      console.log('─────────────────────────────────────────────────────\n');
    });

    // Instructions for next steps
    console.log('📝 Next steps:\n');
    console.log('1. Add to .env file:');
    console.log(`   AGENT_WALLET_ID=${wallets[0].id}`);
    console.log(`   AGENT_WALLET_ADDRESS=${wallets[0].address}`);
    console.log(`   SECONDARY_WALLET_ID=${wallets[1].id}`);
    console.log(`   SECONDARY_WALLET_ADDRESS=${wallets[1].address}\n`);
    
    console.log('2. Fund wallets with testnet USDC:');
    console.log('   https://faucet.circle.com');
    console.log(`   Wallet 1: ${wallets[0].address}`);
    console.log(`   Wallet 2: ${wallets[1].address}\n`);
    
    console.log('3. Verify setup:');
    console.log('   npm run circle:verify\n');
    
    console.log('4. Start application:');
    console.log('   npm run dev:all\n');

    // Save wallet info to a file for easy reference
    const walletInfo = {
      walletSet: {
        id: walletSet.id,
        name: "Agentic Finance Dashboard WalletSet",
        custodyType: walletSet.custodyType,
        createDate: walletSet.createDate
      },
      wallets: wallets.map(wallet => ({
        id: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
        accountType: wallet.accountType,
        state: wallet.state,
        walletSetId: wallet.walletSetId,
        createDate: wallet.createDate
      }))
    };

    console.log('💾 Wallet information saved to: wallet-info.json\n');
    
    // Note: In a real implementation, you'd save this to a file
    // For now, just log the JSON for manual copying
    console.log('Wallet Info JSON:');
    console.log(JSON.stringify(walletInfo, null, 2));

  } catch (error) {
    console.error('\n❌ Failed to create wallets:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\nTroubleshooting:');
      console.log('1. Verify CIRCLE_API_KEY is valid');
      console.log('2. Check Circle Console: https://console.circle.com');
    } else if (error.message.includes('Entity Secret')) {
      console.log('\nTroubleshooting:');
      console.log('1. Verify CIRCLE_ENTITY_SECRET is registered');
      console.log('2. Run: npm run circle:register');
    } else {
      console.log('\nTroubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Circle service status');
      console.log('3. Check Circle Console: https://console.circle.com');
    }
    console.log('');
    process.exit(1);
  }
}

createWallets();
