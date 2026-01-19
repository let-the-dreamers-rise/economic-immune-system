
export enum BudgetImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RecommendationType {
  APPROVE = 'approve',
  MODIFY = 'modify',
  REJECT = 'reject'
}

export interface SuggestedConstraints {
  max_amount?: number;
  frequency_limit?: string;
  notes?: string;
}

export interface EconomicDecision {
  value_score: number;
  budget_impact: BudgetImpact;
  recommendation: RecommendationType;
  explanation: string;
  suggested_constraints: SuggestedConstraints;
  learning_note?: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  recipient: string;
  purpose: string;
  decision: EconomicDecision;
  status: 'pending' | 'completed' | 'rejected';
}

export interface AgentWalletState {
  balance: number;
  weeklyBudget: number;
  weeklySpend: number;
  history: Transaction[];
}
