# StreamCredit - Kiến Trúc Hệ Thống & Logic

## 🏗️ Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 14)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │   KYC    │  │Collateral│  │   Loan   │  │  ZK Proof  │ │
│  │  Upload  │  │  Manager │  │  Manager │  │  Generator │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬─────┘ │
└───────┼─────────────┼─────────────┼────────────────┼───────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js API Routes)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │/api/kyc/ │  │/api/coll-│  │/api/loans│  │/api/zkproof│ │
│  │verify    │  │aterals   │  │          │  │            │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬─────┘ │
└───────┼─────────────┼─────────────┼────────────────┼───────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (MongoDB Atlas)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   KYC    │  │Collateral│  │   Loan   │                 │
│  │Collection│  │Collection│  │Collection│                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              Blockchain Layer (Ethereum Sepolia)            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ StreamCredit │  │CollateralNFT │  │  ZK Verifier    │  │
│  │  Contract    │  │  Contract    │  │   Contract      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ IPFS/Web3│  │Tesseract │  │ SnarkJS  │  │  MetaMask  │ │
│  │ Storage  │  │ OCR.js   │  │ ZK Lib   │  │  Wallet    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 KYC System Architecture

### Workflow
```
User Upload CCCD → Mouse Drag Selection → Canvas Crop → 
Image Enhancement (6x scale, grayscale) → Tesseract OCR → 
Number Extraction → Validation (12 digits) → Save MongoDB
```

### Technical Implementation

#### 1. KYCUploadSimple Component
```javascript
// State management
const [frontImage, setFrontImage] = useState(null);
const [selectedArea, setSelectedArea] = useState(null);
const [croppedPreview, setCroppedPreview] = useState(null);

// Mouse drag selection
const handleMouseDown = (e) => {
  const rect = imageRef.current.getBoundingClientRect();
  setSelectionStart({ 
    x: e.clientX - rect.left, 
    y: e.clientY - rect.top 
  });
};

// Canvas crop with 3x preview
const createCroppedPreview = async (area) => {
  const canvas = document.createElement('canvas');
  canvas.width = area.width * scaleX * 3;
  canvas.height = area.height * scaleY * 3;
  ctx.drawImage(img, ...sourceRect, ...destRect);
  return canvas.toDataURL('image/jpeg', 0.95);
};
```

#### 2. Image Enhancement (imageEnhance.js)
```javascript
export async function enhanceImageForOCR(imageInput) {
  // 1. Scale 6x for better OCR
  const scale = 6;
  canvas.width = img.width * scale;
  
  // 2. Convert to grayscale only (no sharpening/threshold)
  const gray = 0.299 * R + 0.587 * G + 0.114 * B;
  
  // 3. Return high-quality PNG
  return canvas.toDataURL('image/png');
}
```

#### 3. OCR Processing (ocrCCCDv2.js)
```javascript
export async function processCCCD(frontImageBuffer, backImageBuffer, options = {}) {
  const { numberOnly = false } = options;
  
  if (numberOnly) {
    // Optimized for digit extraction
    const worker = await createWorker('eng', 1);
    await worker.setParameters({
      tessedit_pageseg_mode: '7', // Single text line
      tessedit_char_whitelist: '0123456789', // Digits only
      tessedit_ocr_engine_mode: '1' // LSTM neural nets
    });
    
    const { data } = await worker.recognize(frontImageBuffer);
    const fullText = data.text;
    
    // Extract 12-digit CCCD
    const frontData = await parseCCCDFrontSmart(frontImageBuffer, fullText, numberOnly);
    
    return {
      success: frontData.cccd_number ? true : false,
      extracted_data: frontData,
      confidence: data.confidence / 100,
      format_valid: frontData.cccd_number ? true : false
    };
  }
}
```

