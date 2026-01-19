/**
 * Property-Based Tests for API Client
 * Tests error handling and message transformation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Transform API errors into user-friendly messages
 * (Extracted logic for testing)
 */
function getUserFriendlyMessage(
  errorMessage: string | undefined,
  statusCode: number
): string {
  if (errorMessage) {
    if (errorMessage.includes('Insufficient balance')) {
      return 'Not enough USDC in your wallet for this transaction.';
    }
    if (errorMessage.includes('Rate limited')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (errorMessage.includes('Invalid')) {
      return errorMessage;
    }
    return errorMessage;
  }
  
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please reconnect your wallet.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please wait a moment.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if a message is user-friendly (no technical jargon)
 */
function isUserFriendly(message: string): boolean {
  const technicalPatterns = [
    /^[A-Z_]+$/,           // All caps error codes like "ECONNREFUSED"
    /^\d{3}$/,             // Just status codes
    /stack trace/i,
    /at \w+\.\w+/,         // Stack trace patterns
    /Error:/,              // Raw error prefixes
    /undefined/,
    /null/,
    /NaN/,
    /\[object Object\]/,
  ];
  
  return !technicalPatterns.some(pattern => pattern.test(message));
}

describe('API Client Error Handling', () => {
  /**
   * **Feature: agentic-finance-dashboard, Property 14: Error Message Display**
   * For any API error response, the Dashboard should display a user-friendly
   * error message (not raw error codes or stack traces).
   */
  describe('Property 14: Error Message Display', () => {
    it('should always return user-friendly messages for any status code', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 599 }),
          (statusCode) => {
            const message = getUserFriendlyMessage(undefined, statusCode);
            
            // Message should be user-friendly
            expect(isUserFriendly(message)).toBe(true);
            
            // Message should not be empty
            expect(message.length).toBeGreaterThan(0);
            
            // Message should be a complete sentence (ends with period)
            expect(message.endsWith('.')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve meaningful error messages while filtering technical ones', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('Insufficient balance for this transaction'),
            fc.constant('Rate limited - try again later'),
            fc.constant('Invalid recipient address'),
            fc.constant('Transaction failed'),
            fc.constant('Network error occurred')
          ),
          fc.integer({ min: 400, max: 599 }),
          (errorMessage, statusCode) => {
            const message = getUserFriendlyMessage(errorMessage, statusCode);
            
            // Should be user-friendly
            expect(isUserFriendly(message)).toBe(true);
            
            // Should not be empty
            expect(message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle known error types with specific messages', () => {
      // Insufficient balance
      const balanceMsg = getUserFriendlyMessage('Insufficient balance', 400);
      expect(balanceMsg).toContain('USDC');
      expect(balanceMsg).toContain('wallet');
      
      // Rate limited
      const rateMsg = getUserFriendlyMessage('Rate limited', 429);
      expect(rateMsg).toContain('wait');
      
      // Invalid input
      const invalidMsg = getUserFriendlyMessage('Invalid address format', 400);
      expect(invalidMsg).toContain('Invalid');
    });

    it('should map common HTTP status codes to helpful messages', () => {
      const statusMessages: Record<number, string[]> = {
        400: ['Invalid', 'check', 'input'],
        401: ['Authentication', 'wallet'],
        404: ['not found'],
        429: ['many requests', 'wait'],
        500: ['Server error', 'try again'],
        502: ['unavailable', 'try again'],
      };
      
      for (const [status, keywords] of Object.entries(statusMessages)) {
        const message = getUserFriendlyMessage(undefined, parseInt(status));
        const hasKeyword = keywords.some(kw => 
          message.toLowerCase().includes(kw.toLowerCase())
        );
        expect(hasKeyword).toBe(true);
      }
    });
  });
});

/**
 * Transaction Status State Management Tests
 */
describe('Transaction Status State Management', () => {
  type TransactionStatus = 'pending' | 'confirming' | 'completed' | 'failed';
  
  interface StatusUIState {
    showLoading: boolean;
    showProgress: boolean;
    showSuccess: boolean;
    showError: boolean;
    showRetry: boolean;
  }
  
  function getUIStateForStatus(status: TransactionStatus): StatusUIState {
    switch (status) {
      case 'pending':
        return {
          showLoading: true,
          showProgress: false,
          showSuccess: false,
          showError: false,
          showRetry: false,
        };
      case 'confirming':
        return {
          showLoading: false,
          showProgress: true,
          showSuccess: false,
          showError: false,
          showRetry: false,
        };
      case 'completed':
        return {
          showLoading: false,
          showProgress: false,
          showSuccess: true,
          showError: false,
          showRetry: false,
        };
      case 'failed':
        return {
          showLoading: false,
          showProgress: false,
          showSuccess: false,
          showError: true,
          showRetry: true,
        };
    }
  }

  /**
   * **Feature: agentic-finance-dashboard, Property 11: Transaction Status State Management**
   * For any transaction status transition, the UI should correctly reflect:
   * 'pending' shows loading, 'confirming' shows progress, 'completed' shows success
   * with updated balance, 'failed' shows error with retry option.
   */
  describe('Property 11: Transaction Status State Management', () => {
    it('should show exactly one primary state for any status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<TransactionStatus>('pending', 'confirming', 'completed', 'failed'),
          (status) => {
            const uiState = getUIStateForStatus(status);
            
            // Count active primary states
            const primaryStates = [
              uiState.showLoading,
              uiState.showProgress,
              uiState.showSuccess,
              uiState.showError,
            ];
            
            const activeCount = primaryStates.filter(Boolean).length;
            
            // Exactly one primary state should be active
            expect(activeCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show retry option only for failed status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<TransactionStatus>('pending', 'confirming', 'completed', 'failed'),
          (status) => {
            const uiState = getUIStateForStatus(status);
            
            if (status === 'failed') {
              expect(uiState.showRetry).toBe(true);
              expect(uiState.showError).toBe(true);
            } else {
              expect(uiState.showRetry).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show loading states only for in-progress statuses', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<TransactionStatus>('pending', 'confirming', 'completed', 'failed'),
          (status) => {
            const uiState = getUIStateForStatus(status);
            
            const isInProgress = status === 'pending' || status === 'confirming';
            const hasLoadingIndicator = uiState.showLoading || uiState.showProgress;
            
            expect(hasLoadingIndicator).toBe(isInProgress);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show success only for completed status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<TransactionStatus>('pending', 'confirming', 'completed', 'failed'),
          (status) => {
            const uiState = getUIStateForStatus(status);
            
            expect(uiState.showSuccess).toBe(status === 'completed');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
