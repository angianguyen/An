'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  AlertCircle, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function LoanManager() {
  const { account, getAccountInfo, borrow, repay, payCommitmentFee, getInterestRate } = useWeb3();
  const [accountInfo, setAccountInfo] = useState(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [borrowTerm, setBorrowTerm] = useState(30);
  const [selectedRate, setSelectedRate] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Interest rate tiers
  const interestTiers = [
    { days: 7, label: '7 days', rate: 5, color: 'bg-green-500' },
    { days: 30, label: '30 days', rate: 5, color: 'bg-green-500' },
    { days: 60, label: '60 days', rate: 8, color: 'bg-yellow-500' },
    { days: 90, label: '90 days', rate: 8, color: 'bg-yellow-500' },
    { days: 120, label: '120 days', rate: 15, color: 'bg-orange-500' },
    { days: 180, label: '180 days', rate: 15, color: 'bg-orange-500' },
    { days: 365, label: '365 days', rate: 25, color: 'bg-red-500' }
  ];

  // Load account info
  useEffect(() => {
    if (account) {
      loadAccountInfo();
    }
  }, [account]);

  // Update interest rate when term changes
  useEffect(() => {
    const fetchRate = async () => {
      if (borrowTerm > 0) {
        const rate = await getInterestRate(borrowTerm);
        setSelectedRate(rate);
      }
    };
    fetchRate();
  }, [borrowTerm, getInterestRate]);

  const loadAccountInfo = async () => {
    try {
      const info = await getAccountInfo();
      setAccountInfo(info);
    } catch (err) {
      console.error('Failed to load account info:', err);
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(borrowAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (borrowTerm < 7 || borrowTerm > 365) {
        throw new Error('Term must be between 7 and 365 days');
      }

      await borrow(amount, borrowTerm);
      setSuccess(`Successfully borrowed ${amount} USDC for ${borrowTerm} days at ${selectedRate}% APR`);
      setBorrowAmount('');
      await loadAccountInfo();
    } catch (err) {
      setError(err.message || 'Failed to borrow');
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await repay();
      setSuccess(`Successfully repaid ${result.amount.toFixed(2)} USDC${accountInfo?.isEarlyRepayment ? ' with 2% early repayment bonus!' : ''}`);
      await loadAccountInfo();
    } catch (err) {
      setError(err.message || 'Failed to repay');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCommitmentFee = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await payCommitmentFee();
      setSuccess(`Successfully paid commitment fee of ${result.amount.toFixed(4)} USDC`);
      await loadAccountInfo();
    } catch (err) {
      setError(err.message || 'Failed to pay commitment fee');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <Zap className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
          <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-slate-400">Please connect your wallet to manage loans and access DeFi services</p>
        </div>
      </div>
    );
  }

  const totalDebt = accountInfo ? parseFloat(accountInfo.borrowed) + parseFloat(accountInfo.interest) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Loan Management
          </h1>
          <p className="text-slate-400">Manage your credit, loans, and commitment fees</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Credit Limit</p>
                <p className="text-3xl font-bold mt-1">${accountInfo?.creditLimit || '0'}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/20 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Debt</p>
                <p className="text-3xl font-bold mt-1">${totalDebt.toFixed(2)}</p>
                {accountInfo?.interest > 0 && (
                  <p className="text-xs text-purple-100 mt-1">
                    Principal: ${accountInfo.borrowed} | Interest: ${accountInfo.interest}
                  </p>
                )}
              </div>
              <TrendingDown className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Available Credit</p>
                <p className="text-3xl font-bold mt-1">${accountInfo?.available || '0'}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Commitment Fee</p>
                <p className="text-3xl font-bold mt-1">${accountInfo?.commitmentFee || '0'}</p>
                <p className="text-xs text-amber-100 mt-1">0.5% APR on credit limit</p>
              </div>
              <Clock className="w-12 h-12 opacity-30" />
            </div>
          </div>
        </div>

        {/* Active Loan Info */}
        {accountInfo && parseFloat(accountInfo.borrowed) > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-cyan-400" />
              Active Loan Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Loan Term</p>
                <p className="text-3xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                  {accountInfo.term} days
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Interest Rate</p>
                <p className="text-3xl font-bold text-cyan-400">{accountInfo.interestRate}% APR</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Early Repayment</p>
                <p className={`text-2xl font-bold ${accountInfo.isEarlyRepayment ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {accountInfo.isEarlyRepayment ? '✓ 2% Bonus!' : '✗ No Bonus'}
                </p>
              </div>
            </div>

            {accountInfo.isEarlyRepayment && (
              <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Early Repayment Bonus Active! Pay now and save 2% on interest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Borrow Form */}
        {parseFloat(accountInfo?.borrowed || 0) === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-cyan-400" />
              Borrow Funds
            </h3>
            
            {/* Interest Rate Tiers */}
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-4 font-medium">Reverse Interest Curve (shorter term = lower rate):</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {interestTiers.map((tier) => (
                  <button
                    key={tier.days}
                    type="button"
                    onClick={() => setBorrowTerm(tier.days)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      borrowTerm === tier.days
                        ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`${tier.color} text-white text-xs font-bold px-2 py-1 rounded-lg mb-2`}>
                      {tier.rate}% APR
                    </div>
                    <div className="text-sm font-medium text-slate-300">{tier.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBorrow} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="Enter amount"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Loan Term (days)
                </label>
                <input
                type="number"
                min="7"
                max="365"
                value={borrowTerm}
                onChange={(e) => setBorrowTerm(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                disabled={loading}
              />
              <p className="text-sm text-slate-400 mt-2">
                Interest Rate: <span className="font-bold text-cyan-400">{selectedRate}% APR</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !borrowAmount}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Borrow
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Repay Button */}
      {parseFloat(accountInfo?.borrowed || 0) > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-emerald-400" />
            Repay Loan
          </h3>
          <p className="text-slate-400 mb-6">
            Total Amount to Repay: <span className="font-bold text-3xl text-emerald-400 block mt-2">${totalDebt.toFixed(2)} USDC</span>
          </p>
          <button
            onClick={handleRepay}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Repay Full Amount
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Commitment Fee Payment */}
      {parseFloat(accountInfo?.commitmentFee || 0) > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            Commitment Fee
          </h3>
          <p className="text-slate-400 mb-6">
            You have an outstanding commitment fee of <span className="font-bold text-2xl text-amber-400 block mt-2">${accountInfo.commitmentFee} USDC</span>
            <span className="text-sm block mt-2">This fee accrues at 0.5% APR on your credit limit.</span>
          </p>
          <button
            onClick={handlePayCommitmentFee}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay Commitment Fee
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
