import { 
  generateEntitySecret, 
  registerEntitySecretCiphertext 
} from '@circle-fin/developer-controlled-wallets';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Production-grade Entity Secret registration for Circle Developer-Controlled Wallets
 * Run once during initial setup
 */
async function registerEntitySecret() {
  console.log('🔐 Circle Entity Secret Registration\n');

  // Step 1: Generate a new 32-byte entity secret
  console.log('Step 1: Generating new Entity Secret...');
  console.log('⚠️  IMPORTANT: Copy the secret printed below to your .env file\n');
  
  // This prints the secret to console and does NOT return it
  generateEntitySecret();
  
  console.log('\n📋 Copy the secret above and paste it when prompted.\n');
  
  // Prompt for the secret (in production, read from secure input)
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const entitySecret = await new Promise((resolve) => {
    rl.question('Paste the Entity Secret here: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!entitySecret || entitySecret.length !== 64) {
    throw new Error('Invalid Entity Secret. Must be 64 hex characters (32 bytes).');
  }

  // Step 2: Get API key from environment
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY not found in .env file');
  }

  // Step 3: Register the Entity Secret with Circle
  console.log('\nStep 2: Registering Entity Secret with Circle...');
  
  // The SDK expects a directory path, not a file path
  const recoveryDir = process.cwd();
  
  const response = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: recoveryDir,
  });

  // Step 4: Check recovery file
  const recoveryFilePath = path.join(recoveryDir, 'circle-recovery.dat');
  if (response.data?.recoveryFile) {
    console.log(`✅ Recovery file saved: ${recoveryFilePath}`);
  } else if (fs.existsSync(recoveryFilePath)) {
    console.log(`✅ Recovery file saved: ${recoveryFilePath}`);
  }

  console.log('\n✅ Entity Secret registered successfully!\n');
  console.log('📝 Next steps:');
  console.log('1. Add to .env: CIRCLE_ENTITY_SECRET=' + entitySecret);
  console.log('2. Store recovery file securely (backup to password manager)');
  console.log('3. Add circle-recovery.dat to .gitignore');
  console.log('4. NEVER commit the Entity Secret to version control\n');
}

// Run registration
registerEntitySecret().catch((error) => {
  console.error('❌ Registration failed:', error.message);
  process.exit(1);
});
