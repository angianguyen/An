# StreamCredit Smart Contracts

Smart contracts cho lending protocol dựa trên dòng tiền thời gian thực.

## Contracts

### 1. StreamCredit.sol
Main lending protocol contract với các chức năng:
- ✅ Verify ZK proofs để cập nhật credit limit
- 💰 Borrow/Repay functions
- 💧 Liquidity management
- 📊 Credit limit tự động dựa trên doanh thu

### 2. MockUSDC.sol
Mock USDC token for testing trên Sepolia testnet.

### 3. MockVerifier.sol
Mock ZK verifier cho testing (sẽ thay bằng real Verifier.sol từ ZK circuit).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Cập nhật `.env` với:
- `SEPOLIA_RPC_URL`: Alchemy/Infura RPC URL
- `PRIVATE_KEY`: Private key của ví deploy
- `ETHERSCAN_API_KEY`: API key để verify contracts

### 3. Compile contracts
```bash
npm run compile
```

### 4. Run tests
```bash
npm test
```

## Deploy to Sepolia

```bash
npm run deploy:sepolia
```

Contract addresses sẽ được lưu trong `deployed-addresses.json`.

## Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Usage Flow

1. **Liquidity Provider** adds USDC to pool
2. **Borrower** connects API & generates ZK proof
3. **Borrower** calls `verifyAndUpdateCredit()` với proof
4. Contract verifies proof → cập nhật credit limit (30% revenue)
5. **Borrower** calls `borrow()` để rút tiền
6. **Borrower** calls `repay()` để trả nợ

## Security Features

- ✅ ReentrancyGuard trên các functions chính
- ✅ Credit limit validation
- ✅ ZK proof verification
- ✅ Ownable cho admin functions
- ✅ OpenZeppelin standard libraries

## Future Improvements

- [ ] Dynamic interest rates based on utilization
- [ ] Tranches (Junior/Senior)
- [ ] NFT-based loan positions
- [ ] Liquidation mechanism
- [ ] Revenue streaming integration
