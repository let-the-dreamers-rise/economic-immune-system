/**
 * Property-based tests for formatting utilities
 * **Feature: agentic-finance-dashboard**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  formatValueScore,
  getRecommendationColor,
  generateExplorerUrl,
} from '../../utils/formatters';

describe('Formatters Property Tests', () => {
  /**
   * **Property 5: Value Score to Percentage Formatting**
   * *For any* value_score between 0.0 and 1.0, the formatted display should be
   * the score multiplied by 100 with a '%' suffix.
   * **Validates: Requirements 2.4**
   */
  describe('Property 5: Value Score to Percentage Formatting', () => {
    it('should format value score as percentage with % suffix', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (scoreInt) => {
            const score = scoreInt / 100;
            const formatted = formatValueScore(score);
            
            // Should end with %
            expect(formatted).toMatch(/%$/);
            
            // Should contain the correct percentage value
            const expectedPercentage = Math.round(score * 100);
            expect(formatted).toBe(`${expectedPercentage}%`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases (0 and 1)', () => {
      expect(formatValueScore(0)).toBe('0%');
      expect(formatValueScore(1)).toBe('100%');
      expect(formatValueScore(0.5)).toBe('50%');
    });

    it('should round to nearest integer percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (scoreInt) => {
            const score = scoreInt / 1000;
            const formatted = formatValueScore(score);
            const numericPart = parseInt(formatted.replace('%', ''), 10);
            
            // Should be a valid integer
            expect(Number.isInteger(numericPart)).toBe(true);
            
            // Should be within expected range
            expect(numericPart).toBeGreaterThanOrEqual(0);
            expect(numericPart).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 6: Recommendation to Color Mapping**
   * *For any* recommendation value, the color mapping should be:
   * 'approve' → emerald/green, 'modify' → amber, 'reject' → rose/red.
   * **Validates: Requirements 2.7**
   */
  describe('Property 6: Recommendation to Color Mapping', () => {
    it('should map approve to emerald color', () => {
      fc.assert(
        fc.property(
          fc.constant('approve' as const),
          (recommendation) => {
            const color = getRecommendationColor(recommendation);
            expect(color).toContain('emerald');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should map modify to amber color', () => {
      fc.assert(
        fc.property(
          fc.constant('modify' as const),
          (recommendation) => {
            const color = getRecommendationColor(recommendation);
            expect(color).toContain('amber');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should map reject to rose color', () => {
      fc.assert(
        fc.property(
          fc.constant('reject' as const),
          (recommendation) => {
            const color = getRecommendationColor(recommendation);
            expect(color).toContain('rose');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should always return a valid Tailwind text color class', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('approve', 'modify', 'reject') as fc.Arbitrary<'approve' | 'modify' | 'reject'>,
          (recommendation) => {
            const color = getRecommendationColor(recommendation);
            expect(color).toMatch(/^text-/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent colors for same recommendation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('approve', 'modify', 'reject') as fc.Arbitrary<'approve' | 'modify' | 'reject'>,
          (recommendation) => {
            const color1 = getRecommendationColor(recommendation);
            const color2 = getRecommendationColor(recommendation);
            expect(color1).toBe(color2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 9: Explorer URL Generation**
   * *For any* transaction with a valid transaction_hash, the generated explorer URL
   * should be a valid URL containing the hash and pointing to the Arc block explorer domain.
   * **Validates: Requirements 4.6**
   */
  describe('Property 9: Explorer URL Generation', () => {
    it('should generate URL containing the transaction hash', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 64, maxLength: 64 }),
          (txHash) => {
            const url = generateExplorerUrl(txHash);
            expect(url).toContain(txHash);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate URL with Arc explorer base domain', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 64, maxLength: 64 }),
          (txHash) => {
            const url = generateExplorerUrl(txHash);
            expect(url).toContain('explorer.arc.dev');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid URL format', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 64, maxLength: 64 }),
          (txHash) => {
            const url = generateExplorerUrl(txHash);
            // Should be a valid URL
            expect(() => new URL(url)).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty string for empty or whitespace hash', () => {
      expect(generateExplorerUrl('')).toBe('');
      expect(generateExplorerUrl('   ')).toBe('');
    });

    it('should handle various hash formats', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 1, maxLength: 100 }),
          (txHash) => {
            const url = generateExplorerUrl(txHash);
            // Should contain the hash
            expect(url).toContain(txHash);
            // Should start with https
            expect(url).toMatch(/^https:\/\//);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
