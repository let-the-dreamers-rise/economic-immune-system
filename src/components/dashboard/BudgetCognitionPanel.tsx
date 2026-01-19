/**
 * BudgetCognitionPanel - AI-generated insights about spending patterns
 * Displays natural language insights, top categories, and suggestions
 */

import React from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertTriangle,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader } from './Card';
import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import type { SpendingInsight, CategorySpending } from '../../types/dashboard';

interface BudgetCognitionPanelProps {
  insights: SpendingInsight[];
  topCategories: CategorySpending[];
  isLoading?: boolean;
}

function getInsightIcon(type: SpendingInsight['type']) {
  switch (type) {
    case 'category':
      return <PieChart className="w-4 h-4" />;
    case 'pattern':
      return <TrendingUp className="w-4 h-4" />;
    case 'suggestion':
      return <Lightbulb className="w-4 h-4" />;
    case 'alert':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

function getInsightColor(type: SpendingInsight['type']) {
  switch (type) {
    case 'category':
      return 'text-blue-400 bg-blue-400/10';
    case 'pattern':
      return 'text-purple-400 bg-purple-400/10';
    case 'suggestion':
      return 'text-emerald-400 bg-emerald-400/10';
    case 'alert':
      return 'text-amber-400 bg-amber-400/10';
    default:
      return 'text-slate-400 bg-slate-400/10';
  }
}

function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-rose-400" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-emerald-400" />;
    case 'stable':
      return <Minus className="w-3 h-3 text-slate-400" />;
    default:
      return null;
  }
}

function InsightCard({ insight }: { insight: SpendingInsight }) {
  const colorClass = getInsightColor(insight.type);

  return (
    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {getInsightIcon(insight.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white truncate">
              {insight.title}
            </h4>
            {insight.metadata?.trend && getTrendIcon(insight.metadata.trend)}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {insight.description}
          </p>
          {insight.metadata?.amount && (
            <p className="text-xs font-mono text-slate-300 mt-1">
              {formatCurrency(insight.metadata.amount)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ category, maxAmount }: { category: CategorySpending; maxAmount: number }) {
  const widthPercentage = (category.amount / maxAmount) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{category.name}</span>
        <span className="font-mono text-slate-400">
          {formatCurrency(category.amount)}
        </span>
      </div>
      <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      <div className="text-right">
        <span className="text-xs text-slate-500">
          {category.percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function BudgetCognitionPanel({
  insights,
  topCategories,
  isLoading = false,
}: BudgetCognitionPanelProps) {
  const maxCategoryAmount = topCategories.length > 0
    ? Math.max(...topCategories.map(c => c.amount))
    : 0;

  if (isLoading) {
    return (
      <Card padding="lg">
        <CardHeader
          title="Budget Intelligence"
          subtitle="AI-powered spending insights"
        />
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-slate-400">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Analyzing spending patterns...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader
        title="Budget Intelligence"
        subtitle="AI-powered spending insights"
        action={
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Brain className="w-4 h-4" />
            <span className="text-xs">Gemini</span>
          </div>
        }
      />

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-400" />
            Top Spending Categories
          </h4>
          <div className="space-y-4">
            {topCategories.map((category) => (
              <CategoryBar
                key={category.name}
                category={category}
                maxAmount={maxCategoryAmount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-400" />
            Insights & Suggestions
          </h4>
          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {insights.length === 0 && topCategories.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            Make some transactions to see AI-powered insights
          </p>
        </div>
      )}
    </Card>
  );
}

export default BudgetCognitionPanel;