#### 4. Number Extraction Logic
```javascript
async function parseCCCDFrontSmart(imageBuffer, fullText, numberOnly = false) {
  if (numberOnly) {
    // Extract all digit sequences
    const allDigits = cleanText.match(/\d+/g) || [];
    
    // Strategy 1: Find exact 12-digit match
    const twelveDigit = allDigits.find(d => d.length === 12);
    if (twelveDigit) return { cccd_number: twelveDigit };
    
    // Strategy 2: Combine adjacent sequences
    for (let i = 0; i < allDigits.length - 1; i++) {
      const combined = allDigits.slice(i, i + 2).join('');
      if (combined.length === 12) {
        return { cccd_number: combined };
      }
    }
    
    // Strategy 3: Take first 12 from all digits
    const cleanedDigits = cleanText.replace(/\D/g, '');
    if (cleanedDigits.length >= 12) {
      return { cccd_number: cleanedDigits.substring(0, 12) };
    }
  }
  
  return {}; // No number found
}
```

---

## 🎨 Collateral NFT System

### Smart Contract Architecture

```solidity
contract CollateralNFT is ERC721, Ownable {
    struct AssetData {
        string assetName;
        uint8 assetType; // 0=Machinery, 1=Inventory, ...
        uint256 estimatedValue; // USDC (6 decimals)
        string imageCID; // IPFS hash
        bytes32 fileHash; // SHA-256
        bool isLocked; // Used as loan collateral
    }
    
    mapping(uint256 => AssetData) public assets;
    
    function mintCollateral(
        string memory _assetName,
        uint8 _assetType,
        uint256 _estimatedValue,
        string memory _imageCID,
        bytes32 _fileHash,
        string memory _metadataURI
    ) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        
        assets[tokenId] = AssetData({
            assetName: _assetName,
            assetType: _assetType,
            estimatedValue: _estimatedValue,
            imageCID: _imageCID,
            fileHash: _fileHash,
            isLocked: false
        });
        
        _setTokenURI(tokenId, _metadataURI);
        _tokenIdCounter.increment();
        
        emit CollateralMinted(msg.sender, tokenId, _assetName, _estimatedValue);
        return tokenId;
    }
}
```

### Minting Workflow

```javascript
// 1. Calculate file hash (SHA-256)
const fileHash = await calculateFileHash(file);

// 2. Upload to IPFS
const ipfsResult = await uploadToIPFS(selectedFile, metadata);
// Returns: { imageCID, metadataCID, metadataURI }

// 3. Mint NFT on blockchain
const result = await mintCollateral(
  assetName,
  assetType,
  estimatedValue,
  ipfsResult.imageCID,
  fileHash,
  ipfsResult.metadataURI
);

// 4. Save to MongoDB
await createCollateral({
  walletAddress,
  tokenId: result.tokenId,
  estimatedValue: estimatedValue * 1e6, // Store with 6 decimals
  // ...
});
```

---

## 💰 Interest Rate Calculation with Collateral Discount

### Base Interest Rate (Reverse Curve)
```javascript
const BASE_INTEREST_TIERS = [
  { minDays: 0, maxDays: 30, rate: 5 },
  { minDays: 31, maxDays: 90, rate: 8 },
  { minDays: 91, maxDays: 180, rate: 15 },
  { minDays: 181, maxDays: 365, rate: 25 }
];
```

### Collateral Discount Tiers
```javascript
const COLLATERAL_DISCOUNT_TIERS = [
  { name: 'No Collateral', minLTV: 0, maxLTV: 0, discount: 0 },
  { name: 'Low Collateral', minLTV: 0.01, maxLTV: 0.5, discount: 1 },
  { name: 'Medium Collateral', minLTV: 0.51, maxLTV: 0.8, discount: 2 },
  { name: 'High Collateral', minLTV: 0.81, maxLTV: 1.0, discount: 3 },
  { name: 'Over-Collateralized', minLTV: 1.01, maxLTV: Infinity, discount: 4 }
];
```

