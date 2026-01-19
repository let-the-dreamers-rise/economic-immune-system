import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Circle API Key format and basic connectivity
 */
async function testApiKey() {
  console.log('🔍 Testing Circle API Key\n');

  const apiKey = process.env.CIRCLE_API_KEY;

  if (!apiKey) {
    console.error('❌ CIRCLE_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('API Key format check:');
  console.log('─────────────────────────────────────────');
  console.log(`Length: ${apiKey.length} characters`);
  console.log(`Prefix: ${apiKey.substring(0, 20)}...`);
  console.log(`Format: ${apiKey.includes(':') ? '✅ Contains colons' : '❌ Missing colons'}`);
  
  const parts = apiKey.split(':');
  console.log(`Parts: ${parts.length} (should be 3)`);
  
  if (parts.length === 3) {
    console.log(`  - Type: ${parts[0]}`);
    console.log(`  - ID: ${parts[1].substring(0, 8)}...`);
    console.log(`  - Secret: ${parts[2].substring(0, 8)}...`);
  }

  console.log('\n🔌 Testing API connectivity...\n');

  try {
    // Test with fetch to see the actual error
    const response = await fetch('https://api.circle.com/v1/w3s/config/entity/publicKey', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.status === 401) {
      const errorBody = await response.text();
      console.error('❌ 401 Unauthorized');
      console.error('Error details:', errorBody);
      console.log('\n🔧 Possible issues:');
      console.log('1. API key is for wrong product (check Circle Console)');
      console.log('2. API key permissions not set correctly');
      console.log('3. Developer-Controlled Wallets not enabled on account');
      console.log('4. API key was revoked or expired');
      console.log('\n📝 Action required:');
      console.log('Go to Circle Console → API Keys');
      console.log('Verify the key is for "Circle Wallets" product');
      console.log('Check that "Developer-Controlled Wallets" is enabled');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log('Public key retrieved:', data.data?.publicKey?.substring(0, 50) + '...');
    } else {
      console.error(`❌ Unexpected status: ${response.status}`);
      const errorBody = await response.text();
      console.error('Error:', errorBody);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testApiKey();
