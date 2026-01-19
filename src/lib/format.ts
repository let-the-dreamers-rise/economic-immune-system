export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatUSDC(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

export function parseUSDCAmount(amount: string): bigint {
  const num = parseFloat(amount)
  if (isNaN(num)) return BigInt(0)
  return BigInt(Math.floor(num * 1_000_000))
}
