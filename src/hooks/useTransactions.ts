/**
 * useTransactions Hook
 * Fetches and manages transaction history with pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchTransactions, ApiClientError } from '../services/api';
import type { TimelineEntry, TransactionsResponse } from '../types/dashboard';

interface UseTransactionsResult {
  transactions: TimelineEntry[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useTransactions(initialPage: number = 1): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TimelineEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response: TransactionsResponse = await fetchTransactions(pageNum);
      
      if (append) {
        setTransactions(prev => [...prev, ...response.transactions]);
      } else {
        setTransactions(response.transactions);
      }
      
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setPage(response.page);
      setError(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch transactions');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (page < totalPages) {
      await loadTransactions(page + 1, true);
    }
  }, [page, totalPages, loadTransactions]);

  const refresh = useCallback(async () => {
    setTransactions([]);
    await loadTransactions(1, false);
  }, [loadTransactions]);

  useEffect(() => {
    loadTransactions(initialPage);
  }, [initialPage, loadTransactions]);

  return {
    transactions,
    total,
    page,
    totalPages,
    isLoading,
    error,
    loadMore,
    refresh,
    setPage: (p: number) => loadTransactions(p, false),
  };
}
