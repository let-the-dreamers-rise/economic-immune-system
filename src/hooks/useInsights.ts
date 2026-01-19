/**
 * useInsights Hook
 * Fetches AI-generated spending insights
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchInsights, ApiClientError } from '../services/apiClient';
import type { SpendingInsight, CategorySpending } from '../types/dashboard';

interface UseInsightsResult {
  insights: SpendingInsight[];
  topCategories: CategorySpending[];
  generatedAt: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInsights(): UseInsightsResult {
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [topCategories, setTopCategories] = useState<CategorySpending[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchInsights();
      setInsights(response.insights);
      setTopCategories(response.topCategories);
      setGeneratedAt(response.generatedAt);
      setError(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch insights');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    topCategories,
    generatedAt,
    isLoading,
    error,
    refresh,
  };
}
