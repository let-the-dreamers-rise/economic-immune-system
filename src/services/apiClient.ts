/**
 * API Client Service for the Agentic Finance Dashboard
 * Handles all communication with the backend API
 */

import type {
  BalanceResponse,
  EvaluateRequest,
  EvaluateResponse,
  PayRequest,
  PayResponse,
  TransactionsResponse,
  InsightsResponse,
  ApiError,
} from '../types/dashboard';

// @ts-ignore - Vite env types
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || '/api';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public field?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Transform API errors into user-friendly messages
 */
function getUserFriendlyMessage(error: ApiError, statusCode: number): string {
  if (error.error) {
    // Already has a message
    if (error.error.includes('Insufficient balance')) {
      return 'Not enough USDC in your wallet for this transaction.';
    }
    if (error.error.includes('Rate limited')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.error.includes('Invalid')) {
      return error.error;
    }
    return error.error;
  }
  
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please reconnect your wallet.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please wait a moment.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const apiError = data as ApiError;
      const message = getUserFriendlyMessage(apiError, response.status);
      throw new ApiClientError(
        message,
        response.status,
        apiError.field,
        apiError.retryAfter
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Network or parsing error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiClientError(
        'Unable to connect to the server. Please check your connection.',
        0
      );
    }
    
    throw new ApiClientError(
      'An unexpected error occurred. Please try again.',
      0
    );
  }
}

/**
 * Fetch current wallet balance and budget status
 */
export async function fetchBalance(): Promise<BalanceResponse> {
  return apiFetch<BalanceResponse>('/balance');
}

/**
 * Evaluate a payment proposal with the Economic Reasoning Engine
 */
export async function evaluateProposal(
  request: EvaluateRequest
): Promise<EvaluateResponse> {
  return apiFetch<EvaluateResponse>('/evaluate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Execute an authorized payment
 */
export async function executePayment(request: PayRequest): Promise<PayResponse> {
  return apiFetch<PayResponse>('/pay', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Fetch transaction history with pagination
 */
export async function fetchTransactions(
  page: number = 1,
  limit: number = 20
): Promise<TransactionsResponse> {
  return apiFetch<TransactionsResponse>(
    `/transactions?page=${page}&limit=${limit}`
  );
}

/**
 * Fetch AI-generated spending insights
 */
export async function fetchInsights(): Promise<InsightsResponse> {
  return apiFetch<InsightsResponse>('/insights');
}

/**
 * Poll for transaction status updates
 */
export async function pollTransactionStatus(
  transactionId: string
): Promise<PayResponse> {
  return apiFetch<PayResponse>(`/transactions/${transactionId}/status`);
}
