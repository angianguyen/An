/**
 * API Helper for StreamCredit Frontend
 * Provides convenient methods to interact with the mock-api backend
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';

class StreamCreditAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // ===========================
  // DATA ENDPOINTS
  // ===========================

  /**
   * Get honest seller data
   */
  async getHonestData() {
    return this.request(API_ENDPOINTS.HONEST_DATA);
  }

  /**
   * Get fraud seller data
   */
  async getFraudData() {
    return this.request(API_ENDPOINTS.FRAUD_DATA);
  }

  /**
   * Get scenario data by type
   * @param {'HONEST' | 'FRAUD'} scenario
   */
  async getScenarioData(scenario) {
    const endpoint = scenario.toUpperCase() === 'HONEST' 
      ? API_ENDPOINTS.HONEST_DATA 
      : API_ENDPOINTS.FRAUD_DATA;
    return this.request(endpoint);
  }

  // ===========================
  // ANALYSIS ENDPOINTS
  // ===========================

  /**
   * Analyze transactions with Benford's Law
   * @param {number[]} amounts - Array of transaction amounts
   */
  async analyzeBenford(amounts) {
    return this.request(API_ENDPOINTS.BENFORD_ANALYZE, {
      method: 'POST',
      body: JSON.stringify({ amounts }),
    });
  }

  /**
   * Quick fraud check
   * @param {number[]} amounts - Array of transaction amounts
   */
  async quickFraudCheck(amounts) {
    return this.request(API_ENDPOINTS.QUICK_CHECK, {
      method: 'POST',
      body: JSON.stringify({ amounts }),
    });
  }

  // ===========================
  // CREDIT ENDPOINTS
  // ===========================

  /**
   * Full credit evaluation
   * @param {Array<{orderId, amount, timestamp, customerId}>} transactions
   */
  async evaluateCredit(transactions) {
    return this.request(API_ENDPOINTS.CREDIT_EVALUATE, {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }

  /**
   * Quick credit score from amounts only
   * @param {number[]} amounts - Array of transaction amounts
   */
  async quickCreditScore(amounts) {
    return this.request(API_ENDPOINTS.CREDIT_QUICK_SCORE, {
      method: 'POST',
      body: JSON.stringify({ amounts }),
    });
  }

  /**
   * Get demo credit evaluation for a scenario
   * @param {'HONEST' | 'FRAUD'} scenario
   */
  async getCreditDemo(scenario) {
    return this.request(`${API_ENDPOINTS.CREDIT_DEMO}/${scenario.toUpperCase()}`);
  }

  // ===========================
  // WALLET ENDPOINTS
  // ===========================

  /**
   * Get wallet position
   * @param {string} address - Wallet address
   */
  async getWalletPosition(address) {
    return this.request(`${API_ENDPOINTS.WALLET_POSITION}/${address}`);
  }

  /**
   * Borrow against credit limit
   * @param {string} address - Wallet address
   * @param {number} amount - Amount to borrow
   */
  async borrow(address, amount) {
    return this.request(API_ENDPOINTS.WALLET_BORROW, {
      method: 'POST',
      body: JSON.stringify({ address, amount }),
    });
  }

  /**
   * Repay borrowed amount
   * @param {string} address - Wallet address
   * @param {number} amount - Amount to repay
   */
  async repay(address, amount) {
    return this.request(API_ENDPOINTS.WALLET_REPAY, {
      method: 'POST',
      body: JSON.stringify({ address, amount }),
    });
  }

  /**
   * Update credit limit (after ZK verification)
   * @param {string} address - Wallet address
   * @param {number} newLimit - New credit limit (optional)
   * @param {number} increase - Amount to increase (optional)
   */
  async updateCreditLimit(address, { newLimit, increase } = {}) {
    return this.request(API_ENDPOINTS.WALLET_UPDATE_CREDIT, {
      method: 'POST',
      body: JSON.stringify({ address, newLimit, increase }),
    });
  }

  // ===========================
  // ZK PROOF ENDPOINTS
  // ===========================

  /**
   * Generate ZK proof
   * @param {number[]} amounts - Transaction amounts
   * @param {number} revenueThreshold - Minimum revenue threshold
   * @param {number} benfordThreshold - Maximum Benford score threshold
   */
  async generateProof(amounts, revenueThreshold = 10000, benfordThreshold = 20) {
    return this.request(API_ENDPOINTS.ZK_GENERATE_PROOF, {
      method: 'POST',
      body: JSON.stringify({ 
        amounts, 
        revenueThreshold, 
        benfordThreshold 
      }),
    });
  }

  /**
   * Verify ZK proof
   * @param {object} proof - The ZK proof object
   * @param {object} publicInputs - Public inputs
   */
  async verifyProof(proof, publicInputs) {
    return this.request(API_ENDPOINTS.ZK_VERIFY_PROOF, {
      method: 'POST',
      body: JSON.stringify({ proof, publicInputs }),
    });
  }

  // ===========================
  // HEALTH CHECK
  // ===========================

  /**
   * Check API health status
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const api = new StreamCreditAPI();

// Export class for custom instances
export default StreamCreditAPI;
