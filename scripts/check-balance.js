import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Check wallet balances
 */
async function checkBalance() {
  console.log('💰 Checking Circle Wallet Balances\n');

  try {
    // Initialize Circle SDK
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    // Check primary wallet balance
    console.log('Primary Wallet:');
    console.log(`Address: ${process.env.AGENT_WALLET_ADDRESS}`);
    
    const primaryBalance = await client.getWalletTokenBalance({
      id: process.env.AGENT_WALLET_ID,
    });

    console.log('Balances:');
    if (primaryBalance.data?.tokenBalances?.length > 0) {
      primaryBalance.data.tokenBalances.forEach(balance => {
        console.log(`  ${balance.token.symbol}: ${balance.amount}`);
      });
    } else {
      console.log('  No tokens found (wallet may be empty)');
    }

    console.log('\n─────────────────────────────────────────\n');

    // Check secondary wallet balance
    console.log('Secondary Wallet:');
    console.log(`Address: ${process.env.SECONDARY_WALLET_ADDRESS}`);
    
    const secondaryBalance = await client.getWalletTokenBalance({
      id: process.env.SECONDARY_WALLET_ID,
    });

    console.log('Balances:');
    if (secondaryBalance.data?.tokenBalances?.length > 0) {
      secondaryBalance.data.tokenBalances.forEach(balance => {
        console.log(`  ${balance.token.symbol}: ${balance.amount}`);
      });
    } else {
      console.log('  No tokens found (wallet may be empty)');
    }

    console.log('\n📝 Next steps if balances are 0:');
    console.log('1. Visit: https://faucet.circle.com');
    console.log('2. Select "Polygon Amoy" network');
    console.log('3. Paste wallet address and request USDC');
    console.log('4. Wait 1-2 minutes and run this script again\n');

  } catch (error) {
    console.error('\n❌ Failed to check balance:', error.message);
    process.exit(1);
  }
}

checkBalance();