/**
 * AgentOverviewPanel - Primary status display showing wallet health and spending metrics
 * Displays balance with emerald glow, warning indicators, and utilization bars
 */

import React from 'react';
import { Wallet, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { GlowText } from './GlowText';
import { StatusBadge } from './StatusBadge';
import { DualProgressBar } from './ProgressBar';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { calculateUtilization, getWarningLevel } from '../../utils/budgetCalculations';
import type { WarningLevel } from '../../types/dashboard';

interface AgentOverviewPanelProps {
  balance: number;
  todaySpend: number;
  predictedSpend: number;
  weeklyBudget: number;
  weeklySpend: number;
  monthlyBudget: number;
  monthlySpend: number;
  lastUpdated: Date;
}

function getWarningVariant(level: WarningLevel): 'emerald' | 'amber' | 'rose' {
  switch (level) {
    case 'critical': return 'rose';
    case 'warning': return 'amber';
    default: return 'emerald';
  }
}

function getWarningBadge(level: WarningLevel) {
  if (level === 'critical') {
    return (
      <StatusBadge variant="error" size="sm" dot pulse>
        Critical
      </StatusBadge>
    );
  }
  if (level === 'warning') {
    return (
      <StatusBadge variant="warning" size="sm" dot>
        Warning
      </StatusBadge>
    );
  }
  return (
    <StatusBadge variant="success" size="sm" dot>
      Healthy
    </StatusBadge>
  );
}

export function AgentOverviewPanel({
  balance,
  todaySpend,
  predictedSpend,
  weeklyBudget,
  weeklySpend,
  monthlyBudget,
  monthlySpend,
  lastUpdated,
}: AgentOverviewPanelProps) {
  const weeklyUtilization = calculateUtilization(weeklySpend, weeklyBudget);
  const monthlyUtilization = calculateUtilization(monthlySpend, monthlyBudget);
  const overallWarningLevel = getWarningLevel(Math.max(weeklyUtilization, monthlyUtilization));
  const balanceVariant = getWarningVariant(overallWarningLevel);

  return (
    <Card padding="lg" glow={balanceVariant === 'emerald' ? 'emerald' : 'none'}>
      <CardHeader
        title="Agent Wallet"
        subtitle="Financial overview and budget health"
        action={getWarningBadge(overallWarningLevel)}
      />

      {/* Main Balance Display */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-400">Available Balance</span>
        </div>
        <GlowText variant={balanceVariant} size="3xl" mono>
          {formatCurrency(balance)}
        </GlowText>
        <span className="ml-2 text-slate-500 text-lg">USDC</span>
      </div>

      {/* Spend Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Today's Spend</span>
          </div>
          <p className="text-lg font-mono text-white">
            {formatCurrency(todaySpend)}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Predicted Spend</span>
          </div>
          <p className="text-lg font-mono text-slate-300">
            {formatCurrency(predictedSpend)}
          </p>
        </div>
      </div>

      {/* Budget Utilization Bars */}
      <div className="space-y-4">
        <DualProgressBar
          spent={weeklySpend}
          budget={weeklyBudget}
          predicted={predictedSpend}
          label="Weekly Budget"
        />
        <DualProgressBar
          spent={monthlySpend}
          budget={monthlyBudget}
          label="Monthly Budget"
        />
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-dashboard-border flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        <span>Updated {formatRelativeTime(lastUpdated)}</span>
      </div>
    </Card>
  );
}

export default AgentOverviewPanel;
