const snarkjs = require('snarkjs');
const fs = require('fs');

// Hàm tính Benford Score (simplified version)
function calculateBenfordScore(orders) {
    const firstDigitCounts = new Array(9).fill(0);
    const benfordExpected = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
    
    // Đếm chữ số đầu tiên
    orders.forEach(order => {
        const firstDigit = parseInt(order.amount.toString()[0]);
        if (firstDigit >= 1 && firstDigit <= 9) {
            firstDigitCounts[firstDigit - 1]++;
        }
    });
    
    // Tính tỷ lệ phần trăm thực tế
    const total = orders.length;
    const actualPercentages = firstDigitCounts.map(count => (count / total) * 100);
    
    // Tính Chi-square divergence
    let chiSquare = 0;
    for (let i = 0; i < 9; i++) {
        const expected = benfordExpected[i];
        const actual = actualPercentages[i];
        chiSquare += Math.pow(actual - expected, 2) / expected;
    }
    
    // Normalize to 0-100 scale (lower is better)
    const benfordScore = Math.min(100, Math.round(chiSquare * 2));
    return benfordScore;
}

async function generateProof(revenue, benfordScore, revenueThreshold = 10000, fraudThreshold = 15) {
    console.log('📊 Generating ZK Proof...');
    console.log(`   Revenue: $${revenue}`);
    console.log(`   Benford Score: ${benfordScore}`);
    console.log(`   Revenue Threshold: $${revenueThreshold}`);
    console.log(`   Fraud Threshold: ${fraudThreshold}`);
    
    const input = {
        revenue: revenue,
        benfordScore: benfordScore,
        revenueThreshold: revenueThreshold,
        fraudThreshold: fraudThreshold
    };
    
    try {
        // Generate witness
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            'build/creditCheck_js/creditCheck.wasm',
            'build/creditCheck_final.zkey'
        );
        
        console.log('✅ Proof generated successfully!');
        console.log(`   isValid: ${publicSignals[0]}`);
        
        // Save proof and public signals
        fs.writeFileSync('build/proof.json', JSON.stringify(proof, null, 2));
        fs.writeFileSync('build/public.json', JSON.stringify(publicSignals, null, 2));
        
        return { proof, publicSignals };
    } catch (error) {
        console.error('❌ Error generating proof:', error.message);
        throw error;
    }
}

// Example usage
if (require.main === module) {
    // Test với honest data
    const honestRevenue = 50000;
    const honestBenfordScore = 8; // Low score = good
    
    generateProof(honestRevenue, honestBenfordScore)
        .then(() => console.log('✅ Test proof generated!'))
        .catch(err => console.error('❌ Error:', err));
}

module.exports = { generateProof, calculateBenfordScore };
