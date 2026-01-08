# StreamCredit Deployment Guide

Hướng dẫn chi tiết để deploy StreamCredit lên Sepolia testnet.

## 📋 Checklist trước khi deploy

- [ ] Node.js 18+ đã cài đặt
- [ ] Git đã cài đặt
- [ ] MetaMask wallet đã setup
- [ ] Có Sepolia ETH (ít nhất 0.1 ETH)
- [ ] Alchemy/Infura API key
- [ ] Etherscan API key

## 🔑 Bước 1: Lấy API Keys

### 1.1. Alchemy RPC URL

1. Truy cập [alchemy.com](https://www.alchemy.com/)
2. Tạo tài khoản (miễn phí)
3. Tạo new app:
   - Chain: Ethereum
   - Network: Sepolia
4. Copy HTTP URL (dạng: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)

### 1.2. Etherscan API Key

1. Truy cập [etherscan.io](https://etherscan.io/)
2. Đăng ký tài khoản
3. Vào API Keys → Add
4. Copy API key

### 1.3. Private Key từ MetaMask

⚠️ **QUAN TRỌNG**: KHÔNG BAO GIỜ chia sẻ private key!

1. Mở MetaMask
2. Click 3 dots → Account details
3. Export Private Key
4. Nhập password → Copy private key

### 1.4. Lấy Sepolia ETH

Từ các faucets (chọn 1):
- [sepoliafaucet.com](https://sepoliafaucet.com)
- [infura.io/faucet](https://www.infura.io/faucet/sepolia)
- [alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)

## 🚀 Bước 2: Deploy Smart Contracts

### 2.1. Setup environment

```bash
cd contracts
cp .env.example .env
```

Mở `.env` và cập nhật:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2.2. Install dependencies

```bash
npm install
```

### 2.3. Compile contracts

```bash
npm run compile
```

Kết quả:
```
✔ Compiled 5 Solidity files successfully
```

### 2.4. Run tests (optional but recommended)

```bash
npm test
```

Tất cả tests phải pass:
```
✔ Should verify proof and update credit limit
✔ Should allow borrowing within credit limit
✔ Should allow repayment
...
```

### 2.5. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

Quá trình deploy (~2-3 phút):

```
🚀 Deploying StreamCredit Protocol to Sepolia...

📍 Deploying with account: 0xYourAddress
💰 Account balance: 0.5 ETH

1️⃣ Deploying MockUSDC...
✅ MockUSDC deployed to: 0xAbcd1234...

2️⃣ Deploying MockVerifier...
✅ MockVerifier deployed to: 0xEfgh5678...

3️⃣ Deploying StreamCredit...
✅ StreamCredit deployed to: 0xIjkl9012...

4️⃣ Adding initial liquidity...
   Approved USDC...
   Added 100,000 USDC to liquidity pool

====================================================================
📋 DEPLOYMENT SUMMARY
====================================================================
MockUSDC:       0xAbcd1234...
MockVerifier:   0xEfgh5678...
StreamCredit:   0xIjkl9012...
====================================================================

✅ Addresses saved to deployed-addresses.json
```

### 2.6. Verify contracts on Etherscan

```bash
# Verify MockUSDC
npx hardhat verify --network sepolia 0xAbcd1234...

# Verify MockVerifier
npx hardhat verify --network sepolia 0xEfgh5678...

# Verify StreamCredit (với constructor args)
npx hardhat verify --network sepolia 0xIjkl9012... 0xEfgh5678... 0xAbcd1234...
```

Nếu thành công:
```
✔ Successfully verified contract on Etherscan
https://sepolia.etherscan.io/address/0x...#code
```

## 🌐 Bước 3: Deploy Mock API

### 3.1. Install dependencies

```bash
cd ../mock-api
npm install
```

### 3.2. Test locally

```bash
npm start
```

Server chạy tại `http://localhost:3001`

Test endpoints:
```bash
curl http://localhost:3001/api/user/honest
curl http://localhost:3001/api/user/fraud
```

### 3.3. Deploy lên cloud (Optional)

#### Option A: Railway

1. Truy cập [railway.app](https://railway.app/)
2. New Project → Deploy from GitHub
3. Chọn repo `stream-credit/mock-api`
4. Railway tự động detect Node.js và deploy

#### Option B: Render

1. Truy cập [render.com](https://render.com/)
2. New Web Service
3. Connect GitHub repo
4. Root Directory: `mock-api`
5. Build Command: `npm install`
6. Start Command: `npm start`

Lưu URL public (ví dụ: `https://your-api.railway.app`)

## 💻 Bước 4: Deploy Frontend

### 4.1. Update contract addresses

Mở `frontend/config/constants.js`:

```javascript
export const CONTRACTS = {
  streamCredit: '0xIjkl9012...', // Từ deployed-addresses.json
  mockUSDC: '0xAbcd1234...',
  mockVerifier: '0xEfgh5678...',
}
```

Nếu deploy API lên cloud, cập nhật:

```javascript
export const API_BASE_URL = 'https://your-api.railway.app'
```

### 4.2. Update WalletConnect Project ID (Optional)

1. Truy cập [walletconnect.com](https://walletconnect.com/)
2. Create new project
3. Copy Project ID
4. Update trong `frontend/app/layout.js`:

```javascript
const { connectors } = getDefaultWallets({
  appName: 'StreamCredit',
  projectId: 'YOUR_PROJECT_ID_HERE',
  chains
})
```

### 4.3. Test locally

```bash
cd ../frontend
npm install
npm run dev
```

Mở `http://localhost:3000` và test:

1. Connect wallet (MetaMask)
2. Switch to Sepolia network
3. Chọn "Honest Seller" scenario
4. Verify credit
5. Borrow

### 4.4. Deploy lên Vercel

```bash
npm run build
```

Nếu build thành công:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Hoặc deploy qua UI:

1. Push code lên GitHub
2. Truy cập [vercel.com](https://vercel.com/)
3. Import project từ GitHub
4. Root Directory: `frontend`
5. Framework Preset: Next.js
6. Deploy

## ✅ Bước 5: Kiểm tra toàn bộ hệ thống

### 5.1. Checklist

- [ ] Smart contracts đã verify trên Etherscan
- [ ] Mock API đang chạy (local hoặc cloud)
- [ ] Frontend đã deploy và accessible
- [ ] Wallet connect thành công
- [ ] Honest Seller scenario pass
- [ ] Fraud detection hoạt động (Wash Trader bị reject)

### 5.2. Test E2E Flow

1. **Faucet USDC**:
   - Truy cập Etherscan → MockUSDC contract
   - Connect wallet
   - Call `faucet(10000000000)` (10k USDC với 6 decimals)

2. **Approve USDC** (nếu muốn repay sau):
   - Call `approve(streamCreditAddress, 10000000000)`

3. **Test Honest Seller**:
   - Chọn scenario → Verify → Borrow

4. **Test Fraud Detection**:
   - Chọn Wash Trader → Verify
   - Phải thấy cảnh báo "Phát hiện gian lận"

## 🐛 Troubleshooting

### Contract deployment fails

**Error**: `insufficient funds`
- **Fix**: Lấy thêm Sepolia ETH từ faucet

**Error**: `nonce too high`
- **Fix**: Reset MetaMask (Settings → Advanced → Reset Account)

### Frontend không connect được contract

**Error**: `Contract not found`
- **Fix**: Kiểm tra contract addresses trong `constants.js`
- **Fix**: Đảm bảo đang ở Sepolia network

### Mock API CORS error

**Error**: `CORS policy blocked`
- **Fix**: Thêm CORS config trong `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app']
}))
```

### Transaction fails

**Error**: `execution reverted: No credit limit`
- **Fix**: Chạy `verifyAndUpdateCredit` trước khi borrow

**Error**: `execution reverted: Exceeds credit limit`
- **Fix**: Số tiền vay vượt quá hạn mức khả dụng

## 📊 Monitoring

### Etherscan

- Theo dõi transactions: `https://sepolia.etherscan.io/address/YOUR_CONTRACT`
- Xem events: CreditVerified, Borrowed, Repaid

### Contract Balances

```javascript
// Check trong Etherscan hoặc gọi functions:
totalLiquidity()  // Tổng thanh khoản trong pool
creditLimit(address)  // Hạn mức của user
borrowed(address)  // Số tiền đã vay
```

## 🎉 Hoàn thành!

Bây giờ bạn có:

✅ Smart contracts verified trên Sepolia  
✅ Mock API hoạt động  
✅ Frontend live với đầy đủ chức năng  
✅ Demo hoàn chỉnh cho cuộc thi

**Next steps**:
1. Chuẩn bị pitch deck
2. Record demo video
3. Viết technical documentation
4. Submit dự án

Good luck! 🚀
