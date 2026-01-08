# 🔄 Migration Guide - Upgrading to New Features

Guide for upgrading existing StreamCredit deployments to include Reverse Interest Curve and Commitment Fees.

---

## 🎯 What Changed

### Breaking Changes

⚠️ **Important**: The following changes are **breaking** and require contract redeployment:

1. **`borrow()` function signature changed**
   - Old: `borrow(uint256 amount)`
   - New: `borrow(uint256 amount, uint256 termDays)`

2. **`repay()` function signature changed**
   - Old: `repay(uint256 amount)`
   - New: `repay()` (no parameters, full repayment)

3. **`getAccountInfo()` return values changed**
   - Old: Returns 3 values (creditLimit, borrowed, available)
   - New: Returns 8 values (adds interest, commitmentFee, term, rate, isEarly)

4. **Removed `interestRate` state variable**
   - Now uses dynamic rates based on term
   - `updateInterestRate()` function deprecated

### Non-Breaking Changes

✅ These are additions (no impact on existing functionality):
- New view functions (getInterestRate, calculateInterest, etc.)
- New payCommitmentFee() function
- New events (CommitmentFeePaid)
- New storage mappings

---

## 📋 Migration Steps

### Option A: Fresh Deployment (Recommended)

Best for testing or new deployments.

#### 1. Backup Current State
```bash
# Save current contract addresses
echo "Old StreamCredit: 0x..." > migration-backup.txt
echo "Old USDC: 0x..." >> migration-backup.txt

# Export current state (if needed)
# Use Hardhat scripts to read on-chain data
```

#### 2. Deploy New Contracts
```bash
cd contracts
npm install
npx hardhat run scripts/deploy-mock.js --network sepolia
```

#### 3. Update Frontend
```bash
cd frontend
npm install  # Installs wagmi v2

# Update contract addresses in Web3Context.js
# Replace CONTRACTS object with new addresses
```

#### 4. Test New Features
```bash
cd frontend
npm run dev

# Connect wallet
# Get new credit limit
# Test borrowing with terms
# Test commitment fees
```

---

### Option B: Staged Migration

For production with existing users.

#### Phase 1: Deploy New Contract (Parallel)
1. Deploy new StreamCredit contract
2. Keep old contract running
3. Test new contract on testnet

#### Phase 2: Notify Users
```
⚠️ NOTICE: Upgrade Required

StreamCredit is upgrading to v2 with new features:
- Dynamic interest rates (5-25% APR)
- Commitment fees (0.5% APR)
- Early repayment bonuses (2% off)

Action Required:
1. Repay all outstanding loans on old contract
2. Switch to new contract address
3. Re-submit ZK proof for credit limit

Deadline: [DATE]
```

#### Phase 3: Frontend Update
```javascript
// frontend/context/Web3Context.js

const CONTRACTS = {
  // Old contract (deprecated)
  streamCreditV1: '0xOLD_ADDRESS',
  
  // New contract (active)
  streamCredit: '0xNEW_ADDRESS',
  mockUSDC: '0xSAME_USDC_ADDRESS',
  mockVerifier: '0xSAME_VERIFIER_ADDRESS'
};

// Show migration banner
const [showMigrationBanner, setShowMigrationBanner] = useState(true);
```

#### Phase 4: Data Migration Script
```javascript
// scripts/migrate-users.js

async function migrateUser(userAddress) {
  // Read old contract state
  const oldInfo = await oldContract.getAccountInfo(userAddress);
  
  // Check if user has active loan
  if (oldInfo.borrowed > 0) {
    console.log(`User ${userAddress} has active loan: ${oldInfo.borrowed}`);
    // Cannot migrate - user must repay first
    return false;
  }
  
  // User can migrate (no active loan)
  console.log(`User ${userAddress} can migrate safely`);
  return true;
}
```

---

## 🔧 Code Changes Required

### Smart Contract

**Old Code:**
```solidity
// Old interest rate
uint256 public interestRate = 1200; // 12%

function borrow(uint256 amount) external nonReentrant {
  borrowed[msg.sender] += amount;
  // ...
}

function repay(uint256 amount) external nonReentrant {
  borrowed[msg.sender] -= amount;
  // ...
}
```

**New Code:**
```solidity
// New dynamic rates
uint256 public constant SHORT_TERM_RATE = 500;  // 5%
uint256 public constant MEDIUM_TERM_RATE = 800; // 8%

function borrow(uint256 amount, uint256 termDays) external nonReentrant {
  borrowTimestamp[msg.sender] = block.timestamp;
  borrowTerm[msg.sender] = termDays;
  // ...
}

function repay() external nonReentrant {
  uint256 interest = calculateInterest(msg.sender);
  // Auto-calculate total repayment
  // ...
}
```

### Frontend - Web3Context

**Old Code:**
```javascript
const borrow = async (amount) => {
  const tx = await contract.borrow(
    ethers.parseUnits(amount, 6)
  );
  await tx.wait();
};

const repay = async (amount) => {
  const tx = await contract.repay(
    ethers.parseUnits(amount, 6)
  );
  await tx.wait();
};
```

**New Code:**
```javascript
const borrow = async (amount, termDays) => {
  const tx = await contract.borrow(
    ethers.parseUnits(amount, 6),
    termDays  // NEW parameter
  );
  await tx.wait();
};

const repay = async () => {
  // No amount parameter - full repayment
  // Auto-approve USDC first
  const info = await getAccountInfo();
  const total = parseFloat(info.borrowed) + parseFloat(info.interest);
  
  await usdcContract.approve(
    CONTRACTS.streamCredit,
    ethers.parseUnits(total.toString(), 6)
  );
  
  const tx = await contract.repay();
  await tx.wait();
};
```

