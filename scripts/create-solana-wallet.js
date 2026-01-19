import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create developer-controlled wallets on Solana (following Circle's official guide)
 */
async function createSolanaWallets() {
  console.log('💼 Creating Circle Developer-Controlled Wallets on Solana\n');

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
      name: "Solana Agentic Finance WalletSet",
    });

    const walletSet = walletSetResponse.data?.walletSet;
    if (!walletSet) {
      throw new Error('Failed to create wallet set');
    }

    console.log('✅ Wallet set created successfully!');
    console.log(`   Wallet Set ID: ${walletSet.id}`);
    console.log(`   Custody Type: ${walletSet.custodyType}\n`);

    // Step 2: Create Solana Wallets (EOA as per Circle guide)
    console.log('Step 2: Creating Solana wallets...');
    const walletsResponse = await client.createWallets({
      accountType: 'EOA', // Externally Owned Account (for Solana)
      blockchains: ['SOL-DEVNET'], // Solana Devnet
      count: 2, // Create 2 wallets for transfers between them
      walletSetId: walletSet.id,
    });

    const wallets = walletsResponse.data?.wallets;
    if (!wallets || wallets.length === 0) {
      throw new Error('Failed to create wallets');
    }

    console.log('\n✅ Solana wallets created successfully!\n');
    
    // Display wallet details
    wallets.forEach((wallet, index) => {
      console.log(`Solana Wallet ${index + 1} Details:`);
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
    console.log('1. Add to .env file (for Solana wallets):');
    console.log(`   SOLANA_WALLET_ID=${wallets[0].id}`);
    console.log(`   SOLANA_WALLET_ADDRESS=${wallets[0].address}`);
    console.log(`   SOLANA_SECONDARY_WALLET_ID=${wallets[1].id}`);
    console.log(`   SOLANA_SECONDARY_WALLET_ADDRESS=${wallets[1].address}\n`);
    
    console.log('2. Fund wallets with testnet USDC:');
    console.log('   https://faucet.circle.com (select Solana Devnet)');
    console.log(`   Wallet 1: ${wallets[0].address}`);
    console.log(`   Wallet 2: ${wallets[1].address}\n`);
    
    console.log('3. Test transfers between wallets');
    console.log('4. Integrate with your application\n');

  } catch (error) {
    console.error('\n❌ Failed to create Solana wallets:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify CIRCLE_API_KEY is valid');
    console.log('2. Verify CIRCLE_ENTITY_SECRET is registered');
    console.log('3. Check Circle Console: https://console.circle.com\n');
    process.exit(1);
  }
}

createSolanaWallets();