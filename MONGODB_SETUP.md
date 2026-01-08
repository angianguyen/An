# MongoDB Setup Guide for StreamCredit

## 🚀 Quick Start

### 1. Tạo MongoDB Atlas Account

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Đăng ký tài khoản miễn phí (Free Tier - M0)
3. Tạo một cluster mới

### 2. Cấu hình Database

1. **Create Database:**
   - Database name: `streamcredit`
   - Collection name: `loans`

2. **Create Database User:**
   - Username: `streamcredit` (hoặc tùy chọn)
   - Password: Tạo password mạnh
   - Database User Privileges: `Read and write to any database`

3. **Network Access:**
   - Click "Network Access" → "Add IP Address"
   - Chọn "Allow Access from Anywhere" (`0.0.0.0/0`) cho development
   - Hoặc thêm IP cụ thể cho production

### 3. Lấy Connection String

1. Trong MongoDB Atlas Dashboard, click **"Connect"**
2. Chọn **"Connect your application"**
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy connection string, ví dụ:
   ```
   mongodb+srv://streamcredit:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4. Cấu hình Frontend

1. **Cài đặt mongoose:**
   ```bash
   cd frontend
   npm install mongoose
   ```

2. **Tạo file `.env.local`:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Cập nhật `.env.local`:**
   ```env
   MONGODB_URI=mongodb+srv://streamcredit:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/streamcredit?retryWrites=true&w=majority
   NEXT_PUBLIC_NETWORK=sepolia
   ```

   **Thay thế:**
   - `YOUR_PASSWORD` → Password của database user
   - `cluster0.xxxxx` → Cluster address thực tế
   - `streamcredit` (sau `/`) → Database name

### 5. Test Connection

Restart Next.js dev server:
```bash
npm run dev
```

Kiểm tra logs để xác nhận kết nối thành công.

---

## 📊 Database Schema

### Loan Collection

```javascript
{
  walletAddress: String,           // User's wallet (lowercase)
  loanId: String,                  // Unique ID: loan_<address>_<timestamp>
  principal: Number,               // Số tiền vay gốc (USDC)
  termDays: Number,                // Kỳ hạn vay (days)
  interestRate: Number,            // Lãi suất (%)
  
  borrowedAt: Date,                // Thời điểm vay
  repaidAt: Date,                  // Thời điểm trả (null nếu chưa)
  
  borrowTxHash: String,            // Transaction hash khi borrow
  repayTxHash: String,             // Transaction hash khi repay
  
  interestPaid: Number,            // Lãi đã trả
  principalPaid: Number,           // Gốc đã trả
  totalRepaid: Number,             // Tổng đã trả
  earlyRepaymentBonus: Boolean,    // Có được early bonus không
  
  status: String,                  // 'active' | 'repaid' | 'partial'
  creditLimitAtBorrow: Number,     // Credit limit lúc vay
  network: String,                 // 'sepolia' | 'mainnet'
  
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Indexes

- `{ walletAddress: 1, borrowedAt: -1 }` - Query by user, sorted by date
- `{ status: 1 }` - Filter by loan status
- `{ loanId: 1 }` - Unique loan lookup

---

## 🔌 API Endpoints

### 1. Get Loan History

**GET** `/api/loans?walletAddress=0x...&status=active&limit=50&skip=0`

Query Parameters:
- `walletAddress` (required): User's wallet address
- `status` (optional): `active` | `repaid` | `partial`
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Pagination offset (default: 0)

Response:
```json
{
  "success": true,
  "data": [...loans],
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

### 2. Create Loan (Borrow)

**POST** `/api/loans`

Body:
```json
{
  "walletAddress": "0xd387391F8C5018bb2da4486ed8DC4d1b9fa2705C",
  "principal": 10000,
  "termDays": 30,
  "interestRate": 5,
  "borrowTxHash": "0xabc123...",
  "creditLimitAtBorrow": 30000,
  "network": "sepolia"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "loanId": "loan_0xd38739_1704700000000",
    ...loan details
  }
}
```

### 3. Update Loan (Repay)

**PUT** `/api/loans/:loanId`

Body:
```json
{
  "repayTxHash": "0xdef456...",
  "interestPaid": 41.1,
  "principalPaid": 10000,
  "totalRepaid": 10041.1,
  "earlyRepaymentBonus": true,
  "status": "repaid"
}
```

### 4. Get Loan Details

**GET** `/api/loans/:loanId`

Response:
```json
{
  "success": true,
  "data": {
    ...loan details
  }
}
```

### 5. Get Statistics

**GET** `/api/stats?walletAddress=0x...`

Response:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalLoans": 15,
      "activeLoans": 2,
      "repaidLoans": 13,
      "totalBorrowed": 150000,
      "totalRepaid": 130000,
      "totalInterestPaid": 3500,
      "earlyRepaymentCount": 8,
      "avgLoanAmount": 10000,
      "avgTermDays": 45,
      "avgInterestRate": 8.5
    },
    "recentLoans": [...]
  }
}
```

