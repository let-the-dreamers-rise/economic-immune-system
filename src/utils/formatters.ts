/**
 * Formatting utilities for the Agentic Finance Dashboard
 * These functions handle display formatting for values, colors, and URLs
 */

import type { EconomicDecision } from '../types/dashboard';

// Arc block explorer base URL
const ARC_EXPLORER_BASE_URL = 'https://explorer.arc.dev/tx/';

/**
 * Format a value score (0.0-1.0) as a percentage string
 * @param score - Value score between 0.0 and 1.0
 * @returns Formatted percentage string (e.g., "85%")
 */
export function formatValueScore(score: number): string {
  const percentage = Math.round(score * 100);
  return `${percentage}%`;
}

/**
 * Get the appropriate color class for a recommendation
 * @param recommendation - The recommendation value ('approve', 'modify', 'reject')
 * @returns Tailwind color class name
 */
export function getRecommendationColor(recommendation: EconomicDecision['recommendation']): string {
  switch (recommendation) {
    case 'approve':
      return 'text-emerald-400';
    case 'modify':
      return 'text-amber-400';
    case 'reject':
      return 'text-rose-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get the background color class for a recommendation
 * @param recommendation - The recommendation value
 * @returns Tailwind background color class name
 */
export function getRecommendationBgColor(recommendation: EconomicDecision['recommendation']): string {
  switch (recommendation) {
    case 'approve':
      return 'bg-emerald-400/10';
    case 'modify':
      return 'bg-amber-400/10';
    case 'reject':
      return 'bg-rose-400/10';
    default:
      return 'bg-slate-400/10';
  }
}

/**
 * Get the border color class for a recommendation
 * @param recommendation - The recommendation value
 * @returns Tailwind border color class name
 */
export function getRecommendationBorderColor(recommendation: EconomicDecision['recommendation']): string {
  switch (recommendation) {
    case 'approve':
      return 'border-emerald-400/30';
    case 'modify':
      return 'border-amber-400/30';
    case 'reject':
      return 'border-rose-400/30';
    default:
      return 'border-slate-400/30';
  }
}

/**
 * Get the color class for budget impact level
 * @param impact - Budget impact level ('low', 'medium', 'high')
 * @returns Tailwind color class name
 */
export function getBudgetImpactColor(impact: EconomicDecision['budget_impact']): string {
  switch (impact) {
    case 'low':
      return 'text-emerald-400';
    case 'medium':
      return 'text-amber-400';
    case 'high':
      return 'text-rose-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Format a currency amount as USDC
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a currency amount with USDC suffix
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "1,234.56 USDC")
 */
export function formatUSDC(amount: number): string {
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} USDC`;
}

/**
 * Generate an Arc block explorer URL for a transaction hash
 * @param txHash - The transaction hash
 * @returns Full explorer URL
 */
export function generateExplorerUrl(txHash: string): string {
  if (!txHash || txHash.trim() === '') {
    return '';
  }
  return `${ARC_EXPLORER_BASE_URL}${txHash}`;
}

/**
 * Format a date as a relative time string
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format a timestamp for display
 * @param date - The date to format
 * @returns Formatted timestamp string
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Truncate an address for display
 * @param address - The full address
 * @param startChars - Number of characters to show at start (default 6)
 * @param endChars - Number of characters to show at end (default 4)
 * @returns Truncated address (e.g., "0x1234...abcd")
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get warning level color classes
 * @param level - Warning level ('normal', 'warning', 'critical')
 * @returns Object with text and glow color classes
 */
export function getWarningLevelColors(level: 'normal' | 'warning' | 'critical'): {
  text: string;
  glow: string;
  bg: string;
} {
  switch (level) {
    case 'critical':
      return {
        text: 'text-rose-400',
        glow: 'shadow-glow-rose',
        bg: 'bg-rose-400/10',
      };
    case 'warning':
      return {
        text: 'text-amber-400',
        glow: 'shadow-glow-amber',
        bg: 'bg-amber-400/10',
      };
    default:
      return {
        text: 'text-emerald-400',
        glow: 'shadow-glow-emerald',
        bg: 'bg-emerald-400/10',
      };
  }
}
