/**
 * Transaction Service for the Agentic Finance Dashboard
 * Handles transaction history retrieval and pagination
 */

import { dataStore } from '../dataStore';
import { sortTimelineEntries, paginateEntries } from '../../utils/timelineUtils';
import type { TransactionsResponse, TimelineEntry } from '../../types/dashboard';

/**
 * Get paginated transaction history
 */
export function getTransactions(page: number = 1, limit: number = 20): TransactionsResponse {
  // Get all timeline entries
  const entries = dataStore.getTimelineEntries();
  
  // Sort by timestamp (newest first)
  const sortedEntries = sortTimelineEntries(entries);
  
  // Paginate
  const paginated = paginateEntries(sortedEntries, page, limit);
  
  return {
    transactions: paginated.entries,
    total: paginated.total,
    page: paginated.page,
    totalPages: paginated.totalPages,
  };
}

/**
 * Get a single transaction by ID
 */
export function getTransactionById(id: string): TimelineEntry | undefined {
  const transaction = dataStore.getTransaction(id);
  if (!transaction) return undefined;
  
  return dataStore.transactionToTimelineEntry(transaction);
}

/**
 * Get transactions by status
 */
export function getTransactionsByStatus(
  status: 'pending' | 'confirming' | 'completed' | 'failed'
): TimelineEntry[] {
  const transactions = dataStore.getAllTransactions();
  const filtered = transactions.filter(tx => tx.status === status);
  const entries = filtered.map(tx => dataStore.transactionToTimelineEntry(tx));
  return sortTimelineEntries(entries);
}

/**
 * Get recent transactions (last N)
 */
export function getRecentTransactions(count: number = 10): TimelineEntry[] {
  const entries = dataStore.getTimelineEntries();
  const sorted = sortTimelineEntries(entries);
  return sorted.slice(0, count);
}

/**
 * Get transactions for a specific date range
 */
export function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date
): TimelineEntry[] {
  const entries = dataStore.getTimelineEntries();
  const filtered = entries.filter(entry => {
    const timestamp = new Date(entry.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });
  return sortTimelineEntries(filtered);
}

/**
 * Get transaction statistics
 */
export function getTransactionStats(): {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalVolume: number;
  averageAmount: number;
} {
  const transactions = dataStore.getAllTransactions();
  const completed = transactions.filter(tx => tx.status === 'completed');
  const pending = transactions.filter(tx => tx.status === 'pending' || tx.status === 'confirming');
  const failed = transactions.filter(tx => tx.status === 'failed');
  
  const totalVolume = completed.reduce((sum, tx) => sum + tx.amount, 0);
  const averageAmount = completed.length > 0 ? totalVolume / completed.length : 0;
  
  return {
    total: transactions.length,
    completed: completed.length,
    pending: pending.length,
    failed: failed.length,
    totalVolume,
    averageAmount,
  };
}
