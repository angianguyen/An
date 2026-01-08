# StreamCredit ZK Circuit

Zero-Knowledge Proof circuit để verify credit worthiness mà không tiết lộ dữ liệu nhạy cảm.

## Chức năng

Circuit kiểm tra 2 điều kiện:
1. **Revenue Check**: Doanh thu >= ngưỡng tối thiểu (ví dụ: $10,000)
2. **Fraud Check**: Benford Score < ngưỡng gian lận (ví dụ: 15%)

Chỉ khi CẢ 2 điều kiện đúng thì output `isValid = 1`.

## Private Inputs (Bí mật)
- `revenue`: Doanh thu thực tế
- `benfordScore`: Điểm Benford's Law (0-100, càng thấp càng tốt)

## Public Inputs (Công khai on-chain)
- `revenueThreshold`: Ngưỡng doanh thu tối thiểu
- `fraudThreshold`: Ngưỡng phát hiện gian lận

## Setup & Compilation

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Download Powers of Tau (chỉ cần 1 lần)
```bash
curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
```

### 3. Compile circuit
```bash
npm run compile
```

### 4. Setup proving keys
```bash
npm run setup
npm run contribute
npm run export-vkey
```

### 5. Export Solidity verifier
```bash
npm run export-verifier
```

File `Verifier.sol` sẽ được tạo trong `../contracts/contracts/`.

## Generate Proof

```bash
npm run generate-proof
```

## Verify Proof

```bash
npm run verify-proof
```

## Integration với Smart Contract

Sau khi export verifier, sử dụng trong Solidity:

```solidity
import "./Verifier.sol";

contract StreamCredit {
    Verifier verifier;
    
    function verifyAndUpdateCredit(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public {
        require(verifier.verifyProof(a, b, c, input), "Invalid proof");
        // Update credit limit...
    }
}
```
