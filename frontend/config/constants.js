// Contract addresses (MockVerifier - FOR TESTING ONLY!)
export const CONTRACTS = {
  streamCredit: '0xd619f5966320A8AF52598ffab33Df1865A23445A',
  mockUSDC: '0xE4272b80b135d20D3523735aFB86c0541b3cD9Ec',
  groth16Verifier: '0xf193788c8819BE7B805EFd0C7AcBda177D85Cb63'  // MockVerifier - always returns true
}

// Mock API endpoint
export const API_BASE_URL = 'http://localhost:3001'

// API Endpoints
export const API_ENDPOINTS = {
  // Data endpoints
  HONEST_DATA: '/api/user/honest',
  FRAUD_DATA: '/api/user/fraud',
  
  // Analysis endpoints
  BENFORD_ANALYZE: '/api/analyze/benford',
  QUICK_CHECK: '/api/analyze/quick-check',
  
  // Credit endpoints
  CREDIT_EVALUATE: '/api/credit/evaluate',
  CREDIT_QUICK_SCORE: '/api/credit/quick-score',
  CREDIT_DEMO: '/api/credit/demo',
  
  // Wallet endpoints
  WALLET_POSITION: '/api/wallet',
  WALLET_BORROW: '/api/wallet/borrow',
  WALLET_REPAY: '/api/wallet/repay',
  WALLET_UPDATE_CREDIT: '/api/wallet/update-credit',
  
  // ZK endpoints
  ZK_GENERATE_PROOF: '/api/zk/generate-proof',
  ZK_VERIFY_PROOF: '/api/zk/verify-proof'
}

// Sepolia chain config
export const SEPOLIA_CHAIN = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc2.sepolia.org'],
    },
    public: {
      http: ['https://rpc.sepolia.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
}

// Demo scenarios
export const SCENARIOS = {
  HONEST: {
    name: 'Honest Seller',
    description: 'Shop online với doanh thu tự nhiên, tuân theo Benford\'s Law',
    endpoint: '/api/user/honest',
    expectedResult: 'success',
    icon: '✅'
  },
  FRAUD: {
    name: 'Wash Trader',
    description: 'Tài khoản gian lận với dấu hiệu wash trading',
    endpoint: '/api/user/fraud',
    expectedResult: 'failed',
    icon: '⚠️'
  }
}

// Lending parameters
export const LENDING_PARAMS = {
  CREDIT_RATIO: 30, // 30% of revenue
  REVENUE_THRESHOLD: 1000, // $1k minimum
  FRAUD_THRESHOLD: 20, // 20 Benford score threshold (chi-square divergence)
  INTEREST_RATE: 12, // 12% APR
}
