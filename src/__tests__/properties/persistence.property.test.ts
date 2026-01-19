/**
 * Property-based tests for data persistence
 * **Feature: agentic-finance-dashboard**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { DataStore } from '../../backend/dataStore';
import type { Transaction, EconomicDecision } from '../../types/dashboard';

// Create a fresh data store for each test
let dataStore: DataStore;

beforeEach(() => {
  dataStore = new DataStore();
});

// Arbitrary generators for test data
const economicDecisionArb = fc.record({
  value_score: fc.integer({ min: 0, max: 100 }).map(n => n / 100),
  budget_impact: fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<'low' | 'medium' | 'high'>,
  recommendation: fc.constantFrom('approve', 'modify', 'reject') as fc.Arbitrary<'approve' | 'modify' | 'reject'>,
  explanation: fc.string({ minLength: 1, maxLength: 200 }),
  suggested_constraints: fc.record({
    max_amount: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
    frequency_limit: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    notes: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  }),
  learning_note: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

const transactionArb = fc.record({
  id: fc.uuid(),
  requestId: fc.uuid(),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  recipient: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
  amount: fc.integer({ min: 1, max: 100000 }),
  purpose: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  category: fc.option(fc.constantFrom('API Calls', 'Storage', 'Compute', 'Network'), { nil: undefined }),
  decision: economicDecisionArb,
  status: fc.constantFrom('pending', 'confirming', 'completed', 'failed') as fc.Arbitrary<'pending' | 'confirming' | 'completed' | 'failed'>,
  txHash: fc.option(fc.hexaString({ minLength: 64, maxLength: 64 }), { nil: undefined }),
  explorerUrl: fc.option(fc.webUrl(), { nil: undefined }),
  errorMessage: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
});

describe('Persistence Property Tests', () => {
  /**
   * **Property 15: Data Persistence Round-Trip**
   * *For any* Decision_Object or Transaction stored via the backend,
   * retrieving it should return an equivalent object with all fields preserved including timestamps.
   * **Validates: Requirements 10.1, 10.2**
   */
  describe('Property 15: Data Persistence Round-Trip', () => {
    it('should preserve all transaction fields on save and retrieve', () => {
      fc.assert(
        fc.property(transactionArb, (transaction) => {
          // Save the transaction
          dataStore.saveTransaction(transaction);

          // Retrieve it
          const retrieved = dataStore.getTransaction(transaction.id);

          // Should exist
          expect(retrieved).toBeDefined();

          // All fields should match
          expect(retrieved!.id).toBe(transaction.id);
          expect(retrieved!.requestId).toBe(transaction.requestId);
          expect(new Date(retrieved!.timestamp).getTime()).toBe(new Date(transaction.timestamp).getTime());
          expect(retrieved!.recipient).toBe(transaction.recipient);
          expect(retrieved!.amount).toBe(transaction.amount);
          expect(retrieved!.purpose).toBe(transaction.purpose);
          expect(retrieved!.category).toBe(transaction.category);
          expect(retrieved!.status).toBe(transaction.status);
          expect(retrieved!.txHash).toBe(transaction.txHash);
          expect(retrieved!.explorerUrl).toBe(transaction.explorerUrl);
          expect(retrieved!.errorMessage).toBe(transaction.errorMessage);

          // Decision should match
          expect(retrieved!.decision.value_score).toBe(transaction.decision.value_score);
          expect(retrieved!.decision.budget_impact).toBe(transaction.decision.budget_impact);
          expect(retrieved!.decision.recommendation).toBe(transaction.decision.recommendation);
          expect(retrieved!.decision.explanation).toBe(transaction.decision.explanation);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all decision fields on save and retrieve', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          economicDecisionArb,
          (requestId, decision) => {
            // Save the decision
            dataStore.saveDecision(requestId, decision);

            // Retrieve it
            const retrieved = dataStore.getDecision(requestId);

            // Should exist
            expect(retrieved).toBeDefined();

            // All fields should match
            expect(retrieved!.value_score).toBe(decision.value_score);
            expect(retrieved!.budget_impact).toBe(decision.budget_impact);
            expect(retrieved!.recommendation).toBe(decision.recommendation);
            expect(retrieved!.explanation).toBe(decision.explanation);
            expect(retrieved!.learning_note).toBe(decision.learning_note);

            // Suggested constraints should match
            expect(retrieved!.suggested_constraints.max_amount).toBe(decision.suggested_constraints.max_amount);
            expect(retrieved!.suggested_constraints.frequency_limit).toBe(decision.suggested_constraints.frequency_limit);
            expect(retrieved!.suggested_constraints.notes).toBe(decision.suggested_constraints.notes);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return undefined for non-existent transactions', () => {
      fc.assert(
        fc.property(fc.uuid(), (id) => {
          const retrieved = dataStore.getTransaction(id);
          expect(retrieved).toBeUndefined();
        }),
        { numRuns: 50 }
      );
    });

    it('should return undefined for non-existent decisions', () => {
      fc.assert(
        fc.property(fc.uuid(), (requestId) => {
          const retrieved = dataStore.getDecision(requestId);
          expect(retrieved).toBeUndefined();
        }),
        { numRuns: 50 }
      );
    });

    it('should preserve multiple transactions independently', () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb, { minLength: 2, maxLength: 10 }),
          (transactions) => {
            // Clear the store for this test
            dataStore.clear();

            // Ensure unique IDs
            const uniqueTransactions = transactions.map((tx, i) => ({
              ...tx,
              id: `tx-${i}-${tx.id}`,
            }));

            // Save all transactions
            for (const tx of uniqueTransactions) {
              dataStore.saveTransaction(tx);
            }

            // Retrieve and verify each
            for (const tx of uniqueTransactions) {
              const retrieved = dataStore.getTransaction(tx.id);
              expect(retrieved).toBeDefined();
              expect(retrieved!.id).toBe(tx.id);
              expect(retrieved!.amount).toBe(tx.amount);
            }

            // Total count should match
            expect(dataStore.getAllTransactions().length).toBe(uniqueTransactions.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should update transactions correctly', () => {
      fc.assert(
        fc.property(
          transactionArb,
          fc.constantFrom('pending', 'confirming', 'completed', 'failed') as fc.Arbitrary<'pending' | 'confirming' | 'completed' | 'failed'>,
          (transaction, newStatus) => {
            // Save original
            dataStore.saveTransaction(transaction);

            // Update status
            const updated = dataStore.updateTransaction(transaction.id, { status: newStatus });

            // Should return updated transaction
            expect(updated).toBeDefined();
            expect(updated!.status).toBe(newStatus);

            // Original fields should be preserved
            expect(updated!.id).toBe(transaction.id);
            expect(updated!.amount).toBe(transaction.amount);
            expect(updated!.recipient).toBe(transaction.recipient);

            // Retrieve should also show update
            const retrieved = dataStore.getTransaction(transaction.id);
            expect(retrieved!.status).toBe(newStatus);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate stored data when modifying retrieved objects', () => {
      fc.assert(
        fc.property(transactionArb, (transaction) => {
          // Save the transaction
          dataStore.saveTransaction(transaction);

          // Retrieve and modify
          const retrieved = dataStore.getTransaction(transaction.id);
          retrieved!.amount = 999999;
          retrieved!.status = 'failed';

          // Retrieve again - should have original values
          const retrievedAgain = dataStore.getTransaction(transaction.id);
          expect(retrievedAgain!.amount).toBe(transaction.amount);
          expect(retrievedAgain!.status).toBe(transaction.status);
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Property 12: Duplicate Transaction Prevention**
   * *For any* proposal that has already been submitted and is pending/completed,
   * attempting to submit the same proposal again should be rejected.
   * **Validates: Requirements 6.6**
   */
  describe('Property 12: Duplicate Transaction Prevention', () => {
    it('should detect duplicate proposals', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          fc.integer({ min: 1, max: 100000 }),
          (recipient, amount) => {
            const proposalKey = dataStore.generateProposalKey(recipient, amount);

            // Initially not pending
            expect(dataStore.isProposalPending(proposalKey)).toBe(false);

            // Mark as pending
            dataStore.markProposalPending(proposalKey);

            // Now should be detected as pending
            expect(dataStore.isProposalPending(proposalKey)).toBe(true);

            // Clear pending
            dataStore.clearProposalPending(proposalKey);

            // Should no longer be pending
            expect(dataStore.isProposalPending(proposalKey)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate consistent proposal keys', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          fc.integer({ min: 1, max: 100000 }),
          (recipient, amount) => {
            const key1 = dataStore.generateProposalKey(recipient, amount);
            const key2 = dataStore.generateProposalKey(recipient, amount);

            // Same inputs should produce same key
            expect(key1).toBe(key2);

            // Key should contain both recipient and amount info
            expect(key1).toContain(recipient.toLowerCase());
            expect(key1).toContain(amount.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate different keys for different proposals', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 1, max: 100000 }),
          (recipient1, recipient2, amount1, amount2) => {
            // Skip if both are the same
            if (recipient1.toLowerCase() === recipient2.toLowerCase() && amount1 === amount2) {
              return;
            }

            const key1 = dataStore.generateProposalKey(recipient1, amount1);
            const key2 = dataStore.generateProposalKey(recipient2, amount2);

            // Different proposals should have different keys
            expect(key1).not.toBe(key2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
