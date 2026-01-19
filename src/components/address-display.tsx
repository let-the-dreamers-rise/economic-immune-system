import { formatAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AddressDisplayProps {
  address: string
  chars?: number
  className?: string
  showCopy?: boolean
}

export function AddressDisplay({ 
  address, 
  chars = 4, 
  className,
  showCopy = false 
}: AddressDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
  }

  return (
    <span 
      className={cn(
        "font-mono text-sm",
        showCopy && "cursor-pointer hover:text-accent",
        className
      )}
      onClick={showCopy ? handleCopy : undefined}
      title={showCopy ? "Click to copy" : address}
    >
      {formatAddress(address, chars)}
    </span>
  )
}
