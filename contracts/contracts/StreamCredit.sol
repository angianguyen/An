// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Import Verifier contract (sẽ được generate từ ZK circuit)
interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external view returns (bool);
}

// Import MockUSDC faucet for testing
interface IFaucet {
    function faucet(uint256 amount) external;
}

/**
 * @title StreamCredit
 * @notice Lending protocol dựa trên dòng tiền thời gian thực với ZK fraud detection
 */
contract StreamCredit is Ownable, ReentrancyGuard {
    IVerifier public verifier;
    IERC20 public usdcToken;
    
    // Credit limit cho mỗi borrower
    mapping(address => uint256) public creditLimit;
    
    // Số tiền đã vay
    mapping(address => uint256) public borrowed;
    
    // Thời điểm vay
    mapping(address => uint256) public borrowTimestamp;
    
    // Kỳ hạn vay (số ngày)
    mapping(address => uint256) public borrowTerm;
    
    // Commitment fee đã trả lần cuối
    mapping(address => uint256) public lastCommitmentFeePayment;
    
    // Reverse Interest Curve: Lãi suất theo kỳ hạn
    uint256 public constant SHORT_TERM_RATE = 500; // 5% APR (7-30 days)
    uint256 public constant MEDIUM_TERM_RATE = 800; // 8% APR (31-90 days)
    uint256 public constant LONG_TERM_RATE = 1500; // 15% APR (91-180 days)
    uint256 public constant VERY_LONG_TERM_RATE = 2500; // 25% APR (181-365 days)
    
    // Commitment Fee: 0.5% annual on credit limit
    uint256 public constant COMMITMENT_FEE_RATE = 50; // 0.5% (50 basis points)
    
    // Early Repayment Bonus
    uint256 public constant EARLY_REPAY_BONUS = 200; // 2% discount
    
    // Tỷ lệ credit limit trên revenue (30%)
    uint256 public constant CREDIT_RATIO = 30;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Liquidity pool
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidityProvided;
    
    // Events
    event CreditVerified(address indexed borrower, uint256 creditLimit, uint256 timestamp);
    event Borrowed(address indexed borrower, uint256 amount, uint256 term, uint256 interestRate);
    event Repaid(address indexed borrower, uint256 amount, uint256 interest, bool earlyBonus);
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event CommitmentFeePaid(address indexed borrower, uint256 amount);
    
    constructor(address _verifier, address _usdcToken) Ownable(msg.sender) {
        verifier = IVerifier(_verifier);
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Verify ZK proof và cập nhật credit limit
     * @param a, b, c: ZK proof components
     * @param input: Public inputs (isValid output)
     * @param revenue: Doanh thu (để tính credit limit nếu proof valid)
     */
    function verifyAndUpdateCredit(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input,
        uint256 revenue
    ) external {
        // Verify ZK proof
        require(verifier.verifyProof(a, b, c, input), "Invalid ZK proof");
        
        // Check if proof is valid (input[0] should be 1)
        require(input[0] == 1, "Proof validation failed");
        
        // Calculate credit limit = 30% of revenue
        uint256 newCreditLimit = (revenue * CREDIT_RATIO) / 100;
        
        // Update credit limit
        creditLimit[msg.sender] = newCreditLimit;
        lastCommitmentFeePayment[msg.sender] = block.timestamp;
        
        emit CreditVerified(msg.sender, newCreditLimit, block.timestamp);
    }
    
    /**
     * @notice Tính lãi suất dựa trên kỳ hạn (Reverse Interest Curve)
     * @param termDays: Số ngày vay
     * @return Lãi suất (basis points)
     */
    function getInterestRate(uint256 termDays) public pure returns (uint256) {
        if (termDays <= 30) {
            return SHORT_TERM_RATE; // 5%
        } else if (termDays <= 90) {
            return MEDIUM_TERM_RATE; // 8%
        } else if (termDays <= 180) {
            return LONG_TERM_RATE; // 15%
        } else {
            return VERY_LONG_TERM_RATE; // 25%
        }
    }
    
    /**
     * @notice Tính commitment fee phải trả
     * @param account: Địa chỉ người vay
     * @return Số tiền commitment fee
     */
    function calculateCommitmentFee(address account) public view returns (uint256) {
        if (creditLimit[account] == 0) return 0;
        
        uint256 timeSinceLastPayment = block.timestamp - lastCommitmentFeePayment[account];
        uint256 annualFee = (creditLimit[account] * COMMITMENT_FEE_RATE) / BASIS_POINTS;
        uint256 fee = (annualFee * timeSinceLastPayment) / SECONDS_PER_YEAR;
        
        return fee;
    }
    
    /**
     * @notice Tính lãi phải trả
     * @param account: Địa chỉ người vay
     * @return Số tiền lãi
     */
    function calculateInterest(address account) public view returns (uint256) {
        if (borrowed[account] == 0) return 0;
        
        uint256 principal = borrowed[account];
        uint256 timeElapsed = block.timestamp - borrowTimestamp[account];
        uint256 rate = getInterestRate(borrowTerm[account]);
        
        uint256 annualInterest = (principal * rate) / BASIS_POINTS;
        uint256 interest = (annualInterest * timeElapsed) / SECONDS_PER_YEAR;
        
        return interest;
    }
    
    /**
     * @notice Kiểm tra có được early repayment bonus không
     * @param account: Địa chỉ người vay
     * @return true nếu trả sớm hơn kỳ hạn
     */
    function isEarlyRepayment(address account) public view returns (bool) {
        if (borrowTimestamp[account] == 0) return false;
        
        uint256 timeElapsed = (block.timestamp - borrowTimestamp[account]) / 1 days;
        return timeElapsed < borrowTerm[account];
    }
    
    /**
     * @notice Vay tiền với kỳ hạn cụ thể
     * @param amount: Số tiền muốn vay
     * @param termDays: Kỳ hạn vay (số ngày: 7-365)
     */
    function borrow(uint256 amount, uint256 termDays) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(termDays >= 7 && termDays <= 365, "Invalid term");
        require(borrowed[msg.sender] == 0, "Already have active loan");
        
        // Auto setup for testing if no credit limit
        if (creditLimit[msg.sender] == 0) {
            creditLimit[msg.sender] = amount * 2; // Give 2x credit limit
            lastCommitmentFeePayment[msg.sender] = block.timestamp;
        }
        
        require(
            borrowed[msg.sender] + amount <= creditLimit[msg.sender],
            "Exceeds credit limit"
        );
        
        // Check if contract has enough USDC
        uint256 contractBalance = usdcToken.balanceOf(address(this));
        
        // Auto mint USDC if contract doesn't have enough (for testing only)
        if (contractBalance < amount) {
            uint256 needed = amount * 3; // Mint 3x to have buffer
            
            // Mint USDC directly to this contract
            try IFaucet(address(usdcToken)).faucet(needed) {
                // Faucet successful, update liquidity
                totalLiquidity = usdcToken.balanceOf(address(this));
            } catch {
                revert("Failed to mint USDC - contract has insufficient balance");
            }
        }
        
        // Ensure we still have virtual liquidity tracking
        require(amount <= totalLiquidity, "Insufficient liquidity");
        
        borrowed[msg.sender] = amount;
        borrowTimestamp[msg.sender] = block.timestamp;
        borrowTerm[msg.sender] = termDays;
        totalLiquidity -= amount;
        
        uint256 rate = getInterestRate(termDays);
        
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Borrowed(msg.sender, amount, termDays, rate);
    }
    
    /**
     * @notice Trả nợ (bao gồm cả lãi)
     */
    function repay(uint256 amount) external nonReentrant {
        require(borrowed[msg.sender] > 0, "No active loan");
        
        uint256 principal = borrowed[msg.sender];
        uint256 interest = calculateInterest(msg.sender);
        bool isEarly = isEarlyRepayment(msg.sender);
        
        // Apply early repayment bonus
        if (isEarly) {
            interest = (interest * (BASIS_POINTS - EARLY_REPAY_BONUS)) / BASIS_POINTS;
        }
        
        uint256 totalDebt = principal + interest;
        uint256 repayAmount = (amount == 0) ? totalDebt : amount;
        
        require(repayAmount <= totalDebt, "Amount exceeds total debt");
        require(usdcToken.balanceOf(msg.sender) >= repayAmount, "Insufficient USDC balance");
        require(usdcToken.allowance(msg.sender, address(this)) >= repayAmount, "Insufficient USDC allowance");
        
        // Transfer USDC from user to contract
        require(usdcToken.transferFrom(msg.sender, address(this), repayAmount), "Transfer failed");
        
        // Calculate how much goes to interest and principal
        // Standard practice: Pay interest first, then principal
        uint256 interestPaid;
        uint256 principalPaid;
        
        if (repayAmount >= totalDebt) {
            // Full repayment
            interestPaid = interest;
            principalPaid = principal;
            borrowed[msg.sender] = 0;
            borrowTimestamp[msg.sender] = 0;
            borrowTerm[msg.sender] = 0;
        } else {
            // Partial repayment: pay interest first
            if (repayAmount <= interest) {
                // Payment only covers part of interest
                interestPaid = repayAmount;
                principalPaid = 0;
                // Don't reduce principal, but interest is partially paid
                // Note: This contract doesn't track accrued interest separately,
                // so partial interest payment doesn't reduce future interest
            } else {
                // Payment covers all interest plus some principal
                interestPaid = interest;
                principalPaid = repayAmount - interest;
                borrowed[msg.sender] -= principalPaid;
            }
        }
        
        totalLiquidity += repayAmount;
        
        emit Repaid(msg.sender, principalPaid, interestPaid, isEarly);
    }
    
    /**
     * @notice Repay loan in full (convenience function)
     */
    function repayFull() external nonReentrant {
        require(borrowed[msg.sender] > 0, "No active loan");
        
        uint256 principal = borrowed[msg.sender];
        uint256 interest = calculateInterest(msg.sender);
        bool isEarly = isEarlyRepayment(msg.sender);
        
        if (isEarly) {
            interest = (interest * (BASIS_POINTS - EARLY_REPAY_BONUS)) / BASIS_POINTS;
        }
        
        uint256 totalAmount = principal + interest;
        
        require(usdcToken.balanceOf(msg.sender) >= totalAmount, "Insufficient USDC balance");
        require(usdcToken.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient USDC allowance");
        require(usdcToken.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        
        borrowed[msg.sender] = 0;
        borrowTimestamp[msg.sender] = 0;
        borrowTerm[msg.sender] = 0;
        totalLiquidity += totalAmount;
        
        emit Repaid(msg.sender, principal, interest, isEarly);
    }
    
    /**
     * @notice Trả commitment fee
     */
    function payCommitmentFee() external nonReentrant {
        uint256 fee = calculateCommitmentFee(msg.sender);
        require(fee > 0, "No fee to pay");
        
        require(usdcToken.balanceOf(msg.sender) >= fee, "Insufficient USDC balance");
        require(usdcToken.allowance(msg.sender, address(this)) >= fee, "Insufficient USDC allowance");
        
        require(
            usdcToken.transferFrom(msg.sender, address(this), fee),
            "Transfer failed"
        );
        
        lastCommitmentFeePayment[msg.sender] = block.timestamp;
        totalLiquidity += fee;
        
        emit CommitmentFeePaid(msg.sender, fee);
    }
    
    /**
     * @notice Thêm thanh khoản (liquidity provider)
     * @param amount: Số USDC cung cấp
     */
    function addLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        liquidityProvided[msg.sender] += amount;
        totalLiquidity += amount;
        
        emit LiquidityAdded(msg.sender, amount);
    }
    
    /**
     * @notice Rút thanh khoản
     * @param amount: Số tiền muốn rút
     */
    function removeLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(liquidityProvided[msg.sender] >= amount, "Insufficient balance");
        require(amount <= totalLiquidity, "Insufficient protocol liquidity");
        
        liquidityProvided[msg.sender] -= amount;
        totalLiquidity -= amount;
        
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit LiquidityRemoved(msg.sender, amount);
    }
    
    /**
     * @notice Lấy thông tin tài khoản
     */
    function getAccountInfo(address account) 
        external 
        view 
        returns (
            uint256 _creditLimit,
            uint256 _borrowed,
            uint256 _available,
            uint256 _interest,
            uint256 _commitmentFee,
            uint256 _term,
            uint256 _interestRate,
            bool _isEarly
        ) 
    {
        _creditLimit = creditLimit[account];
        _borrowed = borrowed[account];
        _available = _creditLimit > _borrowed ? _creditLimit - _borrowed : 0;
        _interest = calculateInterest(account);
        _commitmentFee = calculateCommitmentFee(account);
        _term = borrowTerm[account];
        _interestRate = borrowTerm[account] > 0 ? getInterestRate(borrowTerm[account]) : 0;
        _isEarly = isEarlyRepayment(account);
    }
    
    /**
     * @notice Update verifier contract (owner only)
     */
    function updateVerifier(address _verifier) external onlyOwner {
        verifier = IVerifier(_verifier);
    }
    
    /**
     * @notice Update interest rate (owner only) - DEPRECATED
     */
    function updateInterestRate(uint256 _interestRate) external onlyOwner {
        // This function is deprecated as we now use dynamic rates
        revert("Use dynamic interest rates based on term");
    }
}
