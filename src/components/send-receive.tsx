import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowUpRight, ArrowDownLeft, X, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

// ERC-20 transfer ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// USDC address (Arc Testnet)
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const { isConnected } = useAccount()
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)

  return (
    <>
      <div className={cn("flex gap-3", className)}>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setShowSend(true)}
          disabled={!isConnected}
        >
          <ArrowUpRight className="h-4 w-4" />
          Send
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setShowReceive(true)}
          disabled={!isConnected}
        >
          <ArrowDownLeft className="h-4 w-4" />
          Receive
        </Button>
      </div>

      {/* Send Modal */}
      {showSend && (
        <Modal onClose={() => setShowSend(false)}>
          <SendForm onClose={() => setShowSend(false)} />
        </Modal>
      )}

      {/* Receive Modal */}
      {showReceive && (
        <Modal onClose={() => setShowReceive(false)}>
          <ReceiveCard onClose={() => setShowReceive(false)} />
        </Modal>
      )}
    </>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

function SendForm({ onClose }: { onClose: () => void }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleSend = () => {
    if (!recipient || !amount) return

    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, parseUnits(amount, 6)],
    })
  }

  // Close modal on success
  if (isSuccess) {
    setTimeout(onClose, 1500)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5" />
          Send USDC
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Recipient Address</Label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Amount (USDC)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>
        <Button
          className="w-full"
          onClick={handleSend}
          disabled={!recipient || !amount || isPending || isConfirming}
        >
          {isPending ? (
            <><Spinner size={16} /> Confirm in wallet...</>
          ) : isConfirming ? (
            <><Spinner size={16} /> Confirming...</>
          ) : isSuccess ? (
            'Sent!'
          ) : (
            'Send USDC'
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          This will open your wallet to confirm the transaction
        </p>
      </CardContent>
    </Card>
  )
}

function ReceiveCard({ onClose }: { onClose: () => void }) {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ArrowDownLeft className="h-5 w-5" />
          Receive USDC
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {address && (
            <QRCodeSVG
              value={address}
              size={180}
              level="H"
              includeMargin={false}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Your Address</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 rounded-lg bg-muted text-sm font-mono break-all">
              {address}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Send only USDC to this address on supported networks
        </p>
      </CardContent>
    </Card>
  )
}
