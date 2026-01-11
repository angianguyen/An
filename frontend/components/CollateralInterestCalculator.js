/**
 * CollateralInterestCalculator Component
 * Hiển thị lãi suất ưu đãi khi có collateral
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  calculateFinalInterestRate, 
  getLTVColor, 
  formatRateComparison,
  COLLATERAL_DISCOUNT_TIERS 
} from '../utils/collateralInterest';

export default function CollateralInterestCalculator({ 
  loanAmount, 
  termDays, 
  userCollaterals = [],
  onCollateralSelect 
}) {
  const [selectedCollateral, setSelectedCollateral] = useState(null);
  const [rateInfo, setRateInfo] = useState(null);

  useEffect(() => {
    if (loanAmount > 0 && termDays > 0) {
      // Convert estimatedValue from 6 decimals (USDC format) to actual value
      const collateralValue = selectedCollateral 
        ? selectedCollateral.estimatedValue / 1e6 
        : 0;
      const info = calculateFinalInterestRate(termDays, loanAmount, collateralValue);
      setRateInfo(info);
    }
  }, [loanAmount, termDays, selectedCollateral]);
  
  // Notify parent when collateral selection changes
  useEffect(() => {
    if (onCollateralSelect) {
      onCollateralSelect(selectedCollateral);
    }
  }, [selectedCollateral, onCollateralSelect]);

  if (!rateInfo) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">💰</span>
        Lãi suất ưu đãi với Collateral
      </h3>

      {/* Collateral Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Chọn tài sản đảm bảo (tuỳ chọn)
        </label>
        <select
          value={selectedCollateral?.tokenId || ''}
          onChange={(e) => {
            const tokenId = e.target.value;
            const collateral = userCollaterals.find(c => c.tokenId.toString() === tokenId);
            setSelectedCollateral(collateral || null);
          }}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-white"
        >
          <option value="">Không dùng collateral</option>
          {userCollaterals.map((col) => (
            <option key={col.tokenId} value={col.tokenId}>
              {col.assetName} - ${(col.estimatedValue / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </option>
          ))}
        </select>
      </div>

      {/* Rate Comparison Card */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Base Rate */}
          <div>
            <p className="text-xs text-slate-400 mb-1">Lãi suất gốc</p>
            <p className="text-2xl font-bold text-slate-300">
              {rateInfo.baseRate}%
            </p>
          </div>

          {/* Final Rate */}
          <div>
            <p className="text-xs text-slate-400 mb-1">Lãi suất thực tế</p>
            <p className="text-2xl font-bold text-cyan-400">
              {rateInfo.finalRate}%
            </p>
          </div>
        </div>

        {/* Discount Badge */}
        {rateInfo.discount > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Chiết khấu collateral</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                -{rateInfo.discount}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* LTV Info */}
      {selectedCollateral && (
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Tỷ lệ LTV (Loan-to-Value)</span>
            <span className={`text-lg font-bold ${getLTVColor(rateInfo.ltv)}`}>
              {(rateInfo.ltv * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {rateInfo.tierDescription}
          </div>
          
          {/* LTV Progress Bar */}
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                rateInfo.ltv < 0.5 ? 'bg-yellow-500' :
                rateInfo.ltv < 0.8 ? 'bg-green-500' :
                rateInfo.ltv < 1.0 ? 'bg-cyan-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(rateInfo.ltv * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Discount Tiers Info */}
      <div className="bg-slate-900/30 rounded-lg p-4">
        <p className="text-xs text-slate-400 mb-3 font-semibold">Bảng chiết khấu theo LTV:</p>
        <div className="space-y-2">
          {COLLATERAL_DISCOUNT_TIERS.slice(1).map((tier) => (
            <div 
              key={tier.name}
              className={`flex items-center justify-between text-xs p-2 rounded ${
                rateInfo.tier === tier.name ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-800/30'
              }`}
            >
              <span className={rateInfo.tier === tier.name ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                {tier.description}
              </span>
              <span className={`font-mono ${rateInfo.tier === tier.name ? 'text-green-400' : 'text-slate-500'}`}>
                -{tier.discount}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Highlight */}
      {rateInfo.savings > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <p className="text-sm text-green-400">
              Bạn tiết kiệm <span className="font-bold">{rateInfo.savings}%</span> lãi suất nhờ collateral!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
