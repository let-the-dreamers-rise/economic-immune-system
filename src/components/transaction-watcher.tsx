import { useEffect } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAddress } from '@/lib/format'
import { getChainByChainId } from '@/lib/chains'

interface TransactionWatcherProps {
  txHash: `0x${string}` | undefined
  chainId: number
  label?: string
  confirmations?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
}

export function TransactionWatcher({
  txHash,
  chainId,
  label = 'Transaction',
  confirmations = 1,
  onSuccess,
  onError,
  className,
}: TransactionWatcherProps) {
  const { data: receipt, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations,
  })

  const chain = getChainByChainId(chainId)
  const explorerUrl = chain && txHash ? `${chain.explorerUrl}/tx/${txHash}` : null

  // Call callbacks on status change
  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess()
    if (isError && error && onError) onError(error)
  }, [isSuccess, isError, error, onSuccess, onError])

  if (!txHash) return null

  const status = isSuccess ? 'success' : isError ? 'error' : isLoading ? 'confirming' : 'pending'

  return (
    <div className={cn(
      "rounded-lg border p-4",
      isSuccess && "border-success/50 bg-success/5",
      isError && "border-destructive/50 bg-destructive/5",
      isLoading && "border-accent/50 bg-accent/5",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon status={status} />
          <div>
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {formatAddress(txHash, 6)}
            </div>
          </div>
        </div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-accent">
            <Spinner size={12} />
            Waiting for {confirmations} confirmation{confirmations > 1 ? 's' : ''}...
          </div>
        )}
        {isSuccess && receipt && (
          <div className="text-xs text-success">
            Confirmed in block #{receipt.blockNumber.toString()}
          </div>
        )}
        {isError && (
          <div className="text-xs text-destructive">
            {error?.message || 'Transaction failed'}
          </div>
        )}
      </div>
    </div>
  )
}

type TxStatus = 'pending' | 'confirming' | 'success' | 'error'

function StatusIcon({ status }: { status: TxStatus }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-muted-foreground" />
    case 'confirming':
      return <Spinner size={20} className="text-accent" />
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive" />
  }
}

// Simpler inline version for quick status display
interface TxStatusBadgeProps {
  txHash: `0x${string}` | undefined
  chainId: number
  className?: string
}

export function TxStatusBadge({ txHash, chainId, className }: TxStatusBadgeProps) {
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash })
  const chain = getChainByChainId(chainId)
  const explorerUrl = chain && txHash ? `${chain.explorerUrl}/tx/${txHash}` : null

  if (!txHash) return null

  return (
    <a
      href={explorerUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
        isSuccess && "bg-success/10 text-success",
        isError && "bg-destructive/10 text-destructive",
        isLoading && "bg-accent/10 text-accent",
        !isLoading && !isSuccess && !isError && "bg-muted text-muted-foreground",
        className
      )}
    >
      {isLoading && <><Spinner size={10} /> Confirming</>}
      {isSuccess && <><CheckCircle2 className="h-3 w-3" /> Confirmed</>}
      {isError && <><XCircle className="h-3 w-3" /> Failed</>}
      {!isLoading && !isSuccess && !isError && <><Clock className="h-3 w-3" /> Pending</>}
    </a>
  )
}
