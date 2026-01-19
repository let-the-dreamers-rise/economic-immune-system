/**
 * Evaluate Service for the Agentic Finance Dashboard
 * Handles proposal evaluation using the Gemini Economic Reasoning Engine
 */

import { dataStore } from '../dataStore';
import { getBalanceResponse } from './balanceService';
import { getEconomicDecision } from '../../services/geminiService';
import { immuneMemoryService } from './immuneMemoryService';
import type { ImmuneDecisionResponse, EvaluateRequest, EvaluateResponse, EconomicDecision, Transaction } from '../../types/dashboard';

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Build immune memory context for Gemini evaluation
 */
function buildImmuneContext(recipient: string, amount: number, purpose?: string) {
  // Get recipient transaction history
  const transactions = dataStore.getTransactions();
  const recipientTransactions = transactions.filter(tx => tx.recipient === recipient);
  
  // Build recipient profile
  const recipientHistory = recipientTransactions.length > 0 ? {
    totalTransactions: recipientTransactions.length,
    totalAmount: recipientTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    averageAmount: recipientTransactions.reduce((sum, tx) => sum + tx.amount, 0) / recipientTransactions.length,
    lastTransaction: recipientTransactions[recipientTransactions.length - 1]?.timestamp,
    purposes: [...new Set(recipientTransactions.map(tx => tx.purpose).filter(Boolean))]
  } : null;
  
  // Detect potential patterns
  const detectedPatterns: string[] = [];
  const memoryReferences: string[] = [];
  
  // Check for recurring micro-costs (< $50 USDC, frequent)
  if (amount < 50 && recipientTransactions.length >= 3) {
    const recentTransactions = recipientTransactions.filter(tx => 
      new Date(tx.timestamp).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    if (recentTransactions.length >= 3) {
      detectedPatterns.push('recurring_micro_costs');
      memoryReferences.push(`${recentTransactions.length} similar transactions to ${recipient} in last 30 days`);
    }
  }
  
  // Check for vendor concentration (>30% of total spending)
  const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const recipientSpending = recipientTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  if (totalSpending > 0 && (recipientSpending / totalSpending) > 0.3) {
    detectedPatterns.push('vendor_concentration');
    memoryReferences.push(`${recipient} represents ${Math.round((recipientSpending / totalSpending) * 100)}% of total spending`);
  }
  
  // Check for convenience bias (amounts ending in round numbers, suggesting premium pricing)
  if (amount % 10 === 0 && amount > 100) {
    const roundAmountTransactions = transactions.filter(tx => tx.amount % 10 === 0 && tx.amount > 100);
    if (roundAmountTransactions.length > transactions.length * 0.6) {
      detectedPatterns.push('convenience_bias');
      memoryReferences.push(`${Math.round((roundAmountTransactions.length / transactions.length) * 100)}% of transactions use round amounts`);
    }
  }
  
  return {
    recipientHistory,
    detectedPatterns,
    memoryReferences
  };
}

/**
 * Fallback simulation engine when Gemini is unavailable
 */
async function callSimulatedEngine(
  action: string,
  amount: number,
  walletContext: { balance: number; weeklyBudget: number; weeklySpend: number }
): Promise<EconomicDecision> {
  
  // FALLBACK SIMULATION - Used when Gemini API is unavailable
  console.log('Using simulated AI decision engine as fallback');
  
  // Simulated decision logic for demo/testing
  const utilizationRatio = walletContext.weeklySpend / walletContext.weeklyBudget;
  const balanceRatio = amount / walletContext.balance;
  
  let recommendation: 'approve' | 'modify' | 'reject';
  let value_score: number;
  let budget_impact: 'low' | 'medium' | 'high';
  let explanation: string;
  let learning_note: string | undefined;
  
  if (amount > walletContext.balance) {
    recommendation = 'reject';
    value_score = 0.1;
    budget_impact = 'high';
    explanation = `Insufficient balance. Requested ${amount} USDC but only ${walletContext.balance} USDC available.`;
    learning_note = 'Always check balance before proposing large transactions.';
  } else if (utilizationRatio > 0.9) {
    recommendation = 'reject';
    value_score = 0.2;
    budget_impact = 'high';
    explanation = `Weekly budget nearly exhausted (${Math.round(utilizationRatio * 100)}% used). This transaction would exceed safe limits.`;
    learning_note = 'Consider spreading transactions across the week to avoid budget pressure.';
  } else if (utilizationRatio > 0.75 || balanceRatio > 0.3) {
    recommendation = 'modify';
    value_score = 0.5;
    budget_impact = 'medium';
    const suggestedAmount = Math.min(amount * 0.7, walletContext.balance * 0.2);
    explanation = `Transaction approved with modifications. Consider reducing amount to ${suggestedAmount.toFixed(2)} USDC to maintain budget health.`;
    learning_note = 'Large transactions during high utilization periods should be split or reduced.';
  } else {
    recommendation = 'approve';
    value_score = 0.8 + (Math.random() * 0.2);
    budget_impact = balanceRatio < 0.1 ? 'low' : 'medium';
    explanation = `Transaction approved. Budget utilization is healthy at ${Math.round(utilizationRatio * 100)}% and this transaction represents ${Math.round(balanceRatio * 100)}% of available balance.`;
  }
  
  return {
    value_score: Math.round(value_score * 100) / 100,
    budget_impact,
    recommendation,
    explanation,
    suggested_constraints: {
      max_amount: recommendation === 'modify' ? Math.round(amount * 0.7) : undefined,
      frequency_limit: utilizationRatio > 0.5 ? '2 per day' : undefined,
      notes: recommendation !== 'approve' ? 'Consider reviewing budget allocation' : undefined,
    },
    learning_note,
  };
}

/**
 * Evaluate a payment proposal using the Enhanced Gemini Economic Immune System
 */
export async function evaluateProposal(request: EvaluateRequest): Promise<EvaluateResponse> {
  const requestId = generateRequestId();
  
  // Get current wallet context
  const balanceResponse = await getBalanceResponse();
  const walletContext = {
    balance: balanceResponse.balance,
    weeklyBudget: balanceResponse.weeklyBudget,
    weeklySpend: balanceResponse.weeklySpend,
  };
  
  // Build action description
  const action = request.purpose 
    ? `Payment to ${request.recipient} for: ${request.purpose}`
    : `Payment to ${request.recipient}`;
  
  // Build immune memory context
  const immuneContext = buildImmuneContext(request.recipient, request.amount, request.purpose);
  
  try {
    // Call the enhanced Gemini Economic Immune System
    const decision = await getEconomicDecision(
      action, 
      request.amount, 
      walletContext,
      request.recipient,
      immuneContext
    );
    
    // Store the decision
    dataStore.saveDecision(requestId, decision);
    
    // Create a mock transaction for immune memory update
    const mockTransaction: Transaction = {
      id: `tx-${requestId}`,
      requestId,
      timestamp: new Date(),
      recipient: request.recipient,
      amount: request.amount,
      purpose: request.purpose,
      decision,
      status: 'pending'
    };
    
    // Update immune memory with the decision
    await immuneMemoryService.updateMemoryFromTransaction(mockTransaction, decision);
    
    return {
      requestId,
      decision,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini evaluation failed, using fallback:', error);
    
    // Fallback to simulation if Gemini fails
    const fallbackDecision = await callSimulatedEngine(action, request.amount, walletContext);
    
    // Convert to ImmuneDecisionResponse format
    const immuneDecision: ImmuneDecisionResponse = {
      ...fallbackDecision,
      threat_level: 'LOW',
      patterns_detected: immuneContext.detectedPatterns,
      confidence_in_decision: 0.5, // Lower confidence for fallback
      recommended_future_behavior: 'Monitor for Gemini API availability',
      immune_memory_references: immuneContext.memoryReferences,
      resilience_impact: 0
    };
    
    dataStore.saveDecision(requestId, immuneDecision);
    
    return {
      requestId,
      decision: immuneDecision,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get a previously made decision
 */
export function getDecision(requestId: string): EconomicDecision | undefined {
  return dataStore.getDecision(requestId);
}

/**
 * Validate a proposal before evaluation
 */
export function validateProposal(request: EvaluateRequest): { valid: boolean; error?: string } {
  if (!request.recipient || request.recipient.trim() === '') {
    return { valid: false, error: 'Recipient address is required' };
  }
  
  if (!request.recipient.startsWith('0x') || request.recipient.length !== 42) {
    return { valid: false, error: 'Invalid recipient address format' };
  }
  
  if (typeof request.amount !== 'number' || request.amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }
  
  if (request.amount > 1000000) {
    return { valid: false, error: 'Amount exceeds maximum allowed (1,000,000 USDC)' };
  }
  
  return { valid: true };
}
