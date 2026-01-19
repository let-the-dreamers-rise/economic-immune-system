/**
 * In-memory data store for the Agentic Finance Dashboard
 * Provides persistence layer for transactions, decisions, and budget configuration
 */

import type {
  Transaction,
  EconomicDecision,
  ImmuneDecisionResponse,
  BudgetConfig,
  SpendingInsight,
  TimelineEntry,
} from '../types/dashboard';

// Default budget configuration
const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  weeklyLimit: 1000,
  monthlyLimit: 4000,
  reserveMinimum: 100,
  warningThreshold: 0.75,
  criticalThreshold: 0.90,
};

/**
 * In-memory data store class
 * Can be replaced with SQLite/PostgreSQL for production
 */
class DataStore {
  private transactions: Map<string, Transaction> = new Map();
  private decisions: Map<string, ImmuneDecisionResponse> = new Map();
  private budgetConfig: BudgetConfig = { ...DEFAULT_BUDGET_CONFIG };
  private insights: SpendingInsight[] = [];
  private pendingProposals: Set<string> = new Set(); // For duplicate prevention

  // Transaction methods
  saveTransaction(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, { ...transaction });
    return transaction;
  }

  getTransaction(id: string): Transaction | undefined {
    const tx = this.transactions.get(id);
    return tx ? { ...tx } : undefined;
  }

  getTransactionByRequestId(requestId: string): Transaction | undefined {
    for (const tx of this.transactions.values()) {
      if (tx.requestId === requestId) {
        return { ...tx };
      }
    }
    return undefined;
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).map(tx => ({ ...tx }));
  }

  getTransactions(): Transaction[] {
    return this.getAllTransactions();
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.transactions.set(id, updated);
    return { ...updated };
  }

  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  // Decision methods
  saveDecision(requestId: string, decision: ImmuneDecisionResponse): ImmuneDecisionResponse {
    this.decisions.set(requestId, { ...decision });
    return decision;
  }

  getDecision(requestId: string): ImmuneDecisionResponse | undefined {
    const decision = this.decisions.get(requestId);
    return decision ? { ...decision } : undefined;
  }

  getAllDecisions(): Map<string, ImmuneDecisionResponse> {
    return new Map(this.decisions);
  }

  // Budget configuration methods
  getBudgetConfig(): BudgetConfig {
    return { ...this.budgetConfig };
  }

  updateBudgetConfig(updates: Partial<BudgetConfig>): BudgetConfig {
    this.budgetConfig = { ...this.budgetConfig, ...updates };
    return { ...this.budgetConfig };
  }

  // Insights methods
  setInsights(insights: SpendingInsight[]): void {
    this.insights = insights.map(i => ({ ...i }));
  }

  getInsights(): SpendingInsight[] {
    return this.insights.map(i => ({ ...i }));
  }

  // Duplicate prevention methods
  isProposalPending(proposalKey: string): boolean {
    return this.pendingProposals.has(proposalKey);
  }

  markProposalPending(proposalKey: string): void {
    this.pendingProposals.add(proposalKey);
  }

  clearProposalPending(proposalKey: string): void {
    this.pendingProposals.delete(proposalKey);
  }

  /**
   * Generate a unique key for a proposal to detect duplicates
   */
  generateProposalKey(recipient: string, amount: number): string {
    return `${recipient.toLowerCase()}-${amount}`;
  }

  // Timeline entry conversion
  transactionToTimelineEntry(transaction: Transaction): TimelineEntry {
    return {
      id: transaction.id,
      timestamp: transaction.timestamp,
      type: transaction.status === 'completed' ? 'completion' : 
            transaction.status === 'failed' ? 'completion' :
            transaction.txHash ? 'execution' : 'decision',
      request: {
        recipient: transaction.recipient,
        amount: transaction.amount,
        purpose: transaction.purpose,
      },
      decision: transaction.decision,
      execution: transaction.txHash ? {
        transactionId: transaction.id,
        status: transaction.status,
        txHash: transaction.txHash,
        explorerUrl: transaction.explorerUrl,
      } : undefined,
    };
  }

  // Get all transactions as timeline entries
  getTimelineEntries(): TimelineEntry[] {
    return this.getAllTransactions().map(tx => this.transactionToTimelineEntry(tx));
  }

  // Clear all data (useful for testing)
  clear(): void {
    this.transactions.clear();
    this.decisions.clear();
    this.budgetConfig = { ...DEFAULT_BUDGET_CONFIG };
    this.insights = [];
    this.pendingProposals.clear();
  }

  // Get statistics
  getStats(): {
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalDecisions: number;
  } {
    const transactions = this.getAllTransactions();
    return {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending' || tx.status === 'confirming').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      totalDecisions: this.decisions.size,
    };
  }
}

// Export singleton instance
export const dataStore = new DataStore();

// Export class for testing
export { DataStore };
