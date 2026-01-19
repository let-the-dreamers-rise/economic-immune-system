import { useUsdcBalance } from '@/hooks/use-usdc-balance'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { TokenUSDC } from '@web3icons/react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceCardProps {
  chainId?: string
  className?: string
}

export function BalanceCard({ chainId = 'Arc_Testnet', className }: BalanceCardProps) {
  const { isConnected } = useAccount()
  const { balance, isLoading, refresh } = useUsdcBalance(chainId)

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <TokenUSDC size={18} variant="branded" />
            USDC Balance
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refresh}
            disabled={isLoading || !isConnected}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <p className="text-2xl font-bold text-muted-foreground">--</p>
        ) : isLoading ? (
          <div className="flex items-center gap-2">
            <Spinner size={20} />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <p className="text-3xl font-bold tracking-tight">${balance}</p>
        )}
      </CardContent>
    </Card>
  )
}
