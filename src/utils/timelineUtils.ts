/**
 * Timeline utilities for the Agentic Finance Dashboard
 * These functions handle timeline entry sorting and manipulation
 */

import type { TimelineEntry } from '../types/dashboard';

/**
 * Sort timeline entries in reverse chronological order (newest first)
 * @param entries - Array of timeline entries
 * @returns New array sorted by timestamp descending
 */
export function sortTimelineEntries(entries: TimelineEntry[]): TimelineEntry[] {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
}

/**
 * Filter timeline entries by type
 * @param entries - Array of timeline entries
 * @param types - Array of types to include
 * @returns Filtered array of timeline entries
 */
export function filterTimelineByType(
  entries: TimelineEntry[],
  types: TimelineEntry['type'][]
): TimelineEntry[] {
  return entries.filter(entry => types.includes(entry.type));
}

/**
 * Get the most recent entry from a timeline
 * @param entries - Array of timeline entries
 * @returns The most recent entry or undefined if empty
 */
export function getMostRecentEntry(entries: TimelineEntry[]): TimelineEntry | undefined {
  if (entries.length === 0) return undefined;
  return sortTimelineEntries(entries)[0];
}

/**
 * Group timeline entries by date
 * @param entries - Array of timeline entries
 * @returns Map of date strings to arrays of entries
 */
export function groupEntriesByDate(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const groups = new Map<string, TimelineEntry[]>();
  
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    const dateKey = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const existing = groups.get(dateKey) || [];
    existing.push(entry);
    groups.set(dateKey, existing);
  }
  
  return groups;
}

/**
 * Paginate timeline entries
 * @param entries - Array of timeline entries (should be pre-sorted)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Object with paginated entries and metadata
 */
export function paginateEntries(
  entries: TimelineEntry[],
  page: number,
  pageSize: number = 20
): {
  entries: TimelineEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const total = entries.length;
  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  
  return {
    entries: entries.slice(startIndex, endIndex),
    page: validPage,
    pageSize,
    total,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrev: validPage > 1,
  };
}

/**
 * Create a new timeline entry for a request
 * @param request - The payment request details
 * @returns A new timeline entry
 */
export function createRequestEntry(request: {
  recipient: string;
  amount: number;
  purpose?: string;
}): TimelineEntry {
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type: 'request',
    request,
  };
}

/**
 * Update a timeline entry with a decision
 * @param entry - The existing timeline entry
 * @param decision - The economic decision
 * @returns Updated timeline entry
 */
export function addDecisionToEntry(
  entry: TimelineEntry,
  decision: TimelineEntry['decision']
): TimelineEntry {
  return {
    ...entry,
    type: 'decision',
    decision,
  };
}

/**
 * Update a timeline entry with execution details
 * @param entry - The existing timeline entry
 * @param execution - The execution details
 * @returns Updated timeline entry
 */
export function addExecutionToEntry(
  entry: TimelineEntry,
  execution: TimelineEntry['execution']
): TimelineEntry {
  return {
    ...entry,
    type: execution?.status === 'completed' ? 'completion' : 'execution',
    execution,
  };
}
