const crypto = require('crypto');

// =============================================
// BENFORD'S LAW ANALYZER
// =============================================
const BENFORD_EXPECTED = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

function calculateBenfordScore(amounts) {
  const digitCounts = new Array(9).fill(0);
  let total = 0;

  amounts.forEach(amount => {
    const amountStr = Math.floor(Math.abs(amount)).toString();
    const firstDigit = parseInt(amountStr[0]);
    if (firstDigit >= 1 && firstDigit <= 9) {
      digitCounts[firstDigit - 1]++;
      total++;
    }
  });

  if (total === 0) return null;

  const observed = digitCounts.map(count => count / total);
  
  let chiSquare = 0;
  for (let i = 0; i < 9; i++) {
    const expected = BENFORD_EXPECTED[i] * total;
    if (expected > 0) {
      chiSquare += Math.pow(digitCounts[i] - expected, 2) / expected;
    }
  }

  const deviations = observed.map((obs, i) => Math.abs(obs - BENFORD_EXPECTED[i]) * 100);
  const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / 9;

  let fraudProbability = 0;
  if (avgDeviation > 10) fraudProbability = 95;
  else if (avgDeviation > 7) fraudProbability = 80;
  else if (avgDeviation > 5) fraudProbability = 60;
  else if (avgDeviation > 3) fraudProbability = 40;
  else if (avgDeviation > 2) fraudProbability = 20;
  else fraudProbability = 5;

  return {
    score: Math.max(0, 100 - fraudProbability),
    fraudProbability,
    chiSquare: chiSquare.toFixed(2),
    avgDeviation: avgDeviation.toFixed(2),
    distribution: {
      expected: BENFORD_EXPECTED,
      observed: observed.map(v => parseFloat(v.toFixed(4))),
      counts: digitCounts
    }
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract path after /.netlify/functions/mock-api
    let path = event.path.replace('/.netlify/functions/mock-api', '');
    // If path doesn't start with /api, it means we're getting it from redirect
    if (!path.startsWith('/api')) {
      path = '/api' + path;
    }
    const method = event.httpMethod;

    console.log('Netlify Function called:', { path, method });

    // POST /api/zk/generate-proof
    if (method === 'POST' && path === '/api/zk/generate-proof') {
      const { amounts, transactions, revenueThreshold = 10000, benfordThreshold = 50 } = JSON.parse(event.body);
      
      const amountList = amounts || (transactions && transactions.map(t => t.amount)) || [];

      if (!amountList || amountList.length < 10) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'At least 10 amounts required for proof generation' })
        };
      }

      const startTime = Date.now();
      const benford = calculateBenfordScore(amountList);
      const totalRevenue = amountList.reduce((sum, a) => sum + a, 0);

      const revenueOk = totalRevenue >= revenueThreshold;
      const benfordOk = benford.fraudProbability <= benfordThreshold;

      if (!revenueOk) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            error: `Revenue constraint failed: $${Math.round(totalRevenue).toLocaleString()} < $${revenueThreshold.toLocaleString()}`,
            generationTimeMs: Date.now() - startTime
          })
        };
      }

      if (!benfordOk) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            error: `Benford constraint failed: ${benford.fraudProbability}% > ${benfordThreshold}%`,
            generationTimeMs: Date.now() - startTime
          })
        };
      }

      // Generate mock Groth16 proof
      const proofHash = crypto.createHash('sha256')
        .update(`${totalRevenue}${benford.score}${Date.now()}`)
        .digest('hex');

      const mockProof = {
        pi_a: [`0x${proofHash.slice(0, 64)}`, `0x${proofHash.slice(32, 64)}0000000000000000`],
        pi_b: [
          [`0x${crypto.randomBytes(32).toString('hex')}`, `0x${crypto.randomBytes(32).toString('hex')}`],
          [`0x${crypto.randomBytes(32).toString('hex')}`, `0x${crypto.randomBytes(32).toString('hex')}`]
        ],
        pi_c: [`0x${crypto.randomBytes(32).toString('hex')}`, `0x${crypto.randomBytes(32).toString('hex')}`],
        protocol: 'groth16',
        curve: 'bn128'
      };

      const publicInputs = {
        revenueThreshold,
        benfordThreshold,
        revenueHash: crypto.createHash('sha256').update(totalRevenue.toString()).digest('hex').slice(0, 16),
        isValid: 1,
        timestamp: Math.floor(Date.now() / 1000)
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          proof: mockProof,
          publicInputs,
          analysis: {
            totalRevenue: Math.round(totalRevenue),
            benfordScore: benford.fraudProbability,
            orderCount: amountList.length
          },
          generationTimeMs: Date.now() - startTime
        })
      };
    }

    // POST /api/analyze/benford
    if (method === 'POST' && path === '/api/analyze/benford') {
      const { amounts, transactions } = JSON.parse(event.body);
      const amountList = amounts || (transactions && transactions.map(t => t.amount)) || [];

      if (!amountList || amountList.length < 10) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'At least 10 amounts required' })
        };
      }

      const result = calculateBenfordScore(amountList);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // GET /api/credit/demo/:scenario
    if (method === 'GET' && path.startsWith('/api/credit/demo/')) {
      const scenario = path.split('/').pop();
      
      const demoData = {
        HONEST: {
          revenue: 150000,
          benfordScore: 8,
          creditLimit: 45000,
          approved: true
        },
        FRAUD: {
          revenue: 50000,
          benfordScore: 85,
          creditLimit: 0,
          approved: false
        }
      };

      const data = demoData[scenario.toUpperCase()];
      if (!data) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Scenario not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
