import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { getChainByChainId, CHAIN_LIST } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkBadgeProps {
  className?: string
  showSwitcher?: boolean
}

export function NetworkBadge({ className, showSwitcher = false }: NetworkBadgeProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  if (!isConnected) {
    return (
      <Badge variant="secondary" className={cn("gap-1.5", className)}>
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        Not Connected
      </Badge>
    )
  }

  const chain = chainId ? getChainByChainId(chainId) : null
  
  if (!chain) {
    return (
      <Badge variant="destructive" className={cn("gap-1.5", className)}>
        <AlertTriangle className="h-3 w-3" />
        Unsupported Network
      </Badge>
    )
  }

  const Icon = chain.icon

  if (showSwitcher) {
    return (
      <div className="relative group">
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Icon size={16} variant="branded" />
          {chain.name}
          <ChevronDown className="h-3 w-3" />
        </Button>
        <div className="absolute top-full right-0 mt-1 hidden group-hover:block z-50">
          <div className="rounded-lg border bg-card shadow-lg p-1 min-w-[180px]">
            {CHAIN_LIST.map((c) => {
              const ChainIcon = c.icon
              return (
                <button
                  key={c.id}
                  onClick={() => switchChain({ chainId: c.chainId })}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                    c.chainId === chainId && "bg-muted"
                  )}
                >
                  <ChainIcon size={16} variant="branded" />
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Badge variant="outline" className={cn("gap-1.5 pr-3", className)}>
      <Icon size={14} variant="branded" />
      {chain.name}
    </Badge>
  )
}
