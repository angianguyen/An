# 🚀 Quick Start Guide - New Features

## New Features Added

### 1. ⏱️ Reverse Interest Curve
**Kỳ hạn ngắn = Lãi suất thấp hơn** (khuyến khích trả nhanh)

| Kỳ hạn | Lãi suất APR |
|--------|-------------|
| 7-30 ngày | **5%** ⭐ Best Rate |
| 31-90 ngày | **8%** |
| 91-180 ngày | **15%** |
| 181-365 ngày | **25%** ⚠️ Highest |

### 2. 💰 Commitment Fee (Phí Duy Trì)
- **0.5% APR** trên credit limit
- Phải trả dù không vay
- Tính theo thời gian thực (streaming)
- Thanh khoản bị "lock" cho bạn

### 3. 🎁 Early Repayment Bonus
- Trả trước hạn → **Giảm 2% lãi suất**
- Khuyến khích trả nợ sớm
- Tự động áp dụng khi repay

---

## Running the Project

### 1️⃣ Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Contracts (if deploying)
cd contracts
npm install
```

### 2️⃣ Start Development

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

### 3️⃣ Connect Wallet
1. Click "Connect Wallet"
2. Switch to Sepolia testnet
3. Get test ETH from faucet if needed

---

## Testing Workflow

### Step 1: Get Credit Limit
1. Go to **"Launch App"**
2. Select **"Honest Merchant"** scenario
3. Click **"Fetch Data"**
4. Click **"Generate ZK Proof"**
5. Click **"Submit On-Chain"**
6. Approve transaction in MetaMask
7. ✅ Credit limit approved!

### Step 2: Borrow with Term Selection
1. Go to **"Manage Loans"**
2. See your credit limit displayed
3. **Choose loan term** (click on badge):
   - 7 days → 5% APR
   - 30 days → 5% APR
   - 90 days → 8% APR
   - 180 days → 15% APR
4. Enter amount
5. Click **"Borrow"**
6. Approve transaction

### Step 3: Monitor Your Loan
View in **"Active Loan"** section:
- Loan term (days)
- Interest rate
- Early repayment status (✓ bonus or ✗ no bonus)
- Total debt = principal + interest

### Step 4: Repay (with Bonus!)
1. Check if **"Early Repayment: ✓ 2% Bonus!"**
2. Click **"Repay Full Amount"**
3. Approve USDC transaction
4. If early → Save 2% on interest! 🎉

### Step 5: Pay Commitment Fee
1. See commitment fee in orange card
2. Fee accrues even if not borrowing
3. Click **"Pay Commitment Fee"**
4. Approve transaction

---

## UI Components Guide

### Dashboard Cards

**Blue Card** - Credit Limit
- Total approved credit
- Based on 30% of revenue

**Purple Card** - Total Debt
- Principal + Interest
- Shows breakdown

**Green Card** - Available Credit
- How much you can still borrow
- = Credit Limit - Borrowed

**Orange Card** - Commitment Fee
- Accrued maintenance fee
- 0.5% APR on credit limit

### Interest Rate Selector

Color coding:
- 🟢 **Green** - 5% (best rate, short term)
- 🟡 **Yellow** - 8% (medium term)
- 🟠 **Orange** - 15% (long term)
- 🔴 **Red** - 25% (very long term)

### Active Loan Display

Shows:
- 📅 Loan term in days
- 💵 Current interest rate
- 🎁 Early repayment bonus status

---

## Smart Contract Functions

### Read Functions (View)
```solidity
// Get interest rate for term
getInterestRate(uint256 termDays) → uint256

// Calculate commitment fee
calculateCommitmentFee(address account) → uint256

// Calculate current interest
calculateInterest(address account) → uint256

// Check early repayment eligibility
isEarlyRepayment(address account) → bool

// Get complete account info
getAccountInfo(address account) → (
  creditLimit,
  borrowed,
  available,
  interest,
  commitmentFee,
  term,
  interestRate,
  isEarly
)
```

### Write Functions

```solidity
// Borrow with specific term
borrow(uint256 amount, uint256 termDays)

// Repay full amount (principal + interest - bonus)
repay()

// Pay commitment fee
payCommitmentFee()
```

---

## Common Issues & Solutions

### ❌ "Already have active loan"
**Solution**: Repay existing loan first. Only 1 loan at a time.

### ❌ "Invalid term"
**Solution**: Term must be 7-365 days.

### ❌ "Transfer failed"
**Solution**: 
1. Check USDC balance
2. Approve USDC spending first
3. Make sure you have enough USDC

### ⚠️ "Wrong Network"
**Solution**: Switch to Sepolia in MetaMask

### ⚠️ Interest rate not updating
**Solution**: Change term value or refresh page

---

## Frontend Code Examples

### Borrowing with Term
```javascript
import { useWeb3 } from '../context/Web3Context';

const { borrow } = useWeb3();

// Borrow 1000 USDC for 30 days at 5% APR
await borrow(1000, 30);
```

### Checking Interest Rate
```javascript
const { getInterestRate } = useWeb3();

// Get rate for 90 days
const rate = await getInterestRate(90); // Returns 8
console.log(`Interest rate: ${rate}% APR`);
```

### Repaying with Bonus
```javascript
const { repay, getAccountInfo } = useWeb3();

const info = await getAccountInfo();
console.log('Early bonus?', info.isEarlyRepayment); // true/false

// Repay full amount (automatically applies bonus)
await repay();
```

### Paying Commitment Fee
```javascript
const { payCommitmentFee, getAccountInfo } = useWeb3();

const info = await getAccountInfo();
console.log('Fee to pay:', info.commitmentFee);

await payCommitmentFee();
```

---

## Package Versions

Updated to latest compatible versions:

```json
{
  "@rainbow-me/rainbowkit": "^2.0.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "ethers": "^6.9.0",
  "next": "^14.0.4",
  "react": "^18.2.0"
}
```

---

## File Structure

```
frontend/
├── app/
│   ├── demo.jsx           # Main app with views
│   ├── page.js            # Home page
│   ├── layout.js          # Root layout
│   └── providers.js       # Context providers
├── components/
│   ├── LoanManager.js     # 🆕 New loan management UI
│   ├── BenfordChart.js    # Chart component
│   └── ZKScripts.js       # ZK utilities
├── context/
│   └── Web3Context.js     # 🔄 Updated with new functions
├── config/
│   ├── abi.js             # 🔄 Updated ABI
│   └── constants.js       # Constants
└── utils/
    ├── api.js
    └── zkProver.js
```

---

## Next Steps

1. ✅ Deploy contracts to Sepolia
2. ✅ Update contract addresses in frontend
3. ✅ Install dependencies
4. ✅ Start dev server
5. ✅ Connect wallet
6. ✅ Test borrowing with different terms
7. ✅ Test early repayment bonus
8. ✅ Test commitment fee payment

---

## Resources

📖 Full Guide: See `DEPLOYMENT_NEW_FEATURES.md`

🔗 Useful Links:
- Sepolia Faucet: https://sepoliafaucet.com/
- Sepolia Explorer: https://sepolia.etherscan.io/
- MetaMask: https://metamask.io/

---

**Happy Testing! 🎉**
