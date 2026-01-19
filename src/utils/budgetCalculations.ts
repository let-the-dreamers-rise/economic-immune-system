/**
 * Budget calculation utilities for the Agentic Finance Dashboard
 * These functions handle budget utilization, warning levels, and spend calculations
 */

import type { Transaction, WarningLevel } from '../types/dashboard';

/**
 * Calculate budget utilization percentage
 * @param spend - Current spend amount
 * @param limit - Budget limit
 * @returns Utilization percentage clamped to 0-100
 */
export function calculateUtilization(spend: number, limit: number): number {
  if (limit <= 0) return 0;
  const utilization = (spend / limit) * 100;
  return Math.max(0, Math.min(100, utilization));
}

/**
 * Get warning level based on budget utilization percentage
 * @param utilization - Utilization percentage (0-100)
 * @returns Warning level: 'critical' >= 90%, 'warning' >= 75%, 'normal' < 75%
 */
export function getWarningLevel(utilization: number): WarningLevel {
  if (utilization >= 90) return 'critical';
  if (utilization >= 75) return 'warning';
  return 'normal';
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if the date is today
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
 * Calculate today's total spend from completed transactions
 * @param transactions - Array of transactions
 * @returns Sum of amounts for completed transactions from today
 */
export function calculateTodaySpend(transactions: Transaction[]): number {
  return transactions
    .filter(tx => tx.status === 'completed' && isToday(new Date(tx.timestamp)))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculate total spend for a given time period
 * @param transactions - Array of transactions
 * @param startDate - Start of the period
 * @param endDate - End of the period (defaults to now)
 * @returns Sum of amounts for completed transactions in the period
 */
export function calculatePeriodSpend(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date = new Date()
): number {
  return transactions
    .filter(tx => {
      const txDate = new Date(tx.timestamp);
      return tx.status === 'completed' && txDate >= startDate && txDate <= endDate;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculate weekly spend (last 7 days)
 * @param transactions - Array of transactions
 * @returns Sum of amounts for completed transactions in the last 7 days
 */
export function calculateWeeklySpend(transactions: Transaction[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return calculatePeriodSpend(transactions, weekAgo);
}

/**
 * Calculate monthly spend (last 30 days)
 * @param transactions - Array of transactions
 * @returns Sum of amounts for completed transactions in the last 30 days
 */
export function calculateMonthlySpend(transactions: Transaction[]): number {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  return calculatePeriodSpend(transactions, monthAgo);
}

/**
 * Calculate top spending categories
 * @param transactions - Array of transactions
 * @param topN - Number of top categories to return (default 3)
 * @returns Array of categories with amounts and percentages, sorted by amount descending
 */
export function calculateTopCategories(
  transactions: Transaction[],
  topN: number = 3
): Array<{ name: string; amount: number; percentage: number }> {
  const completedTx = transactions.filter(tx => tx.status === 'completed');
  const totalSpend = completedTx.reduce((sum, tx) => sum + tx.amount, 0);
  
  if (totalSpend === 0) return [];

  // Group by category
  const categoryMap = new Map<string, number>();
  for (const tx of completedTx) {
    const category = tx.category || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount);
  }

  // Convert to array and sort by amount descending
  const categories = Array.from(categoryMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / totalSpend) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  return categories.slice(0, topN);
}