---

## 💻 Usage trong Frontend

### Trong Web3Context.js

```javascript
import { createLoan, updateLoan } from '../hooks/useLoanHistory';

// Khi borrow thành công
const borrow = useCallback(async (amount, termDays) => {
  // ... existing borrow logic ...
  
  const receipt = await tx.wait();
  
  // Save to MongoDB
  try {
    await createLoan({
      walletAddress: account,
      principal: parseFloat(amount),
      termDays: termDays,
      interestRate: await getInterestRate(termDays),
      borrowTxHash: tx.hash,
      creditLimitAtBorrow: accountInfo?.creditLimit || 0,
      network: 'sepolia'
    });
  } catch (err) {
    console.error('Failed to save loan to database:', err);
  }
  
  return { success: true, txHash: tx.hash };
}, [account]);

// Khi repay thành công
const repay = useCallback(async (amount = 0) => {
  // ... existing repay logic ...
  
  const receipt = await tx.wait();
  
  // Update in MongoDB
  try {
    const loanId = `loan_${account.slice(0, 8)}_${borrowTimestamp}`;
    await updateLoan(loanId, {
      repayTxHash: tx.hash,
      interestPaid: parseFloat(accountInfo.interest),
      principalPaid: parseFloat(accountInfo.borrowed),
      totalRepaid: totalDebt,
      earlyRepaymentBonus: accountInfo.isEarlyRepayment,
      status: 'repaid'
    });
  } catch (err) {
    console.error('Failed to update loan in database:', err);
  }
  
  return { success: true, txHash: tx.hash };
}, [account]);
```

### Trong Component

```javascript
import { useLoanHistory, useLoanStats } from '../hooks/useLoanHistory';

function LoanHistoryComponent() {
  const { account } = useWeb3();
  const { loans, loading, error } = useLoanHistory(account);
  const { stats, recentLoans } = useLoanStats(account);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Loan Statistics</h2>
      <p>Total Loans: {stats?.totalLoans}</p>
      <p>Total Borrowed: ${stats?.totalBorrowed}</p>
      
      <h2>Loan History</h2>
      {loans.map(loan => (
        <div key={loan.loanId}>
          <p>Amount: ${loan.principal}</p>
          <p>Status: {loan.status}</p>
          <p>Date: {new Date(loan.borrowedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 Security Best Practices

1. **Environment Variables:**
   - NEVER commit `.env.local` to git
   - Use different MongoDB databases for dev/staging/prod
   - Rotate database passwords regularly

2. **Network Access:**
   - Limit IP whitelist in production
   - Use VPC peering for production deployment

3. **Validation:**
   - Always validate wallet addresses
   - Sanitize inputs to prevent injection attacks
   - Use mongoose schema validation

4. **Indexes:**
   - Already configured for optimal query performance
   - Monitor slow queries in MongoDB Atlas

---

## 🐛 Troubleshooting

### Connection Error: "MongoServerError: bad auth"
- Check username/password in connection string
- Verify database user has correct privileges

### Connection Timeout
- Check Network Access whitelist in MongoDB Atlas
- Verify connection string format

### "MONGODB_URI not defined"
- Ensure `.env.local` exists in `frontend/` directory
- Restart Next.js dev server after adding env variables

### Mongoose Duplicate Key Error
- `loanId` must be unique
- Ensure timestamp is used in loanId generation

---

## 📈 Monitoring

MongoDB Atlas provides built-in monitoring:

1. **Metrics:**
   - Connections
   - Operations per second
   - Query performance

2. **Alerts:**
   - Set up email alerts for high connection count
   - Monitor disk usage

3. **Profiler:**
   - Identify slow queries
   - Optimize indexes

Access via MongoDB Atlas Dashboard → Metrics tab

---

## 🎯 Next Steps

1. ✅ Setup MongoDB Atlas
2. ✅ Configure connection string
3. ✅ Install mongoose
4. ✅ Test API endpoints
5. 🔄 Integrate with Web3Context
6. 🔄 Create Loan History UI component
7. 🔄 Add analytics dashboard

Happy coding! 🚀
