import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Verify Circle SDK setup and credentials
 */
async function verifySetup() {
  console.log('🔍 Verifying Circle SDK Setup\n');

  // Check environment variables
  const checks = {
    'CIRCLE_API_KEY': process.env.CIRCLE_API_KEY,
    'CIRCLE_ENTITY_SECRET': process.env.CIRCLE_ENTITY_SECRET,
    'AGENT_WALLET_ID': process.env.AGENT_WALLET_ID,
  };

  let allValid = true;

  for (const [key, value] of Object.entries(checks)) {
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`❌ ${key}: Not configured`);
      allValid = false;
    } else {
      console.log(`✅ ${key}: Configured`);
    }
  }

  if (!allValid) {
    console.log('\n⚠️  Setup incomplete. Run: npm run circle:register\n');
    process.exit(1);
  }

  // Test SDK initialization
  try {
    console.log('\n🔌 Testing Circle SDK connection...');
    
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    // Test API call - get public key
    const response = await client.getPublicKey();
    
    if (response.data?.publicKey) {
      console.log('✅ Circle SDK connected successfully');
      console.log(`   Public Key: ${response.data.publicKey.substring(0, 50)}...`);
    }

    // Test wallet access
    if (process.env.AGENT_WALLET_ID && !process.env.AGENT_WALLET_ID.includes('your_')) {
      console.log('\n💼 Testing wallet access...');
      
      const walletResponse = await client.getWallet({
        id: process.env.AGENT_WALLET_ID,
      });

      if (walletResponse.data?.wallet) {
        console.log('✅ Wallet accessible');
        console.log(`   Wallet ID: ${walletResponse.data.wallet.id}`);
        console.log(`   Address: ${walletResponse.data.wallet.address}`);
        console.log(`   Blockchain: ${walletResponse.data.wallet.blockchain}`);
      }
    }

    console.log('\n✅ All checks passed! Circle SDK is ready.\n');
    console.log('Next steps:');
    console.log('1. Fund your wallet: https://faucet.circle.com');
    console.log('2. Start the backend: npm run dev:backend');
    console.log('3. Test a payment via the dashboard\n');

  } catch (error) {
    console.error('\n❌ Circle SDK error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify CIRCLE_API_KEY is valid');
    console.log('2. Verify CIRCLE_ENTITY_SECRET is registered');
    console.log('3. Check Circle Console: https://console.circle.com\n');
    process.exit(1);
  }
}

verifySetup();
