# StreamCredit - ZK-Powered DeFi Lending Platform

> Giải pháp cho vay phi tập trung kết hợp **Zero-Knowledge Proofs** và **Benford's Law** để xác thực dòng tiền doanh nghiệp.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Solidity](https://img.shields.io/badge/solidity-0.8.19-orange)

---

## 🚀 Quick Start (5 phút setup)

### 1️⃣ Yêu cầu hệ thống

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** hoặc **yarn**
- **MetaMask** browser extension
- **Git** (để clone repo)

### 2️⃣ Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd stream-credit

# Install dependencies cho Frontend
cd frontend
npm install

# Install dependencies cho Mock API
cd ../mock-api
npm install

# (Optional) Install dependencies cho Smart Contracts
cd ../contracts
npm install
```

### 3️⃣ Chạy Mock API

```bash
cd mock-api
npm start
```

Server chạy tại `http://localhost:3001`

### 4️⃣ Deploy Smart Contracts lên Sepolia

```bash
cd contracts

# Copy và cấu hình environment
cp .env.example .env
# Cập nhật SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY

# Compile contracts
npm run compile

# Deploy
npm run deploy:sepolia
```

**Lưu ý**: Contract addresses sẽ được lưu trong `deployed-addresses.json`

### 5️⃣ Cấu hình Frontend

Cập nhật contract addresses trong `frontend/config/constants.js`:

```javascript
export const CONTRACTS = {
  streamCredit: '0xYourDeployedAddress',
  mockUSDC: '0xYourMockUSDCAddress',
  mockVerifier: '0xYourVerifierAddress',
}
```

### 6️⃣ Chạy Frontend

```bash
cd frontend
npm run dev
```

Mở `http://localhost:3000`

## 🎮 Demo Flow

### Scenario 1: Honest Seller ✅

1. Chọn **"Honest Seller"** scenario
2. Hệ thống fetch 100 đơn hàng tuân theo Benford's Law
3. Benford Score: **~8%** (thấp = tốt)
4. Doanh thu: **$50,000**
5. Click **"Xác thực & Cập nhật Credit Limit"**
6. Contract cấp credit limit: **$15,000** (30% doanh thu)
7. Click **"Vay $5,000"** hoặc **"Vay $10,000"**
8. ✅ **Thành công!**

### Scenario 2: Wash Trader ❌

1. Chọn **"Wash Trader"** scenario
2. Hệ thống fetch 100 đơn hàng có số tròn/lặp lại
3. Benford Score: **~45%** (cao = nghi ngờ)
4. Doanh thu: **$100,000** (nhưng không thực tế)
5. Click **"Xác thực"**
6. ⚠️ **Cảnh báo: "Phát hiện gian lận Wash Trading!"**
7. ❌ **Từ chối cho vay**

## 🔧 Chi tiết kỹ thuật

### Mock API

- **Framework**: Express.js
- **Chức năng**: Giả lập API từ Shopee/TikTok Shop
- **Endpoints**:
  - `/api/user/honest` - Dữ liệu sạch
  - `/api/user/fraud` - Dữ liệu wash trading
- **Benford's Law**: Phát hiện số liệu bị bịa đặt

### ZK Circuit

- **Language**: Circom
- **Library**: SnarkJS (Groth16)
- **Private Inputs**: revenue, benfordScore
- **Public Inputs**: revenueThreshold, fraudThreshold
- **Output**: isValid (1 = pass, 0 = fail)

**Note**: Trong demo này sử dụng MockVerifier, để production cần:

```bash
cd zk-circuit
npm run compile
npm run setup
npm run export-verifier  # Tạo Verifier.sol
```

### Smart Contracts

**StreamCredit.sol**:
- `verifyAndUpdateCredit()`: Verify ZK proof, cập nhật credit limit
- `borrow()`: Vay tiền trong hạn mức
- `repay()`: Trả nợ
- `addLiquidity()`: Thêm thanh khoản (cho LP)

