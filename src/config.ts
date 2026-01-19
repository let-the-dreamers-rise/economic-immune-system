import { http, createConfig } from 'wagmi'
import { sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, polygonAmoy, lineaSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Define Arc Testnet (custom chain not in wagmi/chains)
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] }
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' }
  },
  testnet: true
})

export const config = createConfig({
  chains: [arcTestnet, sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, polygonAmoy, lineaSepolia],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
    [sepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [lineaSepolia.id]: http(),
  },
})