### LTV Calculation
```javascript
function calculateLTV(loanAmount, collateralValue) {
  if (collateralValue === 0) return 0;
  return loanAmount / collateralValue;
}

// Example:
// Loan: 1000 USDC
// Collateral: 1500 USDC
// LTV = 1000 / 1500 = 0.67 (67%)
// Tier: Medium Collateral
// Discount: -2%
```

### Final Rate Formula
```javascript
function calculateFinalInterestRate(termDays, loanAmount, collateralValue = 0) {
  const baseRate = getBaseInterestRate(termDays);
  const ltv = calculateLTV(loanAmount, collateralValue);
  const tier = getCollateralDiscount(ltv);
  
  const finalRate = Math.max(baseRate - tier.discount, 1);
  
  return {
    baseRate,
    discount: tier.discount,
    finalRate,
    ltv: ltv.toFixed(2),
    savings: tier.discount
  };
}

// Example:
// Term: 30 days → Base rate: 5%
// LTV: 67% → Discount: -2%
// Final rate: 5% - 2% = 3%
// Savings: 2%
```

---

## 📊 Commitment Fee Mechanism

### Concept
**Commitment Fee** = Fee for maintaining access to credit line (available credit)

### Formula
```
Fee = Available Credit × 0.5% APR × Time Elapsed

where:
  Available Credit = Credit Limit - Borrowed Amount
  Time Elapsed = Current Time - Last Payment Time
```

### Smart Contract Implementation
```solidity
uint256 public constant COMMITMENT_FEE_RATE = 50; // 0.5% = 50 basis points
uint256 public constant BASIS_POINTS = 10000;
uint256 public constant SECONDS_PER_YEAR = 365 days;

function calculateCommitmentFee(address account) public view returns (uint256) {
    if (creditLimit[account] == 0) return 0;
    if (lastCommitmentFeePayment[account] == 0) return 0;
    
    // Available credit = Credit limit - Borrowed
    uint256 availableCredit = creditLimit[account] > borrowed[account] 
        ? creditLimit[account] - borrowed[account] 
        : 0;
    
    // Time since last payment
    uint256 timeElapsed = block.timestamp - lastCommitmentFeePayment[account];
    
    // Calculate fee
    uint256 annualFee = (availableCredit * COMMITMENT_FEE_RATE) / BASIS_POINTS;
    uint256 fee = (annualFee * timeElapsed) / SECONDS_PER_YEAR;
    
    return fee;
}

function payCommitmentFee() external nonReentrant {
    uint256 fee = calculateCommitmentFee(msg.sender);
    require(fee > 0, "No fee to pay");
    
    // Transfer USDC from user
    IERC20(usdc).transferFrom(msg.sender, address(this), fee);
    
    // Reset timer
    lastCommitmentFeePayment[msg.sender] = block.timestamp;
    
    emit CommitmentFeePaid(msg.sender, fee);
}
```

### Example Scenarios

#### Scenario 1: No Borrowing
```
Day 0:   Credit limit = 10,000 USDC
         Available = 10,000 USDC
         
Day 30:  Fee = 10,000 × 0.5% × (30/365) = 4.11 USDC
         Pay 4.11 USDC → Timer reset
         
Day 60:  Fee = 10,000 × 0.5% × (30/365) = 4.11 USDC
         Pay 4.11 USDC
         
Total 60 days: 8.22 USDC
```

#### Scenario 2: Borrow 4,000 USDC
```
Day 0:   Credit = 10,000, Available = 10,000
Day 1:   Borrow 4,000 → Available = 6,000
         
Day 31:  Fee = 10,000 × 0.5% × (1/365) + 6,000 × 0.5% × (30/365)
            = 0.137 + 2.466 = 2.60 USDC
         
Day 61:  Repay 4,000 → Available = 10,000
         
Day 91:  Fee = 6,000 × 0.5% × (30/365) = 2.47 USDC

Benefit: Lower fee when actively borrowing!
```

