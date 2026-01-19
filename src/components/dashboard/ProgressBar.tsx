/**
 * ProgressBar - Budget utilization progress bar with gradient fills
 * Shows budget health with color transitions based on utilization
 */

import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

function getProgressColor(value: number): string {
  if (value >= 90) {
    return 'bg-gradient-to-r from-rose-500 to-rose-400';
  } else if (value >= 75) {
    return 'bg-gradient-to-r from-amber-500 to-amber-400';
  } else if (value >= 50) {
    return 'bg-gradient-to-r from-emerald-500 to-amber-400';
  }
  return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
}

function getGlowColor(value: number): string {
  if (value >= 90) {
    return 'shadow-[0_0_10px_rgba(244,63,94,0.3)]';
  } else if (value >= 75) {
    return 'shadow-[0_0_10px_rgba(245,158,11,0.3)]';
  }
  return 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const progressColor = getProgressColor(percentage);
  const glowColor = getGlowColor(percentage);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm text-slate-400">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm font-mono text-slate-300">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full rounded-full overflow-hidden
          bg-slate-700/50
          ${sizeStyles[size]}
        `}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${progressColor}
            ${percentage > 0 ? glowColor : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Dual progress bar for showing spend vs budget
interface DualProgressBarProps {
  spent: number;
  budget: number;
  predicted?: number;
  label?: string;
  className?: string;
}

export function DualProgressBar({
  spent,
  budget,
  predicted,
  label,
  className = '',
}: DualProgressBarProps) {
  const spentPercentage = Math.min(100, (spent / budget) * 100);
  const predictedPercentage = predicted 
    ? Math.min(100, ((spent + predicted) / budget) * 100)
    : spentPercentage;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-slate-400">{label}</span>
          <span className="text-sm font-mono text-slate-300">
            ${spent.toFixed(0)} / ${budget.toFixed(0)}
          </span>
        </div>
      )}
      <div className="relative w-full h-2 rounded-full overflow-hidden bg-slate-700/50">
        {/* Predicted spend (lighter, behind) */}
        {predicted && predictedPercentage > spentPercentage && (
          <div
            className="absolute h-full rounded-full bg-slate-500/30"
            style={{ width: `${predictedPercentage}%` }}
          />
        )}
        {/* Actual spend */}
        <div
          className={`
            absolute h-full rounded-full transition-all duration-500 ease-out
            ${getProgressColor(spentPercentage)}
            ${spentPercentage > 0 ? getGlowColor(spentPercentage) : ''}
          `}
          style={{ width: `${spentPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
