/**
 * Property-based tests for budget calculation utilities
 * **Feature: agentic-finance-dashboard**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateUtilization,
  getWarningLevel,
  calculateTodaySpend,
  calculateTopCategories,
} from '../../utils/budgetCalculations';
import type { Transaction, EconomicDecision } from '../../types/dashboard';

// Helper to create a valid transaction for testing
function createTransaction(
  amount: number,
  timestamp: Date,
  status: 'completed' | 'pending' | 'confirming' | 'failed' = 'completed',
  category?: string
): Transaction {
  const decision: EconomicDecision = {
    value_score: 0.8,
    budget_impact: 'low',
    recommendation: 'approve',
    explanation: 'Test transaction',
    suggested_constraints: {},
  };

  return {
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    recipient: '0x1234567890abcdef',
    amount,
    category,
    decision,
    status,
  };
}

describe('Budget Calculations Property Tests', () => {
  /**
   * **Property 1: Budget Warning Level Calculation**
   * *For any* budget utilization percentage, the warning level should be
   * 'critical' when >= 90%, 'warning' when >= 75% and < 90%, and 'normal' when < 75%.
   * **Validates: Requirements 1.4, 1.5**
   */
  describe('Property 1: Budget Warning Level Calculation', () => {
    it('should return "critical" for utilization >= 90%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 90, max: 200 }),
          (utilization) => {
            expect(getWarningLevel(utilization)).toBe('critical');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "warning" for utilization >= 75% and < 90%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 75, max: 89 }),
          (utilization) => {
            expect(getWarningLevel(utilization)).toBe('warning');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "normal" for utilization < 75%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 74 }),
          (utilization) => {
            expect(getWarningLevel(utilization)).toBe('normal');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 2: Today's Spend Calculation**
   * *For any* set of completed transactions with timestamps from today,
   * the today's spend value should equal the sum of all transaction amounts.
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: Today\'s Spend Calculation', () => {
    it('should sum only completed transactions from today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 0, maxLength: 20 }),
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 0, maxLength: 20 }),
          (todayAmounts, yesterdayAmounts) => {
            const todayTransactions = todayAmounts.map(amount =>
              createTransaction(amount, today, 'completed')
            );
            const yesterdayTransactions = yesterdayAmounts.map(amount =>
              createTransaction(amount, yesterday, 'completed')
            );
            const pendingTransactions = todayAmounts.slice(0, 2).map(amount =>
              createTransaction(amount, today, 'pending')
            );

            const allTransactions = [
              ...todayTransactions,
              ...yesterdayTransactions,
              ...pendingTransactions,
            ];

            const expectedSum = todayAmounts.reduce((sum, a) => sum + a, 0);
            const actualSum = calculateTodaySpend(allTransactions);

            expect(actualSum).toBe(expectedSum);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 3: Utilization Percentage Calculation**
   * *For any* budget limit and current spend amount, the utilization percentage
   * should equal (spend / limit) * 100, clamped to 0-100 range.
   * **Validates: Requirements 1.6**
   */
  describe('Property 3: Utilization Percentage Calculation', () => {
    it('should calculate correct utilization percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 1, max: 100000 }),
          (spend, limit) => {
            const utilization = calculateUtilization(spend, limit);
            const expected = Math.max(0, Math.min(100, (spend / limit) * 100));
            
            // Allow for floating point precision issues
            expect(Math.abs(utilization - expected)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp utilization to 0-100 range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 200000 }),
          fc.integer({ min: 1, max: 100000 }),
          (spend, limit) => {
            const utilization = calculateUtilization(spend, limit);
            expect(utilization).toBeGreaterThanOrEqual(0);
            expect(utilization).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for zero or negative limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: -1000, max: 0 }),
          (spend, limit) => {
            expect(calculateUtilization(spend, limit)).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 7: Top Spending Categories Calculation**
   * *For any* set of transactions with categories, the top 3 categories should be
   * those with the highest sum of amounts, sorted in descending order.
   * **Validates: Requirements 3.2**
   */
  describe('Property 7: Top Spending Categories Calculation', () => {
    it('should return categories sorted by amount in descending order', () => {
      const categories = ['API Calls', 'Storage', 'Compute', 'Network', 'Database'];
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              category: fc.constantFrom(...categories),
            }),
            { minLength: 1, maxLength: 30 }
          ),
          (txData) => {
            const transactions = txData.map(({ amount, category }) =>
              createTransaction(amount, new Date(), 'completed', category)
            );

            const topCategories = calculateTopCategories(transactions, 3);

            // Verify sorted in descending order
            for (let i = 1; i < topCategories.length; i++) {
              expect(topCategories[i - 1].amount).toBeGreaterThanOrEqual(topCategories[i].amount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return at most topN categories', () => {
      const categories = ['A', 'B', 'C', 'D', 'E'];
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              category: fc.constantFrom(...categories),
            }),
            { minLength: 1, maxLength: 30 }
          ),
          fc.integer({ min: 1, max: 10 }),
          (txData, topN) => {
            const transactions = txData.map(({ amount, category }) =>
              createTransaction(amount, new Date(), 'completed', category)
            );

            const topCategories = calculateTopCategories(transactions, topN);
            expect(topCategories.length).toBeLessThanOrEqual(topN);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct percentages summing to ~100%', () => {
      const categories = ['A', 'B', 'C'];
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              category: fc.constantFrom(...categories),
            }),
            { minLength: 3, maxLength: 20 }
          ),
          (txData) => {
            const transactions = txData.map(({ amount, category }) =>
              createTransaction(amount, new Date(), 'completed', category)
            );

            // Get all categories (not just top 3)
            const allCategories = calculateTopCategories(transactions, 100);
            const totalPercentage = allCategories.reduce((sum, c) => sum + c.percentage, 0);

            // Should sum to approximately 100%
            expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