**MockUSDC.sol**:
- ERC20 token với 6 decimals
- `faucet()`: Lấy test USDC

### Frontend

- **Framework**: Next.js 14
- **Web3**: Wagmi + RainbowKit
- **UI**: Tailwind CSS
- **Features**:
  - Wallet connection
  - Real-time data fetching
  - Benford Score calculation
  - Contract interaction
  - Transaction tracking

## 📊 Tính năng nổi bật

### 1. Benford's Law Fraud Detection

```javascript
// Phân phối chữ số đầu tiên tự nhiên
[1: 30.1%, 2: 17.6%, 3: 12.5%, ..., 9: 4.6%]

// Dữ liệu gian lận thường vi phạm quy luật này
// Ví dụ: Nhiều số 1000, 5000, 10000 (wash trading)
```

### 2. Zero-Knowledge Proofs

```
Borrower chứng minh: "Doanh thu > $10k VÀ Benford Score < 15%"
KHÔNG tiết lộ: Danh sách khách hàng, chi tiết đơn hàng
```

### 3. Dynamic Credit Limit

```
Credit Limit = Revenue × 30%
Ví dụ: $50,000 revenue → $15,000 credit limit
```

## 🧪 Testing

### Test Smart Contracts

```bash
cd contracts
npm test
```

### Test ZK Circuit (sau khi compile)

```bash
cd zk-circuit
npm run generate-proof
npm run verify-proof
```

## 🌐 Deployment

### Sepolia Testnet

1. Get Sepolia ETH: [sepoliafaucet.com](https://sepoliafaucet.com)
2. Deploy contracts: `npm run deploy:sepolia`
3. Verify on Etherscan: `npm run verify:sepolia`
4. Update frontend config
5. Deploy frontend: Vercel/Netlify

### Mainnet (Production)

⚠️ **Cần thực hiện trước:**
- [ ] Audit smart contracts
- [ ] Setup real ZK verifier (không dùng mock)
- [ ] Integrate real APIs (Shopee, TikTok Shop)
- [ ] Implement liquidation mechanism
- [ ] Setup Oracle (Chainlink)
- [ ] Legal compliance check

## 📚 Tài liệu tham khảo

- **Benford's Law**: [Wikipedia](https://en.wikipedia.org/wiki/Benford%27s_law)
- **Circom**: [circom.io](https://docs.circom.io/)
- **Hardhat**: [hardhat.org](https://hardhat.org/)
- **Wagmi**: [wagmi.sh](https://wagmi.sh/)

## 🎯 Roadmap

### Phase 1: MVP (Current) ✅
- [x] Mock API with Benford's Law
- [x] Basic ZK circuit
- [x] Smart contracts on Sepolia
- [x] Frontend demo

### Phase 2: Enhanced Fraud Detection
- [ ] Graph Network Analysis
- [ ] Machine Learning scoring
- [ ] Multi-source data validation

### Phase 3: Advanced Features
- [ ] Revenue Streaming (Superfluid)
- [ ] Tranches (Junior/Senior)
- [ ] NFT loan positions
- [ ] Secondary market

### Phase 4: Production
- [ ] Real API integrations (OAuth)
- [ ] Mainnet deployment
- [ ] Institutional liquidity
- [ ] Credit-Scoring-as-a-Service

## 🤝 Contributing

Dự án này được phát triển cho cuộc thi. Mọi đóng góp và feedback đều được hoan nghênh!

## 📄 License

MIT License

## 🙏 Acknowledgments

- **Goldfinch**: Inspiration for RWA lending
- **Benford's Law**: Fraud detection methodology
- **Circom Team**: ZK toolkit
- **Ethereum Foundation**: Sepolia testnet

---

**Built with ❤️ for FESE Hackathon**

Demo: [Your Demo URL]  
Presentation: [Your Slides URL]  
Contact: [Your Email]
