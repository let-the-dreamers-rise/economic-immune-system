import { useUsdcBalance } from '@/hooks/use-usdc-balance'
import { useAccount } from 'wagmi'
import { TokenUSDC } from '@web3icons/react'
import { Spinner } from '@/components/ui/spinner'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TokenRowProps {
  chainId?: string
  onClick?: () => void
  className?: string
}

export function TokenRow({ chainId = 'Arc_Testnet', onClick, className }: TokenRowProps) {
  const { isConnected } = useAccount()
  const { balance, isLoading } = useUsdcBalance(chainId)

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex items-center justify-between w-full p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <TokenUSDC size={24} variant="branded" />
        </div>
        <div className="text-left">
          <p className="font-semibold">USDC</p>
          <p className="text-xs text-muted-foreground">USD Coin</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <span className="text-muted-foreground">--</span>
        ) : isLoading ? (
          <Spinner size={16} />
        ) : (
          <span className="font-semibold">${balance}</span>
        )}
        {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>
  )
}
