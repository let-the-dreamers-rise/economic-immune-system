/**
 * Immune Memory Service for the Economic Immune System
 * Manages pattern detection, recipient profiles, and adaptive learning
 */

import { dataStore } from '../dataStore';
import type { 
  Transaction, 
  ImmuneDecisionResponse, 
  EconomicPatternType 
} from '../../types/dashboard';

// Core immune memory interfaces
export interface ImmuneMemory {
  patterns: Map<string, EconomicPattern>;
  recipients: Map<string, RecipientProfile>;
  signals: RiskSignal[];
  adaptations: AdaptationEvent[];
  resilienceScore: number;
  lastUpdated: string;
}

export interface EconomicPattern {
  id: string;
  type: EconomicPatternType;
  description: string;
  detectedAt: string;
  occurrences: PatternOccurrence[];
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  learningConfidence: number;
  totalImpact: number;
}

export interface PatternOccurrence {
  transactionId: string;
  timestamp: string;
  severity: number;
  context: string;
}

export interface RecipientProfile {
  address: string;
  alias?: string;
  transactionHistory: {
    count: number;
    totalAmount: number;
    averageAmount: number;
    purposes: Map<string, number>; // purpose -> frequency
    timePattern: 'regular' | 'sporadic' | 'increasing' | 'decreasing';
  };
  riskAssessment: {
    concentrationRisk: number; // 0-1
    convenienceBias: number; // 0-1
    valueDecline: number; // 0-1
    overallRisk: number; // 0-1
  };
  lastInteraction: string;
}

export interface RiskSignal {
  id: string;
  type: EconomicPatternType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: string;
  relatedTransactions: string[];
  isResolved: boolean;
}

export interface AdaptationEvent {
  id: string;
  timestamp: string;
  patternType: EconomicPatternType;
  adjustment: 'increase' | 'decrease' | 'maintain';
  reason: string;
  outcome: 'success' | 'failure' | 'pending';
}

/**
 * Immune Memory Service Class
 */
class ImmuneMemoryService {
  private memory: ImmuneMemory;

