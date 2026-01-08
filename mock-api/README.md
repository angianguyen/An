# StreamCredit Mock API

Mock API server giả lập dữ liệu giao dịch từ các nền tảng thương mại điện tử (Shopee, Amazon, TikTok Shop).

## Chức năng

### 1. `/api/user/honest`
Trả về 100 đơn hàng với giá trị tuân theo **Benford's Law** - đại diện cho dữ liệu tự nhiên, không gian lận.

### 2. `/api/user/fraud`  
Trả về 100 đơn hàng với giá trị **tròn trĩnh, lặp lại** - dấu hiệu của wash trading.

## Cài đặt

```bash
npm install
```

## Chạy server

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3001`

## Test endpoints

```bash
curl http://localhost:3001/api/user/honest
curl http://localhost:3001/api/user/fraud
```
