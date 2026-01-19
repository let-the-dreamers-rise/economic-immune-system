import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
    
    const models = await ai.models.list();
    
    console.log('Available models:');
    console.log('─────────────────────────────────────────────────────');
    models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedGenerationMethods) {
        console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
      }
    });
    console.log('─────────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
  }
}

listModels();