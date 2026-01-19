import { generateEntitySecret, generateEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate Entity Secret Ciphertext for manual registration in Circle Console
 */
async function generateCiphertext() {
  console.log('🔐 Generate Entity Secret Ciphertext for Circle Console\n');

  // Step 1: Generate or use existing entity secret
  let entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!entitySecret || entitySecret.includes('your_')) {
    console.log('Step 1: Generating new Entity Secret...');
    console.log('⚠️  IMPORTANT: Copy the secret printed below\n');
    
    generateEntitySecret();
    
    console.log('\n📋 Copy the secret above and paste it when prompted.\n');
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    entitySecret = await new Promise((resolve) => {
      rl.question('Paste the Entity Secret here: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  } else {
    console.log('Using Entity Secret from .env file\n');
  }

  if (!entitySecret || entitySecret.length !== 64) {
    throw new Error('Invalid Entity Secret. Must be 64 hex characters (32 bytes).');
  }

  // Step 2: Get API key
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY not found in .env file');
  }

  // Step 3: Generate ciphertext
  console.log('Step 2: Generating Entity Secret Ciphertext...\n');

  try {
    const ciphertext = await generateEntitySecretCiphertext({
      apiKey,
      entitySecret,
    });

    console.log('✅ Entity Secret Ciphertext generated!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('COPY THIS CIPHERTEXT (684 characters):');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(ciphertext);
    console.log('\n═══════════════════════════════════════════════════════════\n');

    console.log('📝 Next steps:\n');
    console.log('1. Copy the ciphertext above (all 684 characters)');
    console.log('2. Go to Circle Console → Home/Configurator → Entity Secret');
    console.log('3. Paste the ciphertext into "Entity Secret Ciphertext" field');
    console.log('4. Click "Register"');
    console.log('5. Add to .env: CIRCLE_ENTITY_SECRET=' + entitySecret);
    console.log('6. Run: npm run circle:verify\n');

    console.log('⚠️  IMPORTANT: Store the Entity Secret securely!');
    console.log('   Entity Secret: ' + entitySecret + '\n');

  } catch (error) {
    console.error('❌ Failed to generate ciphertext:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify CIRCLE_API_KEY is valid');
    console.log('2. Check Circle Console for API key permissions');
    console.log('3. Ensure Developer-Controlled Wallets is enabled\n');
    process.exit(1);
  }
}

generateCiphertext();
