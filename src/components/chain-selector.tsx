import { CHAIN_LIST, type Chain } from "@/lib/chains"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ChainSelectorProps {
  value: string
  onChange: (chainId: string) => void
  label?: string
  disabled?: boolean
  excludeChain?: string
  className?: string
}

export function ChainSelector({
  value,
  onChange,
  label,
  disabled = false,
  excludeChain,
  className,
}: ChainSelectorProps) {
  const availableChains = excludeChain 
    ? CHAIN_LIST.filter(chain => chain.id !== excludeChain)
    : CHAIN_LIST

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {availableChains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </Select>
    </div>
  )
}

interface ChainBadgeProps {
  chain: Chain
  size?: "sm" | "md"
}

export function ChainBadge({ chain, size = "md" }: ChainBadgeProps) {
  const Icon = chain.icon
  const iconSize = size === "sm" ? 16 : 20
  
  return (
    <div className="flex items-center gap-2">
      <Icon size={iconSize} variant="branded" />
      <span className={cn(
        "font-medium",
        size === "sm" ? "text-sm" : "text-base"
      )}>
        {chain.name}
      </span>
    </div>
  )
}
