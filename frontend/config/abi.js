export const STREAM_CREDIT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_verifier", "type": "address"},
      {"internalType": "address", "name": "_usdcToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "term", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "interestRate", "type": "uint256"}
    ],
    "name": "Borrowed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "interest", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "earlyBonus", "type": "bool"}
    ],
    "name": "Repaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "CommitmentFeePaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "borrower", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "creditLimit", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CreditVerified",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256[2]", "name": "a", "type": "uint256[2]"},
      {"internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]"},
      {"internalType": "uint256[2]", "name": "c", "type": "uint256[2]"},
      {"internalType": "uint256[1]", "name": "input", "type": "uint256[1]"},
      {"internalType": "uint256", "name": "revenue", "type": "uint256"}
    ],
    "name": "verifyAndUpdateCredit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "termDays", "type": "uint256"}
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "repay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "repayFull",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payCommitmentFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "addLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getAccountInfo",
    "outputs": [
      {"internalType": "uint256", "name": "_creditLimit", "type": "uint256"},
      {"internalType": "uint256", "name": "_borrowed", "type": "uint256"},
      {"internalType": "uint256", "name": "_available", "type": "uint256"},
      {"internalType": "uint256", "name": "_interest", "type": "uint256"},
      {"internalType": "uint256", "name": "_commitmentFee", "type": "uint256"},
      {"internalType": "uint256", "name": "_term", "type": "uint256"},
      {"internalType": "uint256", "name": "_interestRate", "type": "uint256"},
      {"internalType": "bool", "name": "_isEarly", "type": "bool"},
      {"internalType": "uint256", "name": "_lastFullRepayment", "type": "uint256"},
      {"internalType": "bool", "name": "_canBorrow", "type": "bool"},
      {"internalType": "uint256", "name": "_creditLimitExpiration", "type": "uint256"},
      {"internalType": "uint256", "name": "_daysUntilExpiration", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "termDays", "type": "uint256"}],
    "name": "getInterestRate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "calculateCommitmentFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "calculateInterest",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "isEarlyRepayment",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {"internalType": "uint256", "name": "_creditLimit", "type": "uint256"},
      {"internalType": "uint256", "name": "_borrowed", "type": "uint256"},
      {"internalType": "uint256", "name": "_available", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "creditLimit",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "borrowed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export const MOCK_USDC_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
]
