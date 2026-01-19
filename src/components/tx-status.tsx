import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle, ExternalLink, Circle } from "lucide-react"
import type { TransactionStep } from "@/types/web3"

interface TxStatusProps {
  steps: TransactionStep[]
  className?: string
}

export function TxStatus({ steps, className }: TxStatusProps) {
  if (steps.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
        >
          <div className="flex items-center gap-3">
            <StepIcon status={step.status} />
            <span className="text-sm font-medium">{step.label}</span>
          </div>
          {step.txHash && (
            <a
              href={step.txHash}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

function StepIcon({ status }: { status: TransactionStep["status"] }) {
  switch (status) {
    case "pending":
      return <Spinner size={18} className="text-muted-foreground" />
    case "confirming":
      return <Spinner size={18} className="text-accent" />
    case "success":
      return <CheckCircle2 className="h-[18px] w-[18px] text-success" />
    case "error":
      return <XCircle className="h-[18px] w-[18px] text-destructive" />
    default:
      return <Circle className="h-[18px] w-[18px] text-muted-foreground" />
  }
}
