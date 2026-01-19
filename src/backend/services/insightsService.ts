/**
 * Insights Service for the Agentic Finance Dashboard
 * Generates AI-powered spending insights and budget cognition data
 */

import { dataStore } from '../dataStore';
import { calculateTopCategories } from '../../utils/budgetCalculations';
import type { InsightsResponse, SpendingInsight, CategorySpending } from '../../types/dashboard';

/**
 * Generate spending insights based on transaction history
 */
function generateInsights(): SpendingInsight[] {
  const transactions = dataStore.getAllTransactions();
  const completedTx = transactions.filter(tx => tx.status === 'completed');
  const insights: SpendingInsight[] = [];
  
  if (completedTx.length === 0) {
    insights.push({
      id: 'insight-no-data',
      type: 'suggestion',
      title: 'No transaction history yet',
      description: 'Start making transactions to see spending insights and patterns.',
    });
    return insights;
  }
  
  // Calculate total spend
  const totalSpend = completedTx.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Get top categories
  const topCategories = calculateTopCategories(completedTx, 3);
  
  // Generate category insights
  if (topCategories.length > 0) {
    const topCategory = topCategories[0];
    insights.push({
      id: 'insight-top-category',
      type: 'category',
      title: `${topCategory.name} is your top spending category`,
      description: `${topCategory.percentage.toFixed(1)}% of your spending (${topCategory.amount.toFixed(2)} USDC) goes to ${topCategory.name}.`,
      metadata: {
        category: topCategory.name,
        amount: topCategory.amount,
      },
    });
  }
  
  // Analyze spending patterns
  const recentTx = completedTx.slice(-10);
  const avgAmount = recentTx.reduce((sum, tx) => sum + tx.amount, 0) / recentTx.length;
  
  // Check for high-value transactions
  const highValueTx = completedTx.filter(tx => tx.amount > avgAmount * 2);
  if (highValueTx.length > 0) {
    insights.push({
      id: 'insight-high-value',
      type: 'pattern',
      title: 'High-value transactions detected',
      description: `${highValueTx.length} transaction(s) were significantly above your average spend of ${avgAmount.toFixed(2)} USDC.`,
      metadata: {
        trend: 'up',
      },
    });
  }
  
  // Check rejection rate
  const allDecisions = Array.from(dataStore.getAllDecisions().values());
  const rejectedCount = allDecisions.filter(d => d.recommendation === 'reject').length;
  const rejectionRate = allDecisions.length > 0 ? rejectedCount / allDecisions.length : 0;
  
  if (rejectionRate > 0.3) {
    insights.push({
      id: 'insight-rejection-rate',
      type: 'alert',
      title: 'High rejection rate',
      description: `${Math.round(rejectionRate * 100)}% of your proposals were rejected. Consider reviewing your spending patterns.`,
      metadata: {
        trend: 'down',
      },
    });
  }
  
  // Suggest optimizations
  if (totalSpend > 1000) {
    insights.push({
      id: 'insight-optimization',
      type: 'suggestion',
      title: 'Consider batch transactions',
      description: 'Grouping smaller transactions could reduce overall costs and improve budget predictability.',
    });
  }
  
  // Add time-based pattern insight
  const weekdayTx = completedTx.filter(tx => {
    const day = new Date(tx.timestamp).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendTx = completedTx.filter(tx => {
    const day = new Date(tx.timestamp).getDay();
    return day === 0 || day === 6;
  });
  
  if (weekdayTx.length > weekendTx.length * 3) {
    insights.push({
      id: 'insight-weekday-pattern',
      type: 'pattern',
      title: 'Weekday spending dominates',
      description: 'Most of your transactions occur on weekdays. Consider if weekend operations could be optimized.',
    });
  }
  
  return insights;
}

/**
 * Get the full insights response
 */
export function getInsightsResponse(): InsightsResponse {
  const transactions = dataStore.getAllTransactions();
  const completedTx = transactions.filter(tx => tx.status === 'completed');
  
  const insights = generateInsights();
  const topCategories = calculateTopCategories(completedTx, 3);
  
  return {
    insights,
    topCategories,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get top spending categories
 */
export function getTopCategories(count: number = 3): CategorySpending[] {
  const transactions = dataStore.getAllTransactions();
  const completedTx = transactions.filter(tx => tx.status === 'completed');
  return calculateTopCategories(completedTx, count);
}

/**
 * Refresh insights (regenerate based on latest data)
 */
export function refreshInsights(): SpendingInsight[] {
  const insights = generateInsights();
  dataStore.setInsights(insights);
  return insights;
}
