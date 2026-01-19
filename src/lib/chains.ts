import {
  NetworkArc,
  NetworkBase,
  NetworkEthereum,
  NetworkPolygon,
  NetworkArbitrumOne,
  NetworkAvalanche,
  NetworkLinea,
} from '@web3icons/react'
import type { ComponentType } from 'react'

// Chain metadata for UI (icons, explorer URLs, CCTP domains)
// Wagmi config handles RPC and chain definitions - see src/config.ts
export interface Chain {
  id: string
  name: string
  chainId: number
  icon: ComponentType<{ size?: number; variant?: string }>
  explorerUrl: string
  cctpDomain?: number
  isTestnet: boolean
}

export const SUPPORTED_CHAINS: Record<string, Chain> = {
  Arc_Testnet: {
    id: 'Arc_Testnet',
    name: 'Arc Testnet',
    chainId: 5042002,
    icon: NetworkArc,
    explorerUrl: 'https://testnet.arcscan.app',
    cctpDomain: 26,
    isTestnet: true,
  },
  Base_Sepolia: {
    id: 'Base_Sepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    icon: NetworkBase,
    explorerUrl: 'https://sepolia.basescan.org',
    cctpDomain: 6,
    isTestnet: true,
  },
  Ethereum_Sepolia: {
    id: 'Ethereum_Sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    icon: NetworkEthereum,
    explorerUrl: 'https://sepolia.etherscan.io',
    cctpDomain: 0,
    isTestnet: true,
  },
  Polygon_Amoy_Testnet: {
    id: 'Polygon_Amoy_Testnet',
    name: 'Polygon Amoy',
    chainId: 80002,
    icon: NetworkPolygon,
    explorerUrl: 'https://amoy.polygonscan.com',
    cctpDomain: 7,
    isTestnet: true,
  },
  Arbitrum_Sepolia: {
    id: 'Arbitrum_Sepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    icon: NetworkArbitrumOne,
    explorerUrl: 'https://sepolia.arbiscan.io',
    cctpDomain: 3,
    isTestnet: true,
  },
  Avalanche_Fuji: {
    id: 'Avalanche_Fuji',
    name: 'Avalanche Fuji',
    chainId: 43113,
    icon: NetworkAvalanche,
    explorerUrl: 'https://testnet.snowtrace.io',
    cctpDomain: 1,
    isTestnet: true,
  },
  Linea_Sepolia: {
    id: 'Linea_Sepolia',
    name: 'Linea Sepolia',
    chainId: 59141,
    icon: NetworkLinea,
    explorerUrl: 'https://sepolia.lineascan.build',
    isTestnet: true,
  },
}

export const CHAIN_LIST = Object.values(SUPPORTED_CHAINS)

export function getChainById(id: string): Chain | undefined {
  return SUPPORTED_CHAINS[id]
}

export function getChainByChainId(chainId: number): Chain | undefined {
  return CHAIN_LIST.find(chain => chain.chainId === chainId)
}

export function getExplorerTxUrl(chain: Chain, txHash: string): string {
  return `${chain.explorerUrl}/tx/${txHash}`
}

export function getExplorerAddressUrl(chain: Chain, address: string): string {
  return `${chain.explorerUrl}/address/${address}`
}
