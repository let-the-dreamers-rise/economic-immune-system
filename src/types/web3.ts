// Transaction status types for multi-step flows
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

export interface TransactionStep {
  id: string
  label: string
  status: TransactionStatus
  txHash?: string
  error?: string
}
