# StreamCredit - Hướng Dẫn Sử Dụng

## 📖 Giới Thiệu

**StreamCredit** là nền tảng cho vay phi tập trung (DeFi Lending Protocol) với các tính năng:
- ✅ **KYC bằng CCCD** - Xác thực căn cước công dân Việt Nam
- 🔒 **Collateral NFT** - Token hóa tài sản đảm bảo
- 💰 **Lãi suất ưu đãi** - Giảm lãi khi có tài sản thế chấp
- 🔐 **ZK Fraud Detection** - Phát hiện gian lận bằng Zero-Knowledge Proof
- ⏰ **Reverse Interest Curve** - Vay ngắn hạn = lãi thấp

---

## 🚀 Khởi Động Nhanh

### Yêu Cầu Hệ Thống
- **Node.js** 18+
- **npm** hoặc yarn
- **MetaMask** wallet (mạng Sepolia testnet)
- **MongoDB** (local hoặc Atlas)

### Cách 1: Chạy Tự Động (Windows)
```powershell
# Trong thư mục gốc
./start.bat
```
Script sẽ tự động mở:
- Mock API (port 3001)
- Frontend (port 3000)

### Cách 2: Chạy Thủ Công

#### Bước 1: Khởi động Mock API
```bash
cd mock-api
npm install
npm start
```
✅ Server chạy tại: http://localhost:3001

#### Bước 2: Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Website chạy tại: http://localhost:3000

#### Bước 3: Deploy Smart Contracts (tuỳ chọn)
```bash
cd contracts
npm install

# Deploy với MockVerifier (test nhanh)
npx hardhat run scripts/deploy-mock.js --network sepolia

# Deploy với Verifier thật
npx hardhat run scripts/deploy.js --network sepolia
```

Sau khi deploy, cập nhật địa chỉ contract trong:
```javascript
// frontend/config/constants.js
export const CONTRACTS = {
  STREAM_CREDIT: '0x...',
  COLLATERAL_NFT: '0x...',
  INVOICE_NFT: '0x...',
  MOCK_USDC: '0x...'
};
```

---

## 📱 Hướng Dẫn Sử Dụng

### 1. Kết Nối Ví (Connect Wallet)

1. Mở website: http://localhost:3000
2. Click nút **"Connect Wallet"** ở góc phải
3. Chọn MetaMask → Approve
4. Đảm bảo đang ở mạng **Sepolia Testnet**

### 2. Xác Thực KYC (CCCD)

⚠️ **Bắt buộc trước khi mint Collateral NFT**

1. Vào trang **Collateral Manager**
2. Thấy banner vàng: **"Cần xác thực KYC"**
3. Click **"Xác thực ngay"**
4. Upload ảnh CCCD mặt trước
5. Dùng chuột **kéo chọn vùng** chứa số CCCD (12 chữ số)
6. Preview hiển thị vùng đã zoom 6x
7. Click **"QUÉT SỐ CCCD NGAY"**
8. Hệ thống OCR đọc số → Lưu vào MongoDB
9. ✅ KYC verified!

**Lưu ý OCR:**
- Chọn vùng rõ ràng, chỉ chứa 12 số
- Không chọn vùng có chữ, ký tự đặc biệt
- Tesseract sử dụng PSM 7, whitelist chỉ digits
- Nếu sai số, thử chọn vùng khác

### 3. Mint Collateral NFT (Token Hóa Tài Sản)

1. Sau khi KYC verified, vào **Collateral Manager**
2. Điền thông tin:
   - **Asset Name**: Tên tài sản (VD: "Máy CNC 2020")
   - **Asset Type**: Loại (Machinery, Real Estate, Vehicle...)
   - **Estimated Value**: Giá trị ước tính (USDC)
   - **Description**: Mô tả chi tiết
3. Upload ảnh tài sản
4. Hệ thống tự động:
   - Tính hash SHA-256
   - Upload lên IPFS
   - Mint NFT trên blockchain
5. ✅ Nhận Collateral NFT!

### 4. Vay Tiền (Borrow)

1. Vào **Loan Manager**
2. Nhập **Amount** (số tiền vay, USDC)
3. Chọn **Loan Term** (kỳ hạn):
   - 7-30 days: 5% APR
   - 60-90 days: 8% APR
   - 120-180 days: 15% APR
   - 365 days: 25% APR

4. **Chọn Collateral (tuỳ chọn)** để được giảm lãi:
   - Hiện popup **"Lãi suất ưu đãi với Collateral"**
   - Dropdown chọn NFT đã mint
   - Xem LTV ratio và discount:
     * LTV < 50%: Giảm 1%
     * LTV 50-80%: Giảm 2%
     * LTV 80-100%: Giảm 3%
     * LTV > 100%: Giảm 4%
   - Ví dụ: Vay 1000 USDC, collateral 1500 USDC
     * LTV = 66.67% → Tier Medium
     * Base rate 5% → Final rate **3%**
     * Tiết kiệm 2%!

5. Click **"Borrow"** → Approve transaction
6. ✅ Nhận USDC vào ví!

### 5. Trả Nợ (Repay)

1. Trong **Loan Manager**, tab **"Active Loan"**
2. Xem thông tin:
   - Số tiền đã vay
   - Lãi suất
   - Deadline
   - Tổng phải trả
