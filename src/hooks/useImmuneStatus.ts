/**
 * Custom hook for fetching Economic Immune System status
 */

import { useState, useEffect, useCallback } from 'react';

interface RiskSignal {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: string;
}

interface ImmuneStatusData {
  resilienceScore: number;
  activeRiskSignals: RiskSignal[];
  learnedPatternsCount: number;
  adaptationRate: number;
  lastUpdated: string;
}

interface UseImmuneStatusReturn {
  data: ImmuneStatusData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useImmuneStatus(): UseImmuneStatusReturn {
  const [data, setData] = useState<ImmuneStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImmuneStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/immune-status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const statusData = await response.json();
      setData(statusData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch immune status';
      setError(errorMessage);
      console.error('Failed to fetch immune status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchImmuneStatus();
  }, [fetchImmuneStatus]);

  useEffect(() => {
    fetchImmuneStatus();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchImmuneStatus, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchImmuneStatus]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
}