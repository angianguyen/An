# StreamCredit - Quick Start Guide

## 🚀 Chạy tất cả services cùng lúc

### Cách 1: Dùng file batch (Windows)

Double-click file `start.bat` hoặc chạy trong terminal:

```bash
.\start.bat
```

### Cách 2: Dùng npm script

```bash
cd d:\Trường\Nam 3\HK 8\FESE\FESE\stream-credit
npm install
npm start
```

## 📦 Cài đặt lần đầu

Chạy lệnh này để cài đặt dependencies cho TẤT CẢ các folder:

```bash
npm run install:all
```

Lệnh này sẽ tự động cài đặt:
- ✅ Root dependencies (concurrently)
- ✅ Mock API dependencies
- ✅ Frontend dependencies
- ✅ Contracts dependencies

## 🎯 Services sẽ chạy

- **Mock API**: http://localhost:3001
- **Frontend**: http://localhost:3000

## ⚡ Quick Commands

```bash
# Start tất cả
npm start

# Hoặc
npm run dev

# Stop tất cả: Ctrl + C trong terminal
```

## 🛠️ Development

Khi chạy `npm start`, cả Mock API và Frontend sẽ tự động reload khi bạn sửa code.

## 📝 Notes

- Đảm bảo ports 3000 và 3001 không bị chiếm bởi app khác
- Lần đầu chạy cần chạy `npm run install:all` trước
- MetaMask cần switch sang Sepolia network
