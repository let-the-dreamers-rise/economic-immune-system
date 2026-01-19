import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button"
import { AddressDisplay } from "@/components/address-display"
import { Spinner } from "@/components/ui/spinner"
import { Wallet, LogOut } from "lucide-react"

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <AddressDisplay address={address} />
        </div>
        <Button variant="outline" size="icon" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Use the first available connector (usually injected/MetaMask)
  const connector = connectors[0]

  return (
    <Button onClick={() => connect({ connector })} disabled={isPending}>
      {isPending ? (
        <>
          <Spinner size={16} />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
