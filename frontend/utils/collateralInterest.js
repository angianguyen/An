/**
 * Collateral Interest Rate Calculator
 * Tính lãi suất ưu đãi dựa trên tài sản đảm bảo
 */

/**
 * Base interest rate tiers (same as current system)
 */
export const BASE_INTEREST_TIERS = [
  { minDays: 0, maxDays: 30, rate: 5 },
  { minDays: 31, maxDays: 90, rate: 8 },
  { minDays: 91, maxDays: 180, rate: 15 },
  { minDays: 181, maxDays: 365, rate: 25 }
];

/**
 * Collateral discount tiers based on LTV (Loan-to-Value ratio)
 * LTV = Loan Amount / Collateral Value
 */
export const COLLATERAL_DISCOUNT_TIERS = [
  { 
    name: 'No Collateral', 
    minLTV: 0, 
    maxLTV: 0, 
    discount: 0,
    description: 'Không có tài sản đảm bảo'
  },
  { 
    name: 'Low Collateral', 
    minLTV: 0.01, 
    maxLTV: 0.5, 
    discount: 1,
    description: 'Tài sản thấp (< 50% giá trị vay)'
  },
  { 
    name: 'Medium Collateral', 
    minLTV: 0.51, 
    maxLTV: 0.8, 
    discount: 2,
    description: 'Tài sản trung bình (50-80% giá trị vay)'
  },
  { 
    name: 'High Collateral', 
    minLTV: 0.81, 
    maxLTV: 1.0, 
    discount: 3,
    description: 'Tài sản cao (80-100% giá trị vay)'
  },
  { 
    name: 'Over-Collateralized', 
    minLTV: 1.01, 
    maxLTV: Infinity, 
    discount: 4,
    description: 'Tài sản thừa (> 100% giá trị vay)'
  }
];

/**
 * Get base interest rate for a loan term
 * @param {number} termDays - Loan term in days
 * @returns {number} Base interest rate (%)
 */
export function getBaseInterestRate(termDays) {
  const tier = BASE_INTEREST_TIERS.find(
    t => termDays >= t.minDays && termDays <= t.maxDays
  );
  return tier ? tier.rate : 25; // Default to highest rate if out of range
}

/**
 * Calculate LTV (Loan-to-Value) ratio
 * @param {number} loanAmount - Amount being borrowed (USDC)
 * @param {number} collateralValue - Estimated value of collateral (USDC)
 * @returns {number} LTV ratio (0 to Infinity)
 */
export function calculateLTV(loanAmount, collateralValue) {
  if (collateralValue === 0) return 0;
  return loanAmount / collateralValue;
}

/**
 * Get collateral discount based on LTV
 * @param {number} ltv - Loan-to-Value ratio
 * @returns {object} Discount tier info { name, discount, description }
 */
export function getCollateralDiscount(ltv) {
  const tier = COLLATERAL_DISCOUNT_TIERS.find(
    t => ltv >= t.minLTV && ltv <= t.maxLTV
  );
  return tier || COLLATERAL_DISCOUNT_TIERS[0]; // Default to no collateral
}

/**
 * Calculate final interest rate with collateral discount
 * @param {number} termDays - Loan term in days
 * @param {number} loanAmount - Amount being borrowed (USDC)
 * @param {number} collateralValue - Estimated value of collateral (USDC, default 0)
 * @returns {object} { baseRate, discount, finalRate, ltv, tier }
 */
export function calculateFinalInterestRate(termDays, loanAmount, collateralValue = 0) {
  const baseRate = getBaseInterestRate(termDays);
  const ltv = calculateLTV(loanAmount, collateralValue);
  const tier = getCollateralDiscount(ltv);
  
  const finalRate = Math.max(baseRate - tier.discount, 1); // Minimum 1% rate
  
  return {
    baseRate,
    discount: tier.discount,
    finalRate,
    ltv: ltv.toFixed(2),
    tier: tier.name,
    tierDescription: tier.description,
    hasCollateral: collateralValue > 0,
    savings: tier.discount // How much % saved
  };
}

/**
 * Calculate interest amount for display
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate (%)
 * @param {number} termDays - Loan term in days
 * @returns {number} Interest amount in same currency as principal
 */
export function calculateInterestAmount(principal, rate, termDays) {
  // Simple interest: I = P * R * T
  // T in years: termDays / 365
  return (principal * (rate / 100) * (termDays / 365));
}

/**
 * Get color class for LTV ratio (for UI)
 * @param {number} ltv - Loan-to-Value ratio
 * @returns {string} Tailwind color class
 */
export function getLTVColor(ltv) {
  if (ltv === 0) return 'text-slate-400';
  if (ltv < 0.5) return 'text-yellow-400';
  if (ltv < 0.8) return 'text-green-400';
  if (ltv < 1.0) return 'text-cyan-400';
  return 'text-blue-400'; // Over-collateralized
}

/**
 * Format interest rate comparison for display
 * @param {object} rateInfo - Output from calculateFinalInterestRate
 * @returns {string} Formatted text like "8% → 5% (save 3%)"
 */
export function formatRateComparison(rateInfo) {
  if (rateInfo.discount === 0) {
    return `${rateInfo.baseRate}%`;
  }
  return `${rateInfo.baseRate}% → ${rateInfo.finalRate}% (tiết kiệm ${rateInfo.savings}%)`;
}