---

## 🔐 ZK Fraud Detection System

### Benford's Law Analysis

**Concept:** First digit distribution in real financial data follows Benford's Law
- Natural datasets: 1 appears ~30%, 9 appears ~5%
- Fraudulent data: More uniform distribution

### Circuit Design (circom)
```circom
template BenfordTest() {
    signal input firstDigits[100];
    signal input fraudThreshold;
    signal output benfordScore;
    signal output isFraud;
    
    // Count digit frequencies
    component counter = DigitCounter(100);
    for (var i = 0; i < 100; i++) {
        counter.digits[i] <== firstDigits[i];
    }
    
    // Calculate Chi-squared score
    component scorer = ChiSquared();
    for (var i = 1; i <= 9; i++) {
        scorer.observed[i-1] <== counter.counts[i];
        scorer.expected[i-1] <== benfordExpected[i];
    }
    
    benfordScore <== scorer.score;
    isFraud <== scorer.score > fraudThreshold ? 1 : 0;
}
```

### Verification Flow
```javascript
// 1. Generate proof (client-side)
async function generateZKProof(orderData) {
  const input = {
    firstDigits: orderData.map(o => parseInt(o.amount.toString()[0])),
    fraudThreshold: 20
  };
  
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    'creditCheck.wasm',
    'creditCheck_final.zkey'
  );
  
  return { proof, publicSignals };
}

// 2. Verify on-chain
function verifyProof(
    uint[2] calldata _pA,
    uint[2][2] calldata _pB,
    uint[2] calldata _pC,
    uint[2] calldata _pubSignals
) public view returns (bool) {
    return verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
}

// 3. Grant credit if verified
function submitProof(...) external {
    require(verifyProof(...), "Invalid proof");
    
    uint256 benfordScore = _pubSignals[0];
    require(benfordScore < FRAUD_THRESHOLD, "Fraud detected");
    
    creditLimit[msg.sender] = DEFAULT_CREDIT_LIMIT;
    emit CreditGranted(msg.sender, DEFAULT_CREDIT_LIMIT);
}
```

---

## 🗄️ Database Schema Design

### MongoDB Collections

#### 1. KYC Collection
```javascript
const KYCSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  cccd_number: {
    type: String,
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: false
  },
  date_of_birth: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1
  },
  verified_at: Date,
  created_at: { type: Date, default: Date.now }
});
```

#### 2. Collateral Collection
```javascript
const CollateralSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  assetType: {
    type: Number, // 0-6
    required: true
  },
  estimatedValue: {
    type: Number, // USDC with 6 decimals
    required: true
  },
  imageIPFSHash: String,
  fileHash: String, // SHA-256
  isLocked: {
    type: Boolean,
    default: false
  },
  mintedAt: {
    type: Date,
    default: Date.now
  }
});
```

#### 3. Loan Collection
```javascript
const LoanSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true
  },
  loanId: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  term: {
    type: Number, // days
    required: true
  },
  interestRate: {
    type: Number, // %
    required: true
  },
  collateralTokenId: {
    type: Number,
    required: false
  },
  collateralDiscount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'repaid', 'defaulted'],
    default: 'active'
  },
  borrowedAt: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  repaidAt: Date
});
```

---

## 🔄 State Management & Data Flow

### Web3 Context Provider
```javascript
const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});
  
  // Contract interactions
  const mintCollateral = async (assetName, assetType, value, imageCID, fileHash, metadataURI) => {
    const tx = await contracts.collateralNFT.mintCollateral(...args);
    await tx.wait();
    return { tokenId: result.tokenId };
  };
  
  const borrow = async (amount, term) => {
    const tx = await contracts.streamCredit.borrow(amount, term);
    await tx.wait();
  };
  
  return (
    <Web3Context.Provider value={{ 
      account, 
      mintCollateral, 
      borrow,
      repay,
      ...
    }}>
      {children}
    </Web3Context.Provider>
  );
};
```

