# StreamCredit Deployment Guide

Complete guide for deploying and running the StreamCredit platform with new features: Reverse Interest Curve and Commitment Fees.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Frontend Setup](#frontend-setup)
4. [Testing the New Features](#testing-the-new-features)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v18+ and npm/yarn
- **MetaMask** browser extension
- **Git**

### Required Accounts

- MetaMask wallet with Sepolia ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Infura or Alchemy API key (for Sepolia RPC)

---

## Smart Contract Deployment

### 1. Install Contract Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Hardhat

Create or update `contracts/.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_metamask_private_key_here
```

⚠️ **Security Note**: Never commit `.env` files. Add to `.gitignore`.

### 3. Deploy MockUSDC (Test Token)

```bash
cd contracts
npx hardhat run scripts/deploy-mock.js --network sepolia
```

Expected output:
```
MockUSDC deployed to: 0x25117A7cd454E8C285553f0629696a28bAB3356c
MockVerifier deployed to: 0x1e1247d2458FDb5E82CA7e2dd7A30360E7c399BF
StreamCredit deployed to: 0xCF2a831E6D389974992F9b4fc20f9B45fDd95475
```

📝 **Save these addresses!** You'll need them for frontend configuration.

### 4. Verify Contract Deployment

Check on Sepolia Etherscan:
- Go to https://sepolia.etherscan.io/
- Search for your contract address
- Verify the contract has been deployed

### 5. Update Contract Addresses

Update `frontend/context/Web3Context.js` with your deployed addresses:

```javascript
const CONTRACTS = {
  streamCredit: '0xYOUR_STREAM_CREDIT_ADDRESS',
  mockUSDC: '0xYOUR_MOCK_USDC_ADDRESS',
  mockVerifier: '0xYOUR_MOCK_VERIFIER_ADDRESS'
};
```

---

## Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- Next.js 14
- **wagmi v2.0** (updated for compatibility)
- **@rainbow-me/rainbowkit v2.0**
- ethers v6
- Tailwind CSS
- Lucide React icons

### 2. Environment Configuration

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_STREAM_CREDIT_ADDRESS=0xYOUR_STREAM_CREDIT_ADDRESS
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0xYOUR_MOCK_USDC_ADDRESS
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Testing the New Features

### 🎯 Feature 1: Reverse Interest Curve

The contract now implements a reverse interest curve where shorter terms have **lower interest rates**:

| Term | Interest Rate (APR) |
|------|-------------------|
| 7-30 days | 5% |
| 31-90 days | 8% |
| 91-180 days | 15% |
| 181-365 days | 25% |

#### Testing Steps:

1. **Connect Wallet**
   - Click "Connect Wallet" in the navbar
   - Select your MetaMask account
   - Ensure you're on Sepolia testnet

2. **Get Credit Limit**
   - Navigate to "Launch App"
   - Select a scenario (Honest Merchant recommended)
   - Generate ZK Proof
   - Submit proof on-chain
   - Your credit limit will be set to 30% of revenue

3. **Borrow with Different Terms**
   - Click "Manage Loans" in navbar
   - View your credit limit in the dashboard
   - Select a loan term (7, 30, 60, 90, 120, 180, or 365 days)
   - See the interest rate update automatically
   - Enter amount and click "Borrow"

4. **View Interest Rate Tiers**
   - Green badges: 5% APR (best rate)
   - Yellow badges: 8% APR
   - Orange badges: 15% APR
   - Red badges: 25% APR (highest rate)

### 🎯 Feature 2: Commitment Fee (0.5% APR)

Even if you don't borrow, you pay a small maintenance fee on your credit limit.

#### Testing Steps:

1. **Get Credit Limit** (if not already)
   - Follow steps above to get credit limit

2. **View Commitment Fee**
   - Go to "Manage Loans"
   - See "Commitment Fee" card showing accrued fee
   - Fee accrues at 0.5% APR on your credit limit
   - Calculated per block/second

3. **Pay Commitment Fee**
   - Click "Pay Commitment Fee" button
   - Approve USDC transaction in MetaMask
   - Transaction will pay the accrued fee
   - Counter resets after payment

### 🎯 Feature 3: Early Repayment Bonus (2% Discount)

Pay back your loan before the term expires and save 2% on interest!

#### Testing Steps:

1. **Borrow with Long Term**
   - Borrow for 90 days with 8% APR
   - Note the total debt (principal + interest)

2. **Check Early Repayment Status**
   - In "Active Loan" section, see "Early Repayment" status
   - ✅ **2% Bonus!** if repaying before term expires
   - ✗ **No Bonus** if term already passed

3. **Repay Early**
   - Click "Repay Full Amount"
   - If eligible, you get 2% discount on interest
   - Success message will show: "2% early repayment bonus!"

---

## Frontend Architecture

### New Components

#### `components/LoanManager.js`
Complete loan management UI with:
- Credit limit and debt display
- Interest rate tier selection
- Commitment fee payment
- Early repayment bonus indicator
- Real-time interest calculations

### Updated Files

#### `context/Web3Context.js`
New functions:
- `borrow(amount, termDays)` - Borrow with specific term
- `repay()` - Repay full amount with interest
- `payCommitmentFee()` - Pay accrued commitment fee
- `getInterestRate(termDays)` - Get rate for term
- `getAccountInfo()` - Extended with new fields

#### `config/abi.js`
Updated ABI with new functions:
- `getInterestRate(uint256 termDays)`
- `calculateCommitmentFee(address account)`
- `calculateInterest(address account)`
- `isEarlyRepayment(address account)`
- `payCommitmentFee()`

---

## Smart Contract Architecture

### New Constants

```solidity
// Reverse Interest Curve Rates (basis points)
uint256 public constant SHORT_TERM_RATE = 500;      // 5%
uint256 public constant MEDIUM_TERM_RATE = 800;     // 8%
uint256 public constant LONG_TERM_RATE = 1500;      // 15%
uint256 public constant VERY_LONG_TERM_RATE = 2500; // 25%

// Commitment Fee (basis points)
uint256 public constant COMMITMENT_FEE_RATE = 50;   // 0.5%

// Early Repayment Bonus (basis points)
uint256 public constant EARLY_REPAY_BONUS = 200;    // 2%
```

### New Storage Variables

```solidity
mapping(address => uint256) public borrowTimestamp;
mapping(address => uint256) public borrowTerm;
mapping(address => uint256) public lastCommitmentFeePayment;
```

### Key Functions

1. **`getInterestRate(uint256 termDays)`** - Pure function to calculate rate
2. **`calculateCommitmentFee(address account)`** - View commitment fee
3. **`calculateInterest(address account)`** - View accrued interest
4. **`isEarlyRepayment(address account)`** - Check bonus eligibility
5. **`borrow(uint256 amount, uint256 termDays)`** - Borrow with term
6. **`repay()`** - Full repayment with interest and bonus
7. **`payCommitmentFee()`** - Pay commitment fee

---

## Troubleshooting

### Contract Issues

**Problem**: Transaction reverts with "Already have active loan"
- **Solution**: One loan at a time. Repay existing loan first.

**Problem**: Transaction reverts with "Invalid term"
- **Solution**: Term must be between 7 and 365 days.

**Problem**: Transaction reverts with "Transfer failed"
- **Solution**: 
  1. Check USDC balance
  2. Approve USDC spending: Call `approve()` on MockUSDC
  3. Or mint more test USDC

### Frontend Issues

**Problem**: "Contract not initialized"
- **Solution**: Connect MetaMask wallet first

**Problem**: "Wrong Network" warning
- **Solution**: Switch to Sepolia in MetaMask

**Problem**: Interest rate not updating
- **Solution**: Refresh page or change term value

**Problem**: Commitment fee showing as 0
- **Solution**: 
  1. Make sure you have credit limit
  2. Wait a few seconds for fee to accrue
  3. Fee is very small initially (0.5% APR)

### MetaMask Issues

**Problem**: Transaction stuck
- **Solution**: Increase gas price or cancel & resend

**Problem**: Insufficient funds
- **Solution**: Get Sepolia ETH from faucet

**Problem**: RPC Error
- **Solution**: Check Infura/Alchemy RPC URL in config

---

## API Endpoints (Mock API)

The mock API provides demo data for testing:

```
GET  /api/credit/demo/HONEST  - Honest merchant data
GET  /api/credit/demo/FRAUD   - Fraudulent merchant data
POST /api/zk/generate-proof   - Generate ZK proof
```

To start mock API (if needed):

```bash
cd mock-api
npm install
npm start
```

API runs on: http://localhost:3001

---

## Production Checklist

Before deploying to production:

- [ ] Replace MockVerifier with real Groth16Verifier
- [ ] Use real USDC contract (not MockUSDC)
- [ ] Set up proper API backend (not mock-api)
- [ ] Configure production RPC endpoints
- [ ] Set up monitoring and alerts
- [ ] Audit smart contracts
- [ ] Test with real ZK proofs
- [ ] Set up rate limiting on API
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set up analytics

---

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi v2 Migration Guide](https://wagmi.sh/react/guides/migrate-from-v1-to-v2)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review this guide carefully
3. Check browser console for errors
4. Verify MetaMask configuration
5. Create new GitHub issue with details

---

**Happy Building! 🚀**
