/**
 * useTransactionStatus Hook
 * Polls for transaction status updates for pending transactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { pollTransactionStatus, ApiClientError } from '../services/apiClient';
import type { TransactionStatus, PayResponse } from '../types/dashboard';

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

interface UseTransactionStatusResult {
  status: TransactionStatus | null;
  txHash: string | null;
  explorerUrl: string | null;
  isPolling: boolean;
  error: string | null;
  startPolling: (transactionId: string) => void;
  stopPolling: () => void;
}

export function useTransactionStatus(
  onComplete?: (response: PayResponse) => void,
  onFailed?: (error: string) => void
): UseTransactionStatusResult {
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const transactionIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    attemptCountRef.current = 0;
    transactionIdRef.current = null;
  }, []);

  const pollStatus = useCallback(async () => {
    if (!transactionIdRef.current) return;
    
    attemptCountRef.current += 1;
    
    if (attemptCountRef.current > MAX_POLL_ATTEMPTS) {
      stopPolling();
      setError('Transaction status check timed out');
      onFailed?.('Transaction status check timed out');
      return;
    }
    
    try {
      const response = await pollTransactionStatus(transactionIdRef.current);
      setStatus(response.status);
      setTxHash(response.txHash || null);
      setExplorerUrl(response.explorerUrl || null);
      
      if (response.status === 'completed') {
        stopPolling();
        onComplete?.(response);
      } else if (response.status === 'failed') {
        stopPolling();
        setError('Transaction failed');
        onFailed?.('Transaction failed');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to check transaction status');
      }
      // Don't stop polling on transient errors
    }
  }, [stopPolling, onComplete, onFailed]);

  const startPolling = useCallback((transactionId: string) => {
    // Stop any existing polling
    stopPolling();
    
    // Reset state
    setStatus('pending');
    setTxHash(null);
    setExplorerUrl(null);
    setError(null);
    setIsPolling(true);
    
    transactionIdRef.current = transactionId;
    attemptCountRef.current = 0;
    
    // Initial poll
    pollStatus();
    
    // Set up interval
    intervalRef.current = setInterval(pollStatus, POLL_INTERVAL);
  }, [stopPolling, pollStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    txHash,
    explorerUrl,
    isPolling,
    error,
    startPolling,
    stopPolling,
  };
}