### API Integration Flow
```
Component → Context Hook → API Call → Smart Contract → Event → MongoDB Update
   ↓                                         ↓
UI Update ← Refetch Hook ← API Response ← Transaction Receipt
```

---

## 🚀 Deployment Architecture

### Production Stack
```
┌──────────────────────────────────────────┐
│   Frontend: Vercel / Netlify            │
│   - Next.js 14 App Router                │
│   - Static + SSR pages                   │
│   - Edge functions for API routes       │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│   Database: MongoDB Atlas                │
│   - Dedicated cluster (M10+)             │
│   - Auto-scaling                         │
│   - Point-in-time backup                 │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│   Blockchain: Ethereum Mainnet/Polygon  │
│   - StreamCredit contract                │
│   - CollateralNFT contract               │
│   - Verifier contract                    │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│   Storage: IPFS / Pinata / Web3.Storage │
│   - Asset images                         │
│   - Metadata JSON                        │
│   - ZK circuit files                     │
└──────────────────────────────────────────┘
```

---

## 📈 Performance Optimizations

### 1. Image Processing
- **Client-side enhancement**: Reduce server load
- **Canvas API**: No external dependencies
- **Progressive upload**: Chunk large files

### 2. OCR Performance
- **Tesseract LSTM**: Faster than legacy engine
- **PSM 7**: Single-line optimization
- **Digit whitelist**: Reduce false positives

### 3. Smart Contract Gas Optimization
- **Batch operations**: Combine multiple calls
- **Storage packing**: Use smaller types
- **Event indexing**: Efficient off-chain queries

### 4. Database Indexing
```javascript
// Compound indexes for common queries
KYCSchema.index({ walletAddress: 1, verification_status: 1 });
CollateralSchema.index({ walletAddress: 1, isLocked: 1 });
LoanSchema.index({ walletAddress: 1, status: 1, borrowedAt: -1 });
```

---

## 🔒 Security Considerations

### 1. Input Validation
```javascript
// Sanitize CCCD number
const cleanNumber = cccdNumber.replace(/\D/g, '');
if (cleanNumber.length !== 12) {
  throw new Error('Invalid CCCD format');
}
```

### 2. Rate Limiting
```javascript
// API routes
const rateLimit = {
  '/api/kyc/verify': '10 per hour',
  '/api/collaterals': '50 per hour',
  '/api/loans': '100 per hour'
};
```

### 3. Access Control
```javascript
// Check wallet ownership
const kyc = await KYC.findOne({ walletAddress: account.toLowerCase() });
if (!kyc || kyc.verification_status !== 'verified') {
  return NextResponse.json({ error: 'KYC required' }, { status: 403 });
}
```

### 4. Smart Contract Security
```solidity
// Reentrancy guard
modifier nonReentrant() {
    require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
    _status = _ENTERED;
    _;
    _status = _NOT_ENTERED;
}

// Ownership checks
modifier onlyNFTOwner(uint256 tokenId) {
    require(collateralNFT.ownerOf(tokenId) == msg.sender, "Not NFT owner");
    _;
}
```

---

## 📊 Monitoring & Analytics

### Key Metrics
- **KYC Success Rate**: `verified / total_submissions`
- **OCR Accuracy**: `correct_extractions / total_attempts`
- **Loan Default Rate**: `defaulted / total_loans`
- **Average LTV Ratio**: `sum(loan_amounts) / sum(collateral_values)`
- **Gas Costs**: Track per transaction type

### Logging Strategy
```javascript
// Structured logging
console.log({
  timestamp: Date.now(),
  action: 'KYC_VERIFICATION',
  wallet: account,
  cccd: cccdNumber,
  confidence: ocrConfidence,
  status: 'success'
});
```

---

**Version:** 1.0.0  
**Last Updated:** January 11, 2026  
**Maintainer:** StreamCredit Dev Team
