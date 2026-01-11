# Hệ thống Đa ngôn ngữ (i18n) - Hướng dẫn Sử dụng

## 📋 Tổng quan

Ứng dụng đã được tích hợp hệ thống đa ngôn ngữ sử dụng **react-i18next**, hỗ trợ:
- ��� Tiếng Việt (vi)
- 🇬🇧 English (en)

## 🚀 Cài đặt

Các dependencies đã được cài đặt:
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

## 📁 Cấu trúc Files

```
frontend/
├── config/
│   └── i18n.js              # Cấu hình i18next
├── locales/
│   ├── en.json              # Bản dịch Tiếng Anh
│   └── vi.json              # Bản dịch Tiếng Việt
├── components/
│   └── LanguageSwitcher.js  # Component chuyển đổi ngôn ngữ
└── app/
    ├── providers.js          # I18nextProvider wrapper
    └── demo.jsx              # Đã tích hợp LanguageSwitcher
```

## 🎨 Component LanguageSwitcher

Đã được thêm vào Navbar với 2 variants:

### Compact Variant (đang dùng)
```jsx
<LanguageSwitcher variant="compact" />
```
- Hiển thị dropdown nhỏ gọn với cờ và mã ngôn ngữ
- Phù hợp cho header/navbar

### Default Variant
```jsx
<LanguageSwitcher />
```
- Hiển thị 2 nút lớn với icon và tên đầy đủ
- Phù hợp cho settings page

## 💻 Cách Sử Dụng trong Components

### 1. Import hook
```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Sử dụng trong component
```jsx
export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('collateral.title')}</h1>
      <p>{t('collateral.subtitle')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 3. Với interpolation (biến động)
```jsx
// Translation key: "collateral.messages.mintSuccess": "Mint successful! Token ID: {{tokenId}}"
const message = t('collateral.messages.mintSuccess', { tokenId: '123' });
// Output: "Mint successful! Token ID: 123"
```

## 📝 Cấu trúc Translation Keys

### Common (dùng chung)
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Collateral Management
```json
{
  "collateral": {
    "title": "Collateral Asset Management",
    "subtitle": "Tokenize assets → Create ZK Proof → Get On-Chain Credit",
    "assetName": "Asset Name",
    "messages": {
      "mintSuccess": "Mint successful! Token ID: {{tokenId}}"
    }
  }
}
```

## 🔧 Áp dụng cho Components chưa dịch

### Ví dụ: CollateralManager.js

**Trước:**
```jsx
<h1>🏦 Quản lý Tài sản Thế chấp</h1>
<p>Token hóa tài sản → Tạo ZK Proof → Nhận Credit On-Chain</p>
```

**Sau:**
```jsx
const { t } = useTranslation();

<h1>🏦 {t('collateral.title')}</h1>
<p>{t('collateral.subtitle')}</p>
```

### Checklist cho mỗi component:

1. ✅ Import `useTranslation`
2. ✅ Gọi `const { t } = useTranslation();`
3. ✅ Thay thế hardcoded text bằng `t('key')`
4. ✅ Thêm keys vào `locales/en.json` và `locales/vi.json`
5. ✅ Test chuyển đổi ngôn ngữ

## 🎯 Components cần áp dụng

### Ưu tiên cao (UI chính)
- ✅ **Navbar** - Đã xong
- ✅ **LanguageSwitcher** - Đã xong  
- 🔄 **CollateralManager** - Đang làm (cần hoàn thiện)
- ⏳ **LoanManager** - Chưa làm
- ⏳ **InvoiceManager** - Chưa làm
- ⏳ **BenfordChart** - Chưa làm

### Ưu tiên trung bình
- ⏳ **Landing Page** (demo.jsx)
- ⏳ **Footer**
- ⏳ **Team Section**

## 🔍 Tìm Text cần dịch

### Tìm trong file:
```bash
# Tìm text tiếng Việt cố định
grep -n "Quản lý\|Tạo\|Nhập\|Chọn" components/CollateralManager.js
```

### Patterns phổ biến cần thay thế:
```jsx
// Labels
<label>Tên tài sản</label> 
→ <label>{t('collateral.assetName')}</label>

// Buttons
<button>Tạo khoản vay</button>
→ <button>{t('loan.createLoanButton')}</button>

// Placeholders
placeholder="Nhập tên..."
→ placeholder={t('collateral.assetNamePlaceholder')}

// Messages
alert('Vui lòng điền đầy đủ!')
→ alert(t('collateral.messages.fillAllFields'))
```

## 🌍 Thêm Ngôn ngữ Mới

### 1. Tạo file translation
```bash
touch frontend/locales/ja.json  # Tiếng Nhật
```

### 2. Cập nhật config
```jsx
// config/i18n.js
import translationJA from '../locales/ja.json';

const resources = {
  en: { translation: translationEN },
  vi: { translation: translationVI },
  ja: { translation: translationJA }  // Thêm
};
```

### 3. Cập nhật LanguageSwitcher
```jsx
const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];
```

## 🐛 Troubleshooting

### Lỗi: "Translation key not found"
- ✅ Kiểm tra key có tồn tại trong `locales/en.json` và `locales/vi.json`
- ✅ Restart dev server sau khi thêm key mới

### Lỗi: "useTranslation must be wrapped in I18nextProvider"
- ✅ Đảm bảo `<I18nextProvider>` đã wrap trong `app/providers.js`

### Ngôn ngữ không đổi
- ✅ Xóa localStorage: `localStorage.removeItem('language')`
- ✅ Hard refresh: Ctrl+Shift+R

## 📚 Best Practices

### 1. Tổ chức Keys theo Module
```json
{
  "collateral": {...},
  "loan": {...},
  "invoice": {...}
}
```

### 2. Sử dụng Nested Keys
```json
{
  "collateral": {
    "messages": {
      "success": "...",
      "error": "..."
    }
  }
}
```

### 3. Consistency trong Naming
- `title`, `subtitle` cho headings
- `label` cho form labels  
- `placeholder` cho input placeholders
- `button` cho button text
- `messages` cho alerts/notifications

### 4. Reuse Common Keys
```jsx
// Thay vì định nghĩa lại nhiều lần
"save": "Save"

// Dùng chung
{t('common.save')}
```

## 🎉 Demo

Sau khi hoàn thành:
1. Mở app: `http://localhost:3000`
2. Click vào Language Switcher ở góc phải navbar
3. Chọn ngôn ngữ → Toàn bộ UI sẽ đổi ngay lập tức
4. Refresh page → Ngôn ngữ được giữ nguyên (lưu trong localStorage)

## 📖 Tài liệu Tham khảo

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Translation Key Best Practices](https://www.i18next.com/principles/fallback)

---

**Trạng thái:** ✅ Hệ thống core đã hoàn thiện. Đang áp dụng translations cho các components.
