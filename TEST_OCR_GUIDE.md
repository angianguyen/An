# 🧪 HƯỚNG DẪN TEST OCR CCCD

## 📋 Chuẩn bị

### 1. Tải ảnh CCCD mẫu
Bạn có 2 options:

**Option A: Dùng ảnh CCCD thật của bạn** (Recommended)
- Chụp mặt trước và mặt sau CCCD
- Đảm bảo ảnh rõ nét, không bị mờ
- Kích thước < 5MB

**Option B: Dùng ảnh CCCD mẫu trên Google** 
- Search: "CCCD mẫu Việt Nam 2021"
- Download 2 ảnh: mặt trước + mặt sau
- ⚠️ **LƯU Ý**: Độ chính xác OCR sẽ thấp hơn với ảnh mẫu vì thường bị watermark

### 2. Cấu hình MongoDB
Đảm bảo MongoDB connection string đã được thêm vào `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fesee?retryWrites=true&w=majority
```

---

## 🚀 CÁC BƯỚC TEST

### BƯỚC 1: Start Dev Server

```bash
cd e:\fesee-main\frontend
npm run dev
```

Mở browser: `http://localhost:3000`

---

### BƯỚC 2: Navigate đến Collateral Manager

1. Kết nối MetaMask wallet
2. Click nút **"Collateral NFT"** trên navbar
3. Hoặc vào trực tiếp: `http://localhost:3000` → chọn view `collateral`

---

### BƯỚC 3: KYC Modal sẽ tự động hiện

Khi vào CollateralManager lần đầu, KYC modal sẽ tự động xuất hiện (vì wallet chưa verify).

#### Test Flow:

**A. Upload ảnh CCCD:**
```
1. Click vào ô "Mặt trước CCCD"
2. Chọn ảnh mặt trước
3. Preview sẽ hiện ngay
4. Click vào ô "Mặt sau CCCD"
5. Chọn ảnh mặt sau
6. Preview sẽ hiện
```

**B. Click nút "Xác thực CCCD":**
```
→ Bạn sẽ thấy màn hình "Đang xử lý CCCD..."
→ Tesseract.js đang chạy OCR (mất 10-30 giây)
→ ⏳ KIÊN NHẪN CHỜ - đừng reload page!
```

**C. Xem kết quả:**

**✅ Nếu thành công (confidence > 70%):**
```
✓ Hiển thị tick xanh "Xác thực thành công!"
✓ Show thông tin đã trích xuất:
  - Họ tên
  - Số CCCD
  - Độ chính xác (%)
✓ Nút "Tiếp tục mint Collateral NFT" xuất hiện
✓ Modal tự động đóng sau 3s
```

**⚠️ Nếu cần xác thực thủ công (confidence < 70%):**
```
! Hiển thị icon cảnh báo vàng
! Cho biết độ chính xác thấp
! Liệt kê các trường bị thiếu (missing_fields)
! Có nút "Upload lại"
```

**❌ Nếu lỗi:**
```
× Hiển thị thông báo lỗi cụ thể
× Check console log để debug
```

---

### BƯỚC 4: Verify trong Database

#### Option A: MongoDB Compass
```bash
1. Mở MongoDB Compass
2. Connect với MONGODB_URI
3. Vào database: fesee
4. Collection: kycs
5. Tìm document với walletAddress của bạn
```

#### Option B: MongoDB Atlas Web UI
```bash
1. Đăng nhập: https://cloud.mongodb.com
2. Browse Collections
3. Tìm collection 'kycs'
4. Xem data
```

**Kiểm tra các fields:**
```json
{
  "walletAddress": "0x...",
  "cccd_number": "001234567890",
  "full_name": "NGUYỄN VĂN A",
  "date_of_birth": "01/01/1990",
  "gender": "Nam",
  "place_of_origin": "Hà Nội",
  "place_of_residence": "123 Đường ABC, Quận 1, TP.HCM",
  "issue_date": "15/06/2021",
  "issuing_authority": "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
  "verification_status": "verified",
  "confidence_score": 0.85,
  "missing_fields": [],
  "format_valid": true,
  "verified_at": "2026-01-11T..."
}
```

---

### BƯỚC 5: Test KYC Status API

Mở browser console và chạy:

```javascript
// Check KYC status
const response = await fetch('/api/kyc/verify?walletAddress=YOUR_WALLET_ADDRESS');
const data = await response.json();
console.log('KYC Status:', data);
```

**Expected Response:**
```json
{
  "verified": true,
  "status": "verified",
  "confidence_score": 0.85,
  "full_name": "NGUYỄN VĂN A",
  "cccd_number": "001234567890",
  "verified_at": "2026-01-11T..."
}
```

---

### BƯỚC 6: Test Mint Collateral NFT

Sau khi KYC verified:
1. Modal KYC sẽ đóng
2. Bạn có thể mint Collateral NFT bình thường
3. System sẽ ghi nhận owner đã được verify KYC

---

## 🐛 TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "Failed to extract text from image"
```
❌ Nguyên nhân: Ảnh bị mờ, nghiêng, hoặc độ phân giải thấp
✅ Giải pháp: Chụp lại ảnh rõ nét hơn, đảm bảo ánh sáng đủ
```

