/**
 * StatusBadge - Color-coded status indicator badges
 * Used for transaction status, recommendations, and budget impact
 */

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  warning: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  error: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
  info: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  neutral: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  info: 'bg-blue-400',
  neutral: 'bg-slate-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function StatusBadge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotStyles[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${dotStyles[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}

// Convenience components for common statuses
export function ApprovedBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="success" size={size} dot>Approved</StatusBadge>;
}

export function ModifiedBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="warning" size={size} dot>Modified</StatusBadge>;
}

export function RejectedBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="error" size={size} dot>Rejected</StatusBadge>;
}

export function PendingBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="info" size={size} dot pulse>Pending</StatusBadge>;
}

export function ConfirmingBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="info" size={size} dot pulse>Confirming</StatusBadge>;
}

export function CompletedBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="success" size={size} dot>Completed</StatusBadge>;
}

export function FailedBadge({ size = 'md' }: { size?: BadgeSize }) {
  return <StatusBadge variant="error" size={size} dot>Failed</StatusBadge>;
}

export default StatusBadge;