3. Click **"Repay"** → Approve USDC transfer
4. ✅ Loan cleared!

### 6. Trả Commitment Fee

**Commitment Fee** = Phí duy trì credit line

```
Fee = Available Credit × 0.5% APR × Time Elapsed
```

- **Available Credit** = Credit Limit - Borrowed
- Tích lũy theo thời gian
- Trả linh hoạt (hàng tuần/tháng)

**Cách trả:**
1. Tab **"Account Info"** → Xem **Accumulated Fee**
2. Click **"Pay Commitment Fee"**
3. Approve transaction
4. ✅ Fee cleared!

### 7. Generate ZK Proof (Fraud Detection)

1. Tab **"ZK Fraud Detection"**
2. Chọn scenario:
   - **Honest Trader**: Transaction pattern hợp lệ
   - **Wash Trader**: Giao dịch gian lận
3. Click **"Generate ZK Proof"**
4. Đợi circuit tính toán (30-60s)
5. Submit proof lên smart contract
6. ✅ Verified!

**Lưu ý:**
- Honest trader: Benford score < 20 → Pass
- Wash trader: Benford score > 20 → Fail

---

## 🔧 Cấu Hình

### MongoDB Connection
```javascript
// frontend/lib/mongodb.js
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://user:pass@cluster.mongodb.net/streamcredit';
```

### Contract Addresses
```javascript
// frontend/config/constants.js
export const CONTRACTS = {
  STREAM_CREDIT: '0x...',
  COLLATERAL_NFT: '0x...',
  // ...
};
```

### API Endpoints
```javascript
// frontend/config/constants.js
export const API_BASE_URL = 'http://localhost:3001';
```

---

## ❌ Lỗi Thường Gặp

### 1. "Network Error" khi gọi API
**Nguyên nhân:** Mock API chưa chạy hoặc sai port

**Giải pháp:**
```bash
cd mock-api
npm start
```
Kiểm tra API_BASE_URL trong constants.js

### 2. OCR không đọc được số CCCD
**Nguyên nhân:** 
- Vùng chọn không rõ ràng
- Ảnh mờ/nhiễu
- Scale/contrast quá mạnh

**Giải pháp:**
- Chọn vùng lớn hơn, chỉ chứa 12 số
- Chụp ảnh rõ nét, ánh sáng tốt
- Reload trang thử lại

### 3. "Invalid CCCD format" khi lưu API
**Nguyên nhân:** MongoDB schema yêu cầu fields bắt buộc

**Giải pháp:**
- Đã sửa: Chỉ require cccd_number
- Clear MongoDB collection và thử lại

### 4. Transaction reverted khi mint NFT
**Nguyên nhân:** Chưa KYC hoặc gas không đủ

**Giải pháp:**
- Kiểm tra KYC verified
- Ensure wallet có ETH (Sepolia)

### 5. "Next is not a function" (Mongoose)
**Nguyên nhân:** Pre-save hook sai syntax

**Giải pháp:**
- Đã sửa: Xóa `next()` callback
- Reload server

### 6. Collateral value hiển thị 324,000,000 thay vì 324
**Nguyên nhân:** estimatedValue lưu với 6 decimals

**Giải pháp:**
- Đã sửa: Chia cho 1e6 khi hiển thị
```javascript
(col.estimatedValue / 1e6).toLocaleString()
```

---

## 📊 Database Schema

### KYC Collection
```javascript
{
  walletAddress: String (unique),
  cccd_number: String (12 digits),
  full_name: String (optional),
  date_of_birth: String (optional),
  verification_status: 'pending' | 'verified' | 'rejected',
  confidence_score: Number,
  created_at: Date
}
```

### Collateral Collection
```javascript
{
  walletAddress: String,
  tokenId: Number,
  assetName: String,
  assetType: Number,
  estimatedValue: Number (6 decimals, USDC),
  imageIPFSHash: String,
  fileHash: String (SHA-256),
  mintedAt: Date,
  isLocked: Boolean
}
```

### Loan Collection
```javascript
{
  walletAddress: String,
  loanId: Number,
  amount: Number,
  term: Number (days),
  interestRate: Number (%),
  collateralTokenId: Number (optional),
  status: 'active' | 'repaid' | 'defaulted',
  borrowedAt: Date,
  deadline: Date
}
```

---

## 🎯 Tính Năng Chính

### ✅ Đã Hoàn Thành
- [x] KYC với OCR CCCD (Tesseract.js)
- [x] Collateral NFT minting
- [x] Loan borrowing/repaying
- [x] Interest rate calculator với collateral discount
- [x] Commitment fee tích lũy
- [x] ZK fraud detection (Benford analysis)
- [x] MongoDB integration
- [x] IPFS storage
- [x] i18n (Vietnamese/English)

### 🚧 Đang Phát Triển
- [ ] Multi-collateral support
- [ ] Liquidation mechanism
- [ ] Governance token
- [ ] Mobile responsive optimization

---

## 📞 Hỗ Trợ

**GitHub Issues:** https://github.com/angianguyen/FESE/issues

**Email:** support@streamcredit.io

**Telegram:** @StreamCreditSupport

---

**Version:** 1.0.0  
**Last Updated:** January 11, 2026