### Frontend - UI Components

**Old Code:**
```jsx
<button onClick={() => borrow(1000)}>
  Borrow 1000 USDC
</button>
```

**New Code:**
```jsx
const [amount, setAmount] = useState('');
const [term, setTerm] = useState(30);

<input 
  value={amount} 
  onChange={(e) => setAmount(e.target.value)} 
/>
<select value={term} onChange={(e) => setTerm(e.target.value)}>
  <option value={7}>7 days - 5% APR</option>
  <option value={30}>30 days - 5% APR</option>
  <option value={90}>90 days - 8% APR</option>
</select>
<button onClick={() => borrow(amount, term)}>
  Borrow
</button>
```

---

## 📦 Package Updates

### Required Updates

```bash
# Update package.json
cd frontend

# Remove old versions
npm uninstall wagmi @rainbow-me/rainbowkit viem

# Install new versions
npm install wagmi@^2.0.0 @rainbow-me/rainbowkit@^2.0.0 viem@^2.0.0

# Verify
npm list wagmi viem
```

### wagmi v1 → v2 Migration

**Breaking Changes:**
- Provider setup changed
- Hook APIs updated
- Chain configuration modified

**Migration:**
```javascript
// OLD (wagmi v1)
import { WagmiConfig, createClient } from 'wagmi';

const client = createClient({
  autoConnect: true,
  connectors: [...],
});

<WagmiConfig client={client}>
  {children}
</WagmiConfig>

// NEW (wagmi v2)
import { WagmiProvider, createConfig } from 'wagmi';

const config = createConfig({
  chains: [sepolia],
  connectors: [...],
});

<WagmiProvider config={config}>
  {children}
</WagmiProvider>
```

---

## ✅ Testing Checklist

Before going live:

### Smart Contract Tests
- [ ] Deploy to testnet
- [ ] Verify contract on Etherscan
- [ ] Test borrow with different terms
- [ ] Test repay with interest calculation
- [ ] Test early repayment bonus
- [ ] Test commitment fee accrual
- [ ] Test commitment fee payment
- [ ] Test getAccountInfo with new fields
- [ ] Test edge cases (0 amount, invalid term, etc.)

### Frontend Tests
- [ ] Install dependencies successfully
- [ ] Start dev server without errors
- [ ] Connect MetaMask wallet
- [ ] Get credit limit (ZK proof submission)
- [ ] View account info correctly
- [ ] Borrow with term selection
- [ ] View loan details
- [ ] Calculate interest correctly
- [ ] Repay with bonus detection
- [ ] Pay commitment fee
- [ ] Handle errors gracefully

### Integration Tests
- [ ] Contract addresses updated
- [ ] ABI matches deployed contract
- [ ] Events emitted correctly
- [ ] Transaction confirmations work
- [ ] Error messages clear

---

## 🐛 Common Migration Issues

### Issue 1: ABI Mismatch
**Error:** `Contract function doesn't exist`
**Fix:** Regenerate ABI from new contract
```bash
cd contracts
npx hardhat compile
# Copy ABI from artifacts to frontend/config/abi.js
```

### Issue 2: Function Signature Error
**Error:** `wrong number of arguments`
**Fix:** Update function calls
```javascript
// Old
await borrow(1000);

// New
await borrow(1000, 30);  // Add term parameter
```

### Issue 3: wagmi Import Errors
**Error:** `Module not found: Can't resolve 'wagmi'`
**Fix:** Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Transaction Reverts
**Error:** `execution reverted: Already have active loan`
**Fix:** One loan at a time - repay first
```javascript
// Check before borrowing
const info = await getAccountInfo();
if (info.borrowed > 0) {
  alert('Repay existing loan first');
  return;
}
```

---

## 📊 Rollback Plan

If issues occur:

### Immediate Rollback
```javascript
// frontend/context/Web3Context.js

// Switch back to old contract
const CONTRACTS = {
  streamCredit: '0xOLD_CONTRACT_ADDRESS',
  // ...
};

// Revert to old function signatures
const borrow = async (amount) => {
  // Old implementation
};
```

### Gradual Rollback
1. Keep both contracts deployed
2. Add toggle in UI for contract version
3. Let users choose
4. Monitor usage
5. Deprecate old when safe

---

## 📈 Migration Timeline

Recommended schedule:

### Week 1: Preparation
- Deploy new contract to testnet
- Update frontend code
- Internal testing

### Week 2: Beta Testing
- Deploy to mainnet (parallel)
- Invite beta testers
- Monitor for issues

### Week 3: User Migration
- Announce migration
- Send notifications
- Provide support

### Week 4: Full Cutover
- Deprecate old contract
- Update all documentation
- Monitor closely

---

## 🆘 Support During Migration

Create migration support resources:
- Migration FAQ document
- Video tutorial
- Live support chat
- Community Discord/Telegram

---

## 📚 Additional Resources

- [wagmi v2 Migration Guide](https://wagmi.sh/react/guides/migrate-from-v1-to-v2)
- [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins/)
- [Hardhat Deployment Best Practices](https://hardhat.org/tutorial/deploying-to-a-live-network)

---

**Need help? Check DEPLOYMENT_NEW_FEATURES.md for full setup guide.**
