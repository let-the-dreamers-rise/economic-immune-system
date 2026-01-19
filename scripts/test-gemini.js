import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Gemini AI integration using the same pattern as your existing service
 */
async function testGemini() {
  console.log('🤖 Testing Gemini AI Integration\n');

  // Validate environment variables
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    throw new Error('GEMINI_API_KEY or API_KEY not found in .env file');
  }

  try {
    // Initialize Gemini AI (using same pattern as your service)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });

    console.log('🔌 Testing Gemini AI connection...');

    // Test prompt for economic reasoning (matching your service pattern)
    const testPrompt = `
    ACTION PROPOSAL:
    Target: Coffee and pastry at local cafe
    Requested Amount: 25 USDC
    
    AGENT WALLET CONTEXT:
    Current Balance: 500 USDC
    Weekly Budget Limit: 200 USDC
    Current Weekly Spend: 45 USDC
    
    EVALUATE AND ADVISE.
    `;

    const systemInstruction = `You are an Economic Reasoning Engine for an autonomous AI agent that spends real USDC on-chain.
Your role is NOT to execute payments.
Your role is to evaluate economic decisions and advise whether a payment should happen.
You must think like a cautious CFO combined with a systems engineer.

CONTEXT
The agent operates with a programmable wallet and can spend USDC on Arc.
Every payment has real cost and long-term budget impact.
Poor decisions must be avoided and learned from.

RULES:
- Be conservative with money.
- Prefer long-term sustainability over short-term convenience.
- If uncertain, lean toward modify or reject.
- Never assume unlimited budget.
- Never hallucinate prices or balances.
- Return output as valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: testPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value_score: { 
              type: Type.NUMBER, 
              description: "A score from 0.0 to 1.0 representing the expected utility." 
            },
            budget_impact: { 
              type: Type.STRING, 
              enum: ["LOW", "MEDIUM", "HIGH"],
              description: "The degree of strain this payment puts on the budget." 
            },
            recommendation: { 
              type: Type.STRING, 
              enum: ["APPROVE", "MODIFY", "REJECT"],
              description: "The final recommendation." 
            },
            explanation: { 
              type: Type.STRING, 
              description: "Plain-language explanation of the reasoning." 
            },
            suggested_constraints: {
              type: Type.OBJECT,
              properties: {
                max_amount: { type: Type.NUMBER },
                frequency_limit: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              description: "Constraints to apply if recommendation is MODIFY or general advice."
            },
            learning_note: { 
              type: Type.STRING, 
              description: "A note for the agent's memory to improve future decisions." 
            }
          },
          required: ["value_score", "budget_impact", "recommendation", "explanation", "suggested_constraints"]
        }
      }
    });

    const aiDecision = JSON.parse(response.text);

    console.log('✅ Gemini AI connected successfully!\n');
    console.log('🧠 AI Economic Decision:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Decision: ${aiDecision.recommendation}`);
    console.log(`Value Score: ${aiDecision.value_score}`);
    console.log(`Budget Impact: ${aiDecision.budget_impact}`);
    console.log(`Reasoning: ${aiDecision.explanation}`);
    if (aiDecision.suggested_constraints) {
      console.log(`Suggested Max Amount: $${aiDecision.suggested_constraints.max_amount || 'N/A'}`);
      console.log(`Frequency Limit: ${aiDecision.suggested_constraints.frequency_limit || 'N/A'}`);
    }
    console.log(`Learning Note: ${aiDecision.learning_note || 'N/A'}`);
    console.log('─────────────────────────────────────────────────────\n');

    console.log('✅ JSON parsing successful!');
    console.log('✅ Economic reasoning engine is working perfectly!');

    console.log('\n🎯 Gemini AI is ready for your agentic finance dashboard!');
    console.log('\nNext steps:');
    console.log('1. Start your application: npm run dev:all');
    console.log('2. Test payment evaluation through the dashboard');
    console.log('3. Monitor AI decision-making in real-time\n');

  } catch (error) {
    console.error('\n❌ Gemini AI test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\nTroubleshooting:');
      console.log('1. Verify your API key at: https://aistudio.google.com/apikey');
      console.log('2. Make sure the key has proper permissions');
      console.log('3. Check if you have API quota remaining');
    } else if (error.message.includes('quota')) {
      console.log('\nAPI Quota Issue:');
      console.log('1. Check your Gemini API usage limits');
      console.log('2. Wait for quota reset or upgrade your plan');
    } else {
      console.log('\nGeneral troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Gemini API service status');
      console.log('3. Try again in a few moments');
    }
    console.log('');
    process.exit(1);
  }
}

testGemini();