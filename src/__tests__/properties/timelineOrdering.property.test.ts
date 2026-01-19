/**
 * Property-based tests for timeline ordering utilities
 * **Feature: agentic-finance-dashboard**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortTimelineEntries, paginateEntries } from '../../utils/timelineUtils';
import type { TimelineEntry } from '../../types/dashboard';

// Helper to create a timeline entry with a specific timestamp
function createTimelineEntry(timestamp: Date): TimelineEntry {
  return {
    id: `entry-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    type: 'request',
    request: {
      recipient: '0x1234567890abcdef',
      amount: 100,
      purpose: 'Test',
    },
  };
}

describe('Timeline Ordering Property Tests', () => {
  /**
   * **Property 4: Timeline Chronological Ordering**
   * *For any* list of timeline entries with timestamps, the displayed order
   * should be sorted by timestamp in descending order (newest first).
   * **Validates: Requirements 2.1**
   */
  describe('Property 4: Timeline Chronological Ordering', () => {
    it('should sort entries in descending order by timestamp (newest first)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            { minLength: 0, maxLength: 50 }
          ),
          (timestamps) => {
            const entries = timestamps.map(ts => createTimelineEntry(ts));
            const sorted = sortTimelineEntries(entries);

            // Verify descending order
            for (let i = 1; i < sorted.length; i++) {
              const prevTime = new Date(sorted[i - 1].timestamp).getTime();
              const currTime = new Date(sorted[i].timestamp).getTime();
              expect(prevTime).toBeGreaterThanOrEqual(currTime);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all entries (no entries lost or duplicated)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            { minLength: 0, maxLength: 50 }
          ),
          (timestamps) => {
            const entries = timestamps.map(ts => createTimelineEntry(ts));
            const sorted = sortTimelineEntries(entries);

            // Same length
            expect(sorted.length).toBe(entries.length);

            // All original IDs present
            const originalIds = new Set(entries.map(e => e.id));
            const sortedIds = new Set(sorted.map(e => e.id));
            expect(sortedIds.size).toBe(originalIds.size);
            for (const id of originalIds) {
              expect(sortedIds.has(id)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate the original array', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            { minLength: 1, maxLength: 20 }
          ),
          (timestamps) => {
            const entries = timestamps.map(ts => createTimelineEntry(ts));
            const originalOrder = entries.map(e => e.id);
            
            sortTimelineEntries(entries);
            
            // Original array should be unchanged
            const afterOrder = entries.map(e => e.id);
            expect(afterOrder).toEqual(originalOrder);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty arrays', () => {
      const sorted = sortTimelineEntries([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single entry arrays', () => {
      const entry = createTimelineEntry(new Date());
      const sorted = sortTimelineEntries([entry]);
      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe(entry.id);
    });

    it('should be idempotent (sorting twice gives same result)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            { minLength: 0, maxLength: 30 }
          ),
          (timestamps) => {
            const entries = timestamps.map(ts => createTimelineEntry(ts));
            const sortedOnce = sortTimelineEntries(entries);
            const sortedTwice = sortTimelineEntries(sortedOnce);

            // Same order after sorting twice
            expect(sortedTwice.map(e => e.id)).toEqual(sortedOnce.map(e => e.id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Property 16: Pagination Correctness**
   * *For any* total number of transactions N and page size 20, requesting page P
   * should return items from index (P-1)*20 to min(P*20-1, N-1), and totalPages
   * should equal ceil(N/20).
   * **Validates: Requirements 10.4**
   */
  describe('Property 16: Pagination Correctness', () => {
    it('should calculate correct totalPages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          fc.integer({ min: 1, max: 50 }),
          (totalItems, pageSize) => {
            const entries = Array.from({ length: totalItems }, (_, i) =>
              createTimelineEntry(new Date(Date.now() - i * 1000))
            );

            const result = paginateEntries(entries, 1, pageSize);
            const expectedTotalPages = Math.ceil(totalItems / pageSize);

            expect(result.totalPages).toBe(expectedTotalPages);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 totalPages for empty array', () => {
      const result = paginateEntries([], 1, 20);
      expect(result.totalPages).toBe(0);
      expect(result.entries.length).toBe(0);
    });

    it('should return correct number of items per page', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 50 }),
          (totalItems, page, pageSize) => {
            const entries = Array.from({ length: totalItems }, (_, i) =>
              createTimelineEntry(new Date(Date.now() - i * 1000))
            );

            const result = paginateEntries(entries, page, pageSize);
            const totalPages = Math.ceil(totalItems / pageSize);
            const validPage = Math.max(1, Math.min(page, totalPages));

            // Calculate expected items on this page
            const startIndex = (validPage - 1) * pageSize;
            const expectedItems = Math.min(pageSize, totalItems - startIndex);

            expect(result.entries.length).toBe(Math.max(0, expectedItems));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return correct items for each page', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 21, max: 100 }),
          fc.integer({ min: 1, max: 5 }),
          (totalItems, page) => {
            const pageSize = 20;
            const entries = Array.from({ length: totalItems }, (_, i) =>
              createTimelineEntry(new Date(Date.now() - i * 1000))
            );

            const result = paginateEntries(entries, page, pageSize);
            const totalPages = Math.ceil(totalItems / pageSize);
            const validPage = Math.max(1, Math.min(page, totalPages));

            // Verify correct slice
            const expectedStartIndex = (validPage - 1) * pageSize;
            const expectedEndIndex = Math.min(expectedStartIndex + pageSize, totalItems);
            const expectedEntries = entries.slice(expectedStartIndex, expectedEndIndex);

            expect(result.entries.map(e => e.id)).toEqual(expectedEntries.map(e => e.id));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly set hasNext and hasPrev flags', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 50 }),
          (totalItems, page, pageSize) => {
            const entries = Array.from({ length: totalItems }, (_, i) =>
              createTimelineEntry(new Date(Date.now() - i * 1000))
            );

            const result = paginateEntries(entries, page, pageSize);

            expect(result.hasNext).toBe(result.page < result.totalPages);
            expect(result.hasPrev).toBe(result.page > 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle page numbers beyond valid range', () => {
      const entries = Array.from({ length: 50 }, (_, i) =>
        createTimelineEntry(new Date(Date.now() - i * 1000))
      );

      // Page too high
      const highPage = paginateEntries(entries, 100, 20);
      expect(highPage.page).toBe(3); // Should clamp to last page

      // Page too low
      const lowPage = paginateEntries(entries, 0, 20);
      expect(lowPage.page).toBe(1); // Should clamp to first page

      // Negative page
      const negativePage = paginateEntries(entries, -5, 20);
      expect(negativePage.page).toBe(1);
    });
  });
});
