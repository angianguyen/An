'use client'

/**
 * Benford Distribution Chart Component
 * Visualizes the first digit distribution vs expected Benford's Law
 */
export default function BenfordChart({ orders }) {
  if (!orders || orders.length === 0) return null

  // Benford's Law expected percentages
  const benfordExpected = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
  
  // Calculate actual distribution
  const firstDigitCounts = new Array(9).fill(0)
  
  orders.forEach(order => {
    const amountStr = Math.abs(order.amount).toString().replace('.', '')
    const firstDigit = parseInt(amountStr.match(/[1-9]/)?.[0] || '0')
    
    if (firstDigit >= 1 && firstDigit <= 9) {
      firstDigitCounts[firstDigit - 1]++
    }
  })
  
  const total = orders.length
  const actualPercentages = firstDigitCounts.map(count => (count / total) * 100)
  
  // Find max for scaling
  const maxValue = Math.max(...actualPercentages, ...benfordExpected)
  
  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-32">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, index) => {
          const actualHeight = (actualPercentages[index] / maxValue) * 100
          const expectedHeight = (benfordExpected[index] / maxValue) * 100
          const diff = Math.abs(actualPercentages[index] - benfordExpected[index])
          const isDeviant = diff > 5 // More than 5% deviation
          
          return (
            <div key={digit} className="flex-1 flex flex-col items-center gap-1">
              {/* Bars */}
              <div className="w-full flex gap-0.5 h-24 items-end">
                {/* Expected (Benford) */}
                <div 
                  className="flex-1 bg-slate-600/50 rounded-t transition-all"
                  style={{ height: `${expectedHeight}%` }}
                  title={`Expected: ${benfordExpected[index]}%`}
                />
                {/* Actual */}
                <div 
                  className={`flex-1 rounded-t transition-all ${
                    isDeviant ? 'bg-red-500/80' : 'bg-cyan-400/80'
                  }`}
                  style={{ height: `${actualHeight}%` }}
                  title={`Actual: ${actualPercentages[index].toFixed(1)}%`}
                />
              </div>
              {/* Digit label */}
              <span className="text-xs text-slate-400">{digit}</span>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-600/50" />
          <span className="text-slate-400">Expected (Benford)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-400/80" />
          <span className="text-slate-400">Actual (Normal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/80" />
          <span className="text-slate-400">Actual (Deviant)</span>
        </div>
      </div>
    </div>
  )
}
