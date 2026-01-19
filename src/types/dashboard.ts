/**
 * Shared TypeScript interfaces for the Agentic Finance Dashboard
 * These types are used by both frontend and backend
 */

// Economic Decision from Gemini AI
export interface EconomicDecision {
  value_score: number;        // 0.0 to 1.0
  budget_impact: 'low' | 'medium' | 'high';
  recommendation: 'approve' | 'modify' | 'reject';
  explanation: string;
  suggested_constraints?: {
    max_amount?: number;
    frequency_limit?: string;
    notes?: string;
  };
  learning_note?: string;
}

// Enhanced Economic Decision with Immune System fields
export interface ImmuneDecisionResponse extends EconomicDecision {
  // Immune system fields
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  patterns_detected: string[];
  confidence_in_decision: number; // 0.0-1.0
  recommended_future_behavior: string;
  immune_memory_references: string[];
  resilience_impact: number; // -10 to +10 impact on overall resilience
}

// Economic Pattern Types
export type EconomicPatternType = 
  | 'recurring_micro_costs'
  | 'vendor_concentration' 
  | 'convenience_bias'
  | 'declining_value'
  | 'budget_creep'
  | 'impulse_clustering';

// Transaction Record
export interface Transaction {
  id: string;
  requestId: string;
  timestamp: Date;
  recipient: string;
  amount: number;
  purpose?: string;
  category?: string;
  decision: ImmuneDecisionResponse;
  status: TransactionStatus;
  txHash?: string;
  explorerUrl?: string;
  errorMessage?: string;
}

export type TransactionStatus = 'pending' | 'confirming' | 'completed' | 'failed';

// Timeline Entry for Decision Timeline component
export interface TimelineEntry {
  id: string;
  timestamp: Date;
  type: 'request' | 'decision' | 'execution' | 'completion';
  request: {
    recipient: string;
    amount: number;
    purpose?: string;
  };
  decision?: ImmuneDecisionResponse;
  execution?: {
    transactionId: string;
    status: TransactionStatus;
    txHash?: string;
    explorerUrl?: string;
  };
}

// Budget Configuration
export interface BudgetConfig {
  weeklyLimit: number;
  monthlyLimit: number;
  reserveMinimum: number;
  warningThreshold: number;    // 0.75
  criticalThreshold: number;   // 0.90
}

// Wallet State
export interface WalletState {
  balance: number;
  address: string;
  blockchain: string;
  tokenId: string;
}

// Budget Warning Level
export type WarningLevel = 'normal' | 'warning' | 'critical';

export interface BudgetWarningLevel {
  level: WarningLevel;
  percentage: number;
}

// Spending Insight for Budget Cognition Panel
export interface SpendingInsight {
  id: string;
  type: 'category' | 'pattern' | 'suggestion' | 'alert';
  title: string;
  description: string;
  metadata?: {
    category?: string;
    amount?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

// Category spending summary
export interface CategorySpending {
  name: string;
  amount: number;
  percentage: number;
}

// Payment Proposal
export interface PaymentProposal {
  recipient: string;
  amount: number;
  purpose?: string;
}

// API Response Types
export interface BalanceResponse {
  balance: number;
  currency: 'USDC';
  blockchain: string;
  weeklyBudget: number;
  weeklySpend: number;
  monthlyBudget: number;
  monthlySpend: number;
  todaySpend: number;
  predictedSpend: number;
  lastUpdated: string;
}

export interface EvaluateRequest {
  recipient: string;
  amount: number;
  purpose?: string;
}

export interface EvaluateResponse {
  requestId: string;
  decision: ImmuneDecisionResponse;
  timestamp: string;
}

export interface PayRequest {
  requestId: string;
  recipient: string;
  amount: number;
}

export interface PayResponse {
  transactionId: string;
  status: TransactionStatus;
  txHash?: string;
  explorerUrl?: string;
}

export interface TransactionsResponse {
  transactions: TimelineEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InsightsResponse {
  insights: SpendingInsight[];
  topCategories: CategorySpending[];
  generatedAt: string;
}

// Error Response
export interface ApiError {
  error: string;
  field?: string;
  circleError?: string;
  geminiError?: string;
  retryAfter?: number;
}