#### 2. "CCCD number already registered"
```
❌ Nguyên nhân: Số CCCD đã được đăng ký với wallet khác
✅ Giải pháp: Dùng CCCD khác hoặc xóa record cũ trong MongoDB
```

#### 3. "Missing required fields"
```
❌ Nguyên nhân: OCR không đọc được một số trường
✅ Giải pháp: 
   - Check console log xem trường nào thiếu
   - Crop ảnh để focus vào vùng text
   - Tăng độ tương phản của ảnh
```

#### 4. Tesseract mất quá lâu (> 1 phút)
```
❌ Nguyên nhân: File ảnh quá lớn
✅ Giải pháp: Resize ảnh xuống < 2MB trước khi upload
```

#### 5. Console error: "Cannot read properties of undefined"
```
❌ Nguyên nhân: MongoDB chưa kết nối
✅ Giải pháp: 
   - Check MONGODB_URI trong .env.local
   - Test connection với: npm run dev và xem console log
```

---

## 📊 ĐÁNH GIÁ ĐỘ CHÍNH XÁC

### Tesseract.js cho CCCD Việt Nam:

| Điều kiện | Độ chính xác | Ghi chú |
|-----------|--------------|---------|
| ✅ Ảnh rõ nét, font chuẩn | 75-85% | Chấp nhận được |
| ⚠️ Ảnh hơi mờ, góc nghiêng | 50-70% | Cần xác thực thủ công |
| ❌ Ảnh tối, bị smudge | < 50% | Không đạt |

### Các trường dễ đọc:
- ✅ Số CCCD (12 chữ số)
- ✅ Họ tên (in hoa)
- ✅ Ngày sinh (format DD/MM/YYYY)
- ✅ Giới tính

### Các trường khó đọc:
- ⚠️ Quê quán (text dài, có dấu)
- ⚠️ Nơi thường trú (text dài)
- ⚠️ Nơi cấp (font nhỏ)

---

## 🎯 TEST CASES

### Test Case 1: Happy Path (PASS)
```
1. Upload ảnh CCCD rõ nét
2. Đợi OCR hoàn thành
3. Confidence > 70%
4. Tất cả fields được điền đủ
5. Save vào MongoDB thành công
6. Status = "verified"
```

### Test Case 2: Low Confidence (PASS)
```
1. Upload ảnh CCCD hơi mờ
2. Confidence 50-70%
3. Missing một số fields
4. Status = "pending"
5. Show warning để admin review
```

### Test Case 3: Duplicate CCCD (FAIL)
```
1. Upload CCCD đã tồn tại
2. API return error 400
3. Message: "CCCD already registered"
```

### Test Case 4: Invalid Format (FAIL)
```
1. CCCD number < 12 digits
2. Date of birth in future
3. Issue date < 2021
4. API return error 400
5. format_valid = false
```

---

## 📝 LOGS QUAN TRỌNG

Khi test, check các logs này trong browser console:

```javascript
// OCR Processing
console.log('Processing CCCD images...');
console.log('OCR Result:', ocrResult);

// Extracted Data
console.log('Extracted CCCD Number:', extractedData.cccd_number);
console.log('Confidence Score:', confidence);

// Validation
console.log('Format Valid:', validation.format_valid);
console.log('Missing Fields:', validation.missing_fields);

// Database Save
console.log('KYC saved to MongoDB:', kyc);
```

---

## ✅ CHECKLIST TRƯỚC KHI TEST

- [ ] MongoDB connected (check .env.local)
- [ ] Dev server running (npm run dev)
- [ ] MetaMask connected
- [ ] 2 ảnh CCCD ready (mặt trước + sau)
- [ ] Ảnh < 5MB
- [ ] Ảnh rõ nét, không bị nghiêng

---

## 🎓 LƯU Ý VỀ TESSERACT.JS

### Ưu điểm:
✅ Miễn phí, không giới hạn request
✅ Chạy offline, bảo mật
✅ Dễ tích hợp với Next.js

### Nhược điểm:
❌ Độ chính xác ~70-80% với CCCD VN
❌ Chậm (10-30s/ảnh)
❌ Cần preprocess ảnh để tăng accuracy

### Khi nào nên upgrade lên FPT.AI OCR:
- Cần độ chính xác > 90%
- Cần xử lý nhanh (< 2s)
- Production ready
- Có budget ($0.01/request)

---

## 🚀 NEXT STEPS

Sau khi test xong:

1. **Nếu thành công → Ready for production!**
   - Add image preprocessing (crop, contrast, rotate)
   - Add retry logic nếu confidence thấp
   - Add admin dashboard để review pending KYC

2. **Nếu độ chính xác thấp → Upgrade FPT.AI:**
   - Tôi sẽ guide integration FPT.AI OCR
   - Chỉ cần đổi `/utils/ocrCCCD.js`
   - Giữ nguyên API routes và UI

3. **Nếu cần thêm features:**
   - QR code reader từ CCCD mặt sau
   - Liveness detection (selfie verification)
   - Auto-fill form từ CCCD data

---

**Bạn đã sẵn sàng test chưa? Hãy bắt đầu từ BƯỚC 1! 🎯**

Nếu gặp lỗi, paste log vào chat tôi sẽ debug ngay!
