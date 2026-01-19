/**
 * Balance Service for the Agentic Finance Dashboard
 * Handles wallet balance retrieval and budget calculations
 */

import { dataStore } from '../dataStore';
import {
  calculateTodaySpend,
  calculateWeeklySpend,
  calculateMonthlySpend,
} from '../../utils/budgetCalculations';
import type { BalanceResponse } from '../../types/dashboard';

// Simulated wallet balance (in production, this would come from Circle SDK)
let simulatedBalance = 5000;

/**
 * Get the current wallet balance from Circle SDK
 * In production, this calls the Circle API
 * For demo/testing, it uses simulated balance
 */
export async function getWalletBalance(): Promise<number> {
  // Check if we should use the real Circle SDK
  const useRealCircle = process.env.CIRCLE_API_KEY && process.env.USE_CIRCLE === 'true';
  
  if (useRealCircle) {
    try {
      // Dynamic import to avoid issues when Circle SDK is not configured
      const { getBalance } = await import('../../services/walletService.js') as any;
      const balanceInfo = await getBalance();
      return parseFloat(balanceInfo.balance);
    } catch (error) {
      console.error('Circle SDK error, falling back to simulation:', error);
      // Fall through to simulation
    }
  }
  
  return simulatedBalance;
}

/**
 * Set the simulated balance (for testing/demo purposes)
 */
export function setSimulatedBalance(balance: number): void {
  simulatedBalance = balance;
}

/**
 * Deduct from simulated balance (for testing/demo purposes)
 */
export function deductFromBalance(amount: number): void {
  simulatedBalance = Math.max(0, simulatedBalance - amount);
}

/**
 * Calculate predicted spend based on pending proposals and historical patterns
 */
export function calculatePredictedSpend(): number {
  const transactions = dataStore.getAllTransactions();
  const pendingTransactions = transactions.filter(
    tx => tx.status === 'pending' || tx.status === 'confirming'
  );
  
  // Sum of pending transaction amounts
  const pendingAmount = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Add a small buffer based on historical average (simplified)
  const completedToday = transactions.filter(
    tx => tx.status === 'completed' && isToday(new Date(tx.timestamp))
  );
  const avgTransactionSize = completedToday.length > 0
    ? completedToday.reduce((sum, tx) => sum + tx.amount, 0) / completedToday.length
    : 0;
  
  // Predict 2 more transactions at average size
  return pendingAmount + (avgTransactionSize * 2);
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Get the full balance response with all budget information
 */
export async function getBalanceResponse(): Promise<BalanceResponse> {
  const balance = await getWalletBalance();
  const transactions = dataStore.getAllTransactions();
  const budgetConfig = dataStore.getBudgetConfig();
  
  const todaySpend = calculateTodaySpend(transactions);
  const weeklySpend = calculateWeeklySpend(transactions);
  const monthlySpend = calculateMonthlySpend(transactions);
  const predictedSpend = calculatePredictedSpend();
  
  return {
    balance,
    currency: 'USDC',
    blockchain: 'ARC-TESTNET',
    weeklyBudget: budgetConfig.weeklyLimit,
    weeklySpend,
    monthlyBudget: budgetConfig.monthlyLimit,
    monthlySpend,
    todaySpend,
    predictedSpend,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Check if there's sufficient balance for a transaction
 */
export async function hasSufficientBalance(amount: number): Promise<boolean> {
  const balance = await getWalletBalance();
  const budgetConfig = dataStore.getBudgetConfig();
  
  // Must have enough balance and maintain reserve minimum
  return balance - amount >= budgetConfig.reserveMinimum;
}