  constructor() {
    this.memory = {
      patterns: new Map(),
      recipients: new Map(),
      signals: [],
      adaptations: [],
      resilienceScore: 75, // Start with moderate resilience
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update memory from a new transaction and decision
   */
  async updateMemoryFromTransaction(
    transaction: Transaction, 
    decision: ImmuneDecisionResponse
  ): Promise<void> {
    // Update recipient profile
    await this.updateRecipientProfile(transaction);
    
    // Record detected patterns
    for (const patternType of decision.patterns_detected) {
      await this.recordPatternDetection(
        patternType as EconomicPatternType,
        transaction,
        decision.threat_level
      );
    }
    
    // Update resilience score
    this.updateResilienceScore(decision.resilience_impact);
    
    // Generate risk signals if needed
    if (decision.threat_level === 'HIGH' || decision.threat_level === 'CRITICAL') {
      this.generateRiskSignal(transaction, decision);
    }
    
    this.memory.lastUpdated = new Date().toISOString();
  }

  /**
   * Detect patterns in a new transaction
   */
  async detectPatterns(newTransaction: Transaction): Promise<EconomicPattern[]> {
    const detectedPatterns: EconomicPattern[] = [];
    const allTransactions = dataStore.getTransactions();
    
    // Detect recurring micro-costs
    const microCostPattern = this.detectRecurringMicroCosts(newTransaction, allTransactions);
    if (microCostPattern) detectedPatterns.push(microCostPattern);
    
    // Detect vendor concentration
    const concentrationPattern = this.detectVendorConcentration(newTransaction, allTransactions);
    if (concentrationPattern) detectedPatterns.push(concentrationPattern);
    
    // Detect convenience bias
    const conveniencePattern = this.detectConvenienceBias(newTransaction, allTransactions);
    if (conveniencePattern) detectedPatterns.push(conveniencePattern);
    
    // Detect declining value
    const decliningValuePattern = this.detectDecliningValue(newTransaction, allTransactions);
    if (decliningValuePattern) detectedPatterns.push(decliningValuePattern);
    
    return detectedPatterns;
  }

  /**
   * Get recipient profile
   */
  async getRecipientProfile(address: string): Promise<RecipientProfile | null> {
    const existing = this.memory.recipients.get(address);
    if (existing) return existing;
    
    // Build profile from transaction history
    const transactions = dataStore.getTransactions().filter(tx => tx.recipient === address);
    if (transactions.length === 0) return null;
    
    const profile = this.buildRecipientProfile(address, transactions);
    this.memory.recipients.set(address, profile);
    return profile;
  }

  /**
   * Calculate current resilience score
   */
  async calculateResilienceScore(): Promise<number> {
    return this.memory.resilienceScore;
  }

  /**
   * Get active risk signals
   */
  async getActiveRiskSignals(): Promise<RiskSignal[]> {
    return this.memory.signals.filter(signal => !signal.isResolved);
  }

  /**
   * Adapt sensitivity based on outcomes
   */
  async adaptSensitivity(
    patternType: EconomicPatternType,
    outcome: 'success' | 'failure'
  ): Promise<void> {
    const adaptation: AdaptationEvent = {
      id: `adapt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      patternType,
      adjustment: outcome === 'success' ? 'maintain' : 'increase',
      reason: outcome === 'success' ? 'Pattern detection was accurate' : 'Pattern detection needs improvement',
      outcome
    };
    
    this.memory.adaptations.push(adaptation);
    
    // Update pattern confidence
    const patterns = Array.from(this.memory.patterns.values())
      .filter(p => p.type === patternType);
    
    for (const pattern of patterns) {
      if (outcome === 'success') {
        pattern.learningConfidence = Math.min(1.0, pattern.learningConfidence + 0.1);
      } else {
        pattern.learningConfidence = Math.max(0.1, pattern.learningConfidence - 0.1);
      }
    }
  }

  // Private helper methods

  private async updateRecipientProfile(transaction: Transaction): Promise<void> {
    const existing = this.memory.recipients.get(transaction.recipient);
    const allRecipientTxs = dataStore.getTransactions()
      .filter(tx => tx.recipient === transaction.recipient);
    
    const profile = existing || this.buildRecipientProfile(transaction.recipient, allRecipientTxs);
    this.memory.recipients.set(transaction.recipient, profile);
  }

  private buildRecipientProfile(address: string, transactions: Transaction[]): RecipientProfile {
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const purposes = new Map<string, number>();
    
    transactions.forEach(tx => {
      if (tx.purpose) {
        purposes.set(tx.purpose, (purposes.get(tx.purpose) || 0) + 1);
      }
    });
    
    // Analyze time pattern
    const timePattern = this.analyzeTimePattern(transactions);
    
    return {
      address,
      transactionHistory: {
        count: transactions.length,
        totalAmount,
        averageAmount: totalAmount / transactions.length,
        purposes,
        timePattern
      },
      riskAssessment: {
        concentrationRisk: this.calculateConcentrationRisk(totalAmount),
        convenienceBias: this.calculateConvenienceBias(transactions),
        valueDecline: this.calculateValueDecline(transactions),
        overallRisk: 0 // Will be calculated from other risks
      },
      lastInteraction: transactions[transactions.length - 1]?.timestamp.toISOString() || new Date().toISOString()
    };
  }

  private analyzeTimePattern(transactions: Transaction[]): 'regular' | 'sporadic' | 'increasing' | 'decreasing' {
    if (transactions.length < 3) return 'sporadic';
    
    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const interval = transactions[i].timestamp.getTime() - transactions[i-1].timestamp.getTime();
      intervals.push(interval);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    // If variance is low, it's regular
    if (variance < avgInterval * 0.3) return 'regular';
    
    // Check if amounts are increasing or decreasing
    const amounts = transactions.map(tx => tx.amount);
    const isIncreasing = amounts.slice(1).every((amount, i) => amount >= amounts[i]);
    const isDecreasing = amounts.slice(1).every((amount, i) => amount <= amounts[i]);
    
    if (isIncreasing) return 'increasing';
    if (isDecreasing) return 'decreasing';
    
    return 'sporadic';
  }

  private calculateConcentrationRisk(recipientTotal: number): number {
    const allTransactions = dataStore.getTransactions();
    const totalSpending = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    if (totalSpending === 0) return 0;
    
    const concentration = recipientTotal / totalSpending;
    return Math.min(1.0, concentration * 2); // Risk increases with concentration
  }

  private calculateConvenienceBias(transactions: Transaction[]): number {
    const roundAmounts = transactions.filter(tx => tx.amount % 10 === 0 && tx.amount > 50);
    return roundAmounts.length / transactions.length;
  }

  private calculateValueDecline(transactions: Transaction[]): number {
    if (transactions.length < 3) return 0;
    
    // Simple heuristic: if amounts are increasing but purposes are similar, value might be declining
    const amounts = transactions.map(tx => tx.amount);
    const recentAvg = amounts.slice(-3).reduce((sum, amt) => sum + amt, 0) / 3;
    const earlierAvg = amounts.slice(0, 3).reduce((sum, amt) => sum + amt, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.2) return 0.6; // Significant increase suggests declining value
    return 0;
  }

  private detectRecurringMicroCosts(
    newTransaction: Transaction, 
    allTransactions: Transaction[]
  ): EconomicPattern | null {
    if (newTransaction.amount >= 50) return null; // Not a micro-cost
    
    const recipientTxs = allTransactions.filter(tx => 
      tx.recipient === newTransaction.recipient && 
      tx.amount < 50
    );
    
    if (recipientTxs.length < 3) return null;
    
    const totalImpact = recipientTxs.reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      id: `pattern-micro-${Date.now()}`,
      type: 'recurring_micro_costs',
      description: `Recurring small payments to ${newTransaction.recipient}`,
      detectedAt: new Date().toISOString(),
      occurrences: recipientTxs.map(tx => ({
        transactionId: tx.id,
        timestamp: tx.timestamp.toISOString(),
        severity: tx.amount / 50, // Normalize to 0-1
        context: tx.purpose || 'No purpose specified'
      })),
      threatLevel: totalImpact > 200 ? 'HIGH' : totalImpact > 100 ? 'MEDIUM' : 'LOW',
      isActive: true,
      learningConfidence: 0.7,
      totalImpact
    };
  }

  private detectVendorConcentration(
    newTransaction: Transaction,
    allTransactions: Transaction[]
  ): EconomicPattern | null {
    const recipientTotal = allTransactions
      .filter(tx => tx.recipient === newTransaction.recipient)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalSpending = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    if (totalSpending === 0) return null;
    
    const concentration = recipientTotal / totalSpending;
    
    if (concentration < 0.3) return null; // Not concentrated enough
    
    return {
      id: `pattern-concentration-${Date.now()}`,
      type: 'vendor_concentration',
      description: `High concentration of spending with ${newTransaction.recipient}`,
      detectedAt: new Date().toISOString(),
      occurrences: [{
        transactionId: newTransaction.id,
        timestamp: new Date().toISOString(),
        severity: concentration,
        context: `${Math.round(concentration * 100)}% of total spending`
      }],
      threatLevel: concentration > 0.6 ? 'HIGH' : concentration > 0.4 ? 'MEDIUM' : 'LOW',
      isActive: true,
      learningConfidence: 0.8,
      totalImpact: recipientTotal
    };
  }

  private detectConvenienceBias(
    newTransaction: Transaction,
    allTransactions: Transaction[]
  ): EconomicPattern | null {
    if (newTransaction.amount % 10 !== 0 || newTransaction.amount <= 50) return null;
    
    const roundAmountTxs = allTransactions.filter(tx => 
      tx.amount % 10 === 0 && tx.amount > 50
    );
    
    const biasRatio = roundAmountTxs.length / allTransactions.length;
    
    if (biasRatio < 0.6) return null; // Not biased enough
    
    return {
      id: `pattern-convenience-${Date.now()}`,
      type: 'convenience_bias',
      description: 'Frequent use of round payment amounts suggesting convenience bias',
      detectedAt: new Date().toISOString(),
      occurrences: roundAmountTxs.slice(-5).map(tx => ({
        transactionId: tx.id,
        timestamp: tx.timestamp.toISOString(),
        severity: biasRatio,
        context: `Round amount: ${tx.amount} USDC`
      })),
      threatLevel: biasRatio > 0.8 ? 'MEDIUM' : 'LOW',
      isActive: true,
      learningConfidence: 0.6,
      totalImpact: roundAmountTxs.reduce((sum, tx) => sum + tx.amount * 0.1, 0) // Estimate 10% premium
    };
  }

  private detectDecliningValue(
    newTransaction: Transaction,
    allTransactions: Transaction[]
  ): EconomicPattern | null {
    const recipientTxs = allTransactions
      .filter(tx => tx.recipient === newTransaction.recipient)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (recipientTxs.length < 4) return null;
    
    const recentAvg = recipientTxs.slice(-2).reduce((sum, tx) => sum + tx.amount, 0) / 2;
    const earlierAvg = recipientTxs.slice(0, 2).reduce((sum, tx) => sum + tx.amount, 0) / 2;
    
    if (recentAvg <= earlierAvg * 1.2) return null; // No significant increase
    
    return {
      id: `pattern-declining-${Date.now()}`,
      type: 'declining_value',
      description: `Increasing payments to ${newTransaction.recipient} may indicate declining value`,
      detectedAt: new Date().toISOString(),
      occurrences: recipientTxs.slice(-3).map(tx => ({
        transactionId: tx.id,
        timestamp: tx.timestamp.toISOString(),
        severity: tx.amount / earlierAvg,
        context: `Amount: ${tx.amount} vs earlier avg: ${earlierAvg.toFixed(2)}`
      })),
      threatLevel: recentAvg > earlierAvg * 1.5 ? 'HIGH' : 'MEDIUM',
      isActive: true,
      learningConfidence: 0.5,
      totalImpact: recentAvg - earlierAvg
    };
  }

  private async recordPatternDetection(
    patternType: EconomicPatternType,
    transaction: Transaction,
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): Promise<void> {
    const patternId = `${patternType}-${transaction.recipient}-${Date.now()}`;
    
    const existingPattern = this.memory.patterns.get(patternId);
    if (existingPattern) {
      // Update existing pattern
      existingPattern.occurrences.push({
        transactionId: transaction.id,
        timestamp: transaction.timestamp.toISOString(),
        severity: threatLevel === 'CRITICAL' ? 1.0 : threatLevel === 'HIGH' ? 0.8 : threatLevel === 'MEDIUM' ? 0.6 : 0.4,
        context: transaction.purpose || 'No context'
      });
    } else {
      // Create new pattern
      const pattern: EconomicPattern = {
        id: patternId,
        type: patternType,
        description: `${patternType} detected for ${transaction.recipient}`,
        detectedAt: new Date().toISOString(),
        occurrences: [{
          transactionId: transaction.id,
          timestamp: transaction.timestamp.toISOString(),
          severity: threatLevel === 'CRITICAL' ? 1.0 : threatLevel === 'HIGH' ? 0.8 : threatLevel === 'MEDIUM' ? 0.6 : 0.4,
          context: transaction.purpose || 'No context'
        }],
        threatLevel,
        isActive: true,
        learningConfidence: 0.5,
        totalImpact: transaction.amount
      };
      
      this.memory.patterns.set(patternId, pattern);
    }
  }

  private updateResilienceScore(impact: number): void {
    this.memory.resilienceScore = Math.max(0, Math.min(100, this.memory.resilienceScore + impact));
  }

  private generateRiskSignal(transaction: Transaction, decision: ImmuneDecisionResponse): void {
    const signal: RiskSignal = {
      id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: decision.patterns_detected[0] as EconomicPatternType || 'recurring_micro_costs',
      severity: decision.threat_level,
      description: `${decision.threat_level} threat detected: ${decision.explanation}`,
      detectedAt: new Date().toISOString(),
      relatedTransactions: [transaction.id],
      isResolved: false
    };
    
    this.memory.signals.push(signal);
  }

  // Public getters for memory inspection
  getMemory(): ImmuneMemory {
    return { ...this.memory };
  }

  getPatterns(): EconomicPattern[] {
    return Array.from(this.memory.patterns.values());
  }

  getRecipients(): RecipientProfile[] {
    return Array.from(this.memory.recipients.values());
  }
}

// Export singleton instance
export const immuneMemoryService = new ImmuneMemoryService();

// Export class for testing
export { ImmuneMemoryService };