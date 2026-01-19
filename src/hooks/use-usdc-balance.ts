import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { getChainById } from '@/lib/chains'

// Standard ERC-20 ABI for balanceOf
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// USDC contract addresses per chain (testnet)
const USDC_ADDRESSES: Record<string, `0x${string}`> = {
  Arc_Testnet: '0x3600000000000000000000000000000000000000',
  Base_Sepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  Ethereum_Sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  Polygon_Amoy_Testnet: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  Arbitrum_Sepolia: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  Avalanche_Fuji: '0x5425890298aed601595a70AB815c96711a31Bc65',
}

// Map our chain IDs to wagmi chain IDs
const CHAIN_ID_MAP: Record<string, number> = {
  Arc_Testnet: 5042002,
  Base_Sepolia: 84532,
  Ethereum_Sepolia: 11155111,
  Polygon_Amoy_Testnet: 80002,
  Arbitrum_Sepolia: 421614,
  Avalanche_Fuji: 43113,
}

export function useUsdcBalance(chainId: string = 'Arc_Testnet') {
  const { address, isConnected } = useAccount()
  const usdcAddress = USDC_ADDRESSES[chainId]
  const wagmiChainId = CHAIN_ID_MAP[chainId]

  const { data: rawBalance, isLoading, error, refetch } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: wagmiChainId,
    query: {
      enabled: !!address && !!usdcAddress && isConnected,
    },
  })

  const balanceRaw = rawBalance ?? BigInt(0)
  const formatted = formatUnits(balanceRaw, 6)
  const balance = parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return {
    balance,
    balanceRaw,
    isLoading,
    error: error ?? null,
    refresh: refetch,
  }
}
