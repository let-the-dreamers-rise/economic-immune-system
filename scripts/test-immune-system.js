/**
 * Test script for the Economic Immune System integration
 * Tests the enhanced Gemini reasoning with immune context
 */

import dotenv from 'dotenv';
import { getEconomicDecision } from '../services/geminiService.ts';

// Load environment variables
dotenv.config();

async function testImmuneSystem() {
  console.log('🧬 Testing Economic Immune System...\n');

  // Test scenario 1: First-time recipient (should be LOW threat)
  console.log('Test 1: First-time recipient');
  try {
    const decision1 = await getEconomicDecision(
      'Payment for coffee subscription',
      25,
      { balance: 1000, weeklyBudget: 500, weeklySpend: 100 },
      '0x1234567890123456789012345678901234567890',
      {
        recipientHistory: null,
        detectedPatterns: [],
        memoryReferences: []
      }
    );
    console.log('✅ Decision:', decision1.recommendation);
    console.log('🔍 Threat Level:', decision1.threat_level);
    console.log('📊 Confidence:', decision1.confidence_in_decision);
    console.log('🧠 Patterns:', decision1.patterns_detected);
    console.log('💡 Future Behavior:', decision1.recommended_future_behavior);
    console.log('📈 Resilience Impact:', decision1.resilience_impact);
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test scenario 2: Recurring micro-costs pattern
  console.log('Test 2: Recurring micro-costs pattern detected');
  try {
    const decision2 = await getEconomicDecision(
      'Payment for daily coffee',
      15,
      { balance: 1000, weeklyBudget: 500, weeklySpend: 200 },
      '0xCoffeeShop123456789012345678901234567890',
      {
        recipientHistory: {
          totalTransactions: 8,
          totalAmount: 120,
          averageAmount: 15,
          lastTransaction: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          purposes: ['daily coffee', 'morning coffee', 'coffee']
        },
        detectedPatterns: ['recurring_micro_costs'],
        memoryReferences: ['8 similar transactions to coffee shop in last 30 days']
      }
    );
    console.log('✅ Decision:', decision2.recommendation);
    console.log('🔍 Threat Level:', decision2.threat_level);
    console.log('📊 Confidence:', decision2.confidence_in_decision);
    console.log('🧠 Patterns:', decision2.patterns_detected);
    console.log('💡 Future Behavior:', decision2.recommended_future_behavior);
    console.log('📈 Resilience Impact:', decision2.resilience_impact);
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test scenario 3: Vendor concentration risk
  console.log('Test 3: Vendor concentration risk');
  try {
    const decision3 = await getEconomicDecision(
      'Payment for premium service upgrade',
      500,
      { balance: 2000, weeklyBudget: 800, weeklySpend: 300 },
      '0xMajorVendor123456789012345678901234567890',
      {
        recipientHistory: {
          totalTransactions: 15,
          totalAmount: 2500,
          averageAmount: 166.67,
          lastTransaction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          purposes: ['monthly subscription', 'service upgrade', 'premium features']
        },
        detectedPatterns: ['vendor_concentration'],
        memoryReferences: ['Major vendor represents 65% of total spending']
      }
    );
    console.log('✅ Decision:', decision3.recommendation);
    console.log('🔍 Threat Level:', decision3.threat_level);
    console.log('📊 Confidence:', decision3.confidence_in_decision);
    console.log('🧠 Patterns:', decision3.patterns_detected);
    console.log('💡 Future Behavior:', decision3.recommended_future_behavior);
    console.log('📈 Resilience Impact:', decision3.resilience_impact);
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
  }

  console.log('\n🧬 Economic Immune System test completed!');
}

// Run the test
testImmuneSystem().catch(console.error);