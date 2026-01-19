/**
 * useBalance Hook
 * Fetches and manages wallet balance with automatic polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBalance, ApiClientError } from '../services/api';
import type { BalanceResponse } from '../types/dashboard';

const POLL_INTERVAL = 30000; // 30 seconds

interface UseBalanceResult {
  data: BalanceResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBalance(): UseBalanceResult {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      const response = await fetchBalance();
      setData(response);
      setError(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch balance');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    loadBalance();

    // Set up polling
    intervalRef.current = setInterval(loadBalance, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadBalance]);

  return { data, isLoading, error, refresh };
}
