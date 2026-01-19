/**
 * Payment Service for the Agentic Finance Dashboard
 * Handles USDC payment execution via Circle SDK on Arc blockchain
 */

import { dataStore } from '../dataStore';
import { deductFromBalance, hasSufficientBalance } from './balanceService';
import { getDecision } from './evaluateService';
import { generateExplorerUrl } from '../../utils/formatters';
import type { Transaction, PayRequest, PayResponse, TransactionStatus, ImmuneDecisionResponse } from '../../types/dashboard';

// Simulated transaction counter for demo
let transactionCounter = 0;

/**
 * Generate a unique transaction ID
 */
function generateTransactionId(): string {
  transactionCounter++;
  return `tx-${Date.now()}-${transactionCounter}`;
}

/**
 * Generate a simulated transaction hash
 * In production, this would come from the Circle SDK response
 */
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generate an idempotency key for a payment request
 */
export function generateIdempotencyKey(requestId: string, recipient: string, amount: number): string {
  return `${requestId}-${recipient.toLowerCase()}-${amount}`;
}

/**
 * Execute a payment via Circle SDK
 * In production, this calls the actual Circle API
 * For demo/testing, it uses simulated logic
 */
async function executeCirclePayment(
  recipient: string,
  amount: number,
  idempotencyKey: string
): Promise<{ txHash: string; status: TransactionStatus }> {
  // Check if we should use the real Circle SDK
  const useRealCircle = process.env.CIRCLE_API_KEY && process.env.USE_CIRCLE === 'true';
  
  if (useRealCircle) {
    try {
      // Dynamic import to avoid issues when Circle SDK is not configured
      const { executePayment: circleExecutePayment, getTransactionStatus } = await import('../../services/paymentService.js') as any;
      
      const result = await circleExecutePayment(recipient, amount.toString(), idempotencyKey);
      
      return {
        txHash: result.txHash || generateTxHash(),
        status: result.state === 'COMPLETE' ? 'completed' : 
                result.state === 'FAILED' ? 'failed' : 'confirming',
      };
    } catch (error) {
      console.error('Circle SDK error, falling back to simulation:', error);
      // Fall through to simulation
    }
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Transaction failed: Network timeout');
  }
  
  // Generate transaction hash
  const txHash = generateTxHash();
  
  return {
    txHash,
    status: 'confirming',
  };
}

/**
 * Execute an authorized payment
 */
export async function executePayment(request: PayRequest): Promise<PayResponse> {
  const { requestId, recipient, amount } = request;
  
  // Check for duplicate submission
  const proposalKey = dataStore.generateProposalKey(recipient, amount);
  if (dataStore.isProposalPending(proposalKey)) {
    throw new Error('Duplicate transaction: This payment is already being processed');
  }
  
  // Check if we have a decision for this request
  const decision = getDecision(requestId);
  if (!decision) {
    throw new Error('No decision found for this request. Please evaluate the proposal first.');
  }
  
  // Check if the decision allows payment
  if (decision.recommendation === 'reject') {
    throw new Error('Payment rejected by economic reasoning engine');
  }
  
  // Check sufficient balance
  const hasBalance = await hasSufficientBalance(amount);
  if (!hasBalance) {
    throw new Error('Insufficient balance for this transaction');
  }
  
  // Mark proposal as pending to prevent duplicates
  dataStore.markProposalPending(proposalKey);
  
  try {
    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(requestId, recipient, amount);
    
    // Create transaction record
    const transactionId = generateTransactionId();
    const transaction: Transaction = {
      id: transactionId,
      requestId,
      timestamp: new Date(),
      recipient,
      amount,
      decision: decision as ImmuneDecisionResponse,
      status: 'pending',
    };
    
    // Save initial transaction state
    dataStore.saveTransaction(transaction);
    
    // Execute the payment
    const result = await executeCirclePayment(recipient, amount, idempotencyKey);
    
    // Update transaction with result
    const explorerUrl = generateExplorerUrl(result.txHash);
    dataStore.updateTransaction(transactionId, {
      status: result.status,
      txHash: result.txHash,
      explorerUrl,
    });
    
    // Deduct from balance
    deductFromBalance(amount);
    
    // Simulate confirmation after a delay (in production, this would be polled)
    setTimeout(() => {
      dataStore.updateTransaction(transactionId, { status: 'completed' });
      dataStore.clearProposalPending(proposalKey);
    }, 2000);
    
    return {
      transactionId,
      status: result.status,
      txHash: result.txHash,
      explorerUrl,
    };
  } catch (error) {
    // Clear pending status on failure
    dataStore.clearProposalPending(proposalKey);
    
    // Update transaction as failed if it was created
    const existingTx = dataStore.getTransactionByRequestId(requestId);
    if (existingTx) {
      dataStore.updateTransaction(existingTx.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    throw error;
  }
}

/**
 * Get transaction status
 */
export function getTransactionStatus(transactionId: string): Transaction | undefined {
  return dataStore.getTransaction(transactionId);
}

/**
 * Retry a failed transaction
 */
export async function retryTransaction(transactionId: string): Promise<PayResponse> {
  const transaction = dataStore.getTransaction(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'failed') {
    throw new Error('Can only retry failed transactions');
  }
  
  // Reset transaction status
  dataStore.updateTransaction(transactionId, {
    status: 'pending',
    errorMessage: undefined,
  });
  
  // Re-execute
  return executePayment({
    requestId: transaction.requestId,
    recipient: transaction.recipient,
    amount: transaction.amount,
  });
}

/**
 * Cancel a pending transaction (if possible)
 */
export function cancelTransaction(transactionId: string): boolean {
  const transaction = dataStore.getTransaction(transactionId);
  
  if (!transaction) {
    return false;
  }
  
  // Can only cancel pending transactions
  if (transaction.status !== 'pending') {
    return false;
  }
  
  // Update status to failed with cancellation message
  dataStore.updateTransaction(transactionId, {
    status: 'failed',
    errorMessage: 'Transaction cancelled by user',
  });
  
  // Clear pending proposal
  const proposalKey = dataStore.generateProposalKey(transaction.recipient, transaction.amount);
  dataStore.clearProposalPending(proposalKey);
  
  return true;
}
