# StreamCredit Frontend

Frontend application cho StreamCredit lending protocol demo.

## Tech Stack

- **Next.js 14**: React framework
- **Wagmi**: React Hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Ethers.js**: Ethereum library
- **Tailwind CSS**: Styling
- **Axios**: API calls

## Features

### 🎭 Demo Scenarios
1. **Honest Seller**: Dữ liệu tuân theo Benford's Law → Được duyệt vay
2. **Wash Trader**: Dữ liệu gian lận → Bị từ chối

### 🔐 Smart Contract Integration
- Kết nối ví với RainbowKit
- Đọc thông tin credit limit từ contract
- Verify ZK proofs và cập nhật credit
- Borrow/Repay functions

### 📊 Real-time Analysis
- Fetch data từ Mock API
- Tính toán Benford Score
- Hiển thị fraud detection results

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Update contract addresses

Sau khi deploy contracts lên Sepolia, cập nhật addresses trong [config/constants.js](config/constants.js):

```javascript
export const CONTRACTS = {
  streamCredit: '0xYourStreamCreditAddress',
  mockUSDC: '0xYourMockUSDCAddress',
  mockVerifier: '0xYourMockVerifierAddress',
}
```

### 3. Configure WalletConnect (Optional)

Lấy Project ID từ [walletconnect.com](https://walletconnect.com) và cập nhật trong [app/layout.js](app/layout.js#L18).

### 4. Start Mock API

Trong terminal khác, start Mock API server:

```bash
cd ../mock-api
npm install
npm start
```

### 5. Run development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" ở header
2. **Chọn Scenario**: Chọn "Honest Seller" hoặc "Wash Trader"
3. **Xem Analysis**: Kiểm tra Benford Score và doanh thu
4. **Verify Credit**: Click để xác thực và nhận credit limit
5. **Borrow**: Vay tiền nếu đủ điều kiện

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Tạo file `.env.local`:

```
NEXT_PUBLIC_MOCK_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Demo Screenshots

### 1. Honest Seller Flow
- Revenue: $50,000
- Benford Score: 8% ✅
- Credit Limit: $15,000
- Result: **Approved** ✅

### 2. Fraud Detection
- Revenue: $100,000
- Benford Score: 45% ⚠️
- Result: **Rejected - Wash Trading Detected** ❌

## Troubleshooting

### Wallet connection issues
- Đảm bảo đang ở Sepolia network
- Reset wallet connection trong browser

### Contract calls failing
- Kiểm tra contract addresses đã update đúng
- Đảm bảo có Sepolia ETH (faucet: [sepoliafaucet.com](https://sepoliafaucet.com))

### Mock API không connect được
- Kiểm tra Mock API server đang chạy
- Kiểm tra CORS settings
