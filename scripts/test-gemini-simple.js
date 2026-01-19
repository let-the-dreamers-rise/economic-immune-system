import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiSimple() {
  console.log('🤖 Testing Gemini Integration (Simple)\n');

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found in environment variables');
    return;
  }

  console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Try the simplest possible request
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with just "Hi"'
    });

    console.log('✅ Gemini API working!');
    console.log('Response:', response.text);

  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\nTroubleshooting:');
      console.log('1. Go to https://aistudio.google.com/apikey');
      console.log('2. Create a NEW API key');
      console.log('3. Make sure "Generative Language API" is enabled');
      console.log('4. Check API key restrictions (IP, referrer)');
      console.log('5. Try a different Google account');
    }
  }
}

testGeminiSimple();