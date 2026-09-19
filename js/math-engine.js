/**
 * Vednova Financial Math Engine
 * Standard: 365-day basis irregular cash-flow XIRR, incremental yields,
 * surrender threshold (S) solver, and Savings-to-SIP compounding.
 * 
 * Fiduciary Rule: All math is deterministic and auditable.
 */

const VednovaMath = {
  /**
   * Exact 365-day XIRR solver using Newton-Raphson with Bisection fallback.
   * Cash flows format: [{ date: 'YYYY-MM-DD' or Date, amount: Number }]
   * Outflows are negative, inflows are positive.
   */
  calculateXIRR(cashFlows, guess = 0.08) {
    if (!cashFlows || cashFlows.length < 2) return null;

    // Filter and sanitize flows
    const flows = cashFlows
      .map(cf => ({
        date: new Date(cf.date),
        amount: Number(cf.amount)
      }))
      .filter(cf => !isNaN(cf.date.getTime()) && !isNaN(cf.amount) && cf.amount !== 0)
      .sort((a, b) => a.date - b.date);

    if (flows.length < 2) return null;

    // Check for sign change
    let hasPositive = false;
    let hasNegative = false;
    flows.forEach(f => {
      if (f.amount > 0) hasPositive = true;
      if (f.amount < 0) hasNegative = true;
    });
    if (!hasPositive || !hasNegative) return null;

    const startDate = flows[0].date;

    // Days from start
    const datedFlows = flows.map(f => ({
      days: (f.date - startDate) / (1000 * 60 * 60 * 24),
      amount: f.amount
    }));

    // NPV function
    function npv(rate) {
      if (rate <= -1.0) return Infinity;
      return datedFlows.reduce((acc, f) => {
        return acc + f.amount / Math.pow(1 + rate, f.days / 365.0);
      }, 0);
    }

    // Derivative of NPV with respect to rate
    function npvDerivative(rate) {
      if (rate <= -1.0) return Infinity;
      return datedFlows.reduce((acc, f) => {
        const t = f.days / 365.0;
        return acc - (t * f.amount) / Math.pow(1 + rate, t + 1);
      }, 0);
    }

    // Newton-Raphson iteration
    let rate = guess;
    const maxIterations = 100;
    const tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
      const fVal = npv(rate);
      const fPrime = npvDerivative(rate);

      if (Math.abs(fVal) < tolerance) {
        return rate;
      }

      if (Math.abs(fPrime) < 1e-12) {
        break; // Newton fails, fallback to bisection
      }

      const nextRate = rate - fVal / fPrime;
      if (nextRate <= -0.999 || isNaN(nextRate) || !isFinite(nextRate)) {
        break;
      }

      if (Math.abs(nextRate - rate) < tolerance) {
        return nextRate;
      }

      rate = nextRate;
    }

    // Bisection Fallback (-99% to +1000%)
    let low = -0.99;
    let high = 10.0;
    let fLow = npv(low);
    let fHigh = npv(high);

    if (fLow * fHigh > 0) {
      high = 50.0;
      fHigh = npv(high);
      if (fLow * fHigh > 0) return null;
    }

    for (let i = 0; i < 150; i++) {
      const mid = (low + high) / 2;
      const fMid = npv(mid);

      if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
        return mid;
      }

      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }

    return (low + high) / 2;
  },

  /**
   * Incremental Cash Flow calculation
   * Incremental Flows = Continue Flows - Paid-up Flows (date by date)
   */
  getIncrementalFlows(continueFlows, paidUpFlows) {
    const map = new Map();

    (continueFlows || []).forEach(cf => {
      const d = typeof cf.date === 'string' ? cf.date : cf.date.toISOString().split('T')[0];
      map.set(d, (map.get(d) || 0) + Number(cf.amount));
    });

    (paidUpFlows || []).forEach(cf => {
      const d = typeof cf.date === 'string' ? cf.date : cf.date.toISOString().split('T')[0];
      map.set(d, (map.get(d) || 0) - Number(cf.amount));
    });

    return Array.from(map.entries())
      .map(([date, amount]) => ({ date, amount }))
      .filter(f => Math.abs(f.amount) > 0.01)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  /**
   * Surrender Hurdle (S) Solver:
   * Finds the net surrender value today 'S' required for Surrender + Equity Reinvestment
   * to beat both Continuation and Paid-Up options at specified hurdle rates (6%, 8%, 10%, 12%).
   */
  calculateSurrenderHurdle(params) {
    const {
      guaranteedTerminalWealth,
      paidUpTerminalWealth,
      remainingPremiums,
      maturityDate,
      reviewDate = new Date(),
      hurdleRate = 0.08,
      taxRate = 0.13,
      mgmtFee = 0.01
    } = params;

    const netGrowthRate = (1 + hurdleRate) * (1 - mgmtFee) - 1;
    const targetDate = new Date(maturityDate);
    const today = new Date(reviewDate);
    const yearsToMaturity = (targetDate - today) / (1000 * 60 * 60 * 24 * 365.25);

    const rawGrowthMultiplier = Math.pow(1 + netGrowthRate, yearsToMaturity);
    const sTerminalMultiplier = 1 + (rawGrowthMultiplier - 1) * (1 - taxRate);

    let investedAvoidedPremiums = 0;
    (remainingPremiums || []).forEach(p => {
      const pDate = new Date(p.date);
      if (pDate >= today && pDate <= targetDate) {
        const t = (targetDate - pDate) / (1000 * 60 * 60 * 24 * 365.25);
        const g = Math.pow(1 + netGrowthRate, t);
        const postTaxG = 1 + (g - 1) * (1 - taxRate);
        investedAvoidedPremiums += p.amount * postTaxG;
      }
    });

    const paidUpPlusInvested = paidUpTerminalWealth + investedAvoidedPremiums;
    const benchmarkToBeat = Math.max(guaranteedTerminalWealth, paidUpPlusInvested);
    const netSurrenderRequired = Math.max(0, (benchmarkToBeat - investedAvoidedPremiums) / sTerminalMultiplier);

    return {
      hurdleRate,
      netGrowthRate,
      yearsToMaturity,
      sTerminalMultiplier,
      investedAvoidedPremiums,
      paidUpPlusInvested,
      benchmarkToBeat,
      netSurrenderRequired
    };
  },

  /**
   * "Savings-to-SIP" Compounding Projector
   * Models the future wealth if annual avoided premiums are redirected into a monthly SIP.
   */
  projectSIP(annualSaving, returnRate = 0.12, years = [5, 10, 15, 20]) {
    const monthlySIP = Math.round(annualSaving / 12);
    const monthlyRate = Math.pow(1 + returnRate, 1 / 12) - 1;

    const results = years.map(yr => {
      const months = yr * 12;
      const futureValue = monthlySIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const totalInvested = monthlySIP * months;
      const estimatedGain = futureValue - totalInvested;

      return {
        years: yr,
        monthlySIP,
        totalInvested: Math.round(totalInvested),
        estimatedGain: Math.round(estimatedGain),
        futureValue: Math.round(futureValue)
      };
    });

    return {
      annualSaving,
      monthlySIP,
      returnRate,
      projections: results
    };
  },

  
  /**
   * SGB (Sovereign Gold Bond) vs Gold Insurance Policy Comparison
   * SGB: 2.50% annual coupon paid semi-annually + gold appreciation + 100% tax-free at maturity
   */
  compareGoldOptions(params) {
    const {
      annualInvestment = 300000,
      tenureYears = 10,
      policyGuaranteedMaturity = 3000000,
      policySurvivalAnnual = 50250,
      goldAppreciationRate = 0.08 // Historical 8-10% CAGR
    } = params;

    // SGB: 2.5% coupon + 8% gold capital appreciation = ~10.5% annualized return
    const sgbCouponRate = 0.025;
    const sgbTotalRate = sgbCouponRate + goldAppreciationRate;
    
    // Future value of SGB SIP
    let sgbTerminalWealth = 0;
    for (let yr = 0; yr < tenureYears; yr++) {
      const remainingYears = tenureYears - yr;
      sgbTerminalWealth += annualInvestment * Math.pow(1 + sgbTotalRate, remainingYears);
    }

    // Gold ETF / FoF: ~8% gold appreciation minus 0.3% TER = 7.7% net, zero lock-in
    const etfRate = goldAppreciationRate - 0.003;
    let etfTerminalWealth = 0;
    for (let yr = 0; yr < tenureYears; yr++) {
      const remainingYears = tenureYears - yr;
      etfTerminalWealth += annualInvestment * Math.pow(1 + etfRate, remainingYears);
    }

    // Traditional Insurance Gold Policy (e.g. ICICI Pru Gold)
    const policyInceptionXIRR = 0.0150;
    const policyIllustratedXIRR = 0.0328; // at 4% statutory illustration

    return {
      tenureYears,
      annualInvestment,
      sgb: {
        name: 'Sovereign Gold Bonds (SGB)',
        couponRate: '2.50% p.a. (Semi-annual payout)',
        terminalWealth: Math.round(sgbTerminalWealth),
        effectiveReturn: '10.50% (Tax-Free at maturity)',
        lockIn: '8 Years (Tradable on NSE/BSE from Year 5)',
        capitalGainsTax: '100% Tax-Free under Section 47(viic)'
      },
      goldETF: {
        name: 'Gold ETFs / Gold Mutual Funds',
        couponRate: 'None (Pure 99.5% Gold NAV tracking)',
        terminalWealth: Math.round(etfTerminalWealth),
        effectiveReturn: '7.70% Net CAGR',
        lockIn: 'ZERO (Liquid, T+1 settlement)',
        capitalGainsTax: 'Taxed at investor marginal slab'
      },
      insurancePolicy: {
        name: 'Traditional Gold Insurance Policy',
        guaranteedReturn: '1.50% (Contractual Floor)',
        illustratedReturn: '3.28% (At 4% illustration)',
        lockIn: '34 Years (Draconian Lock-in)',
        surrenderPenalty: 'Heavy early-exit loss',
        verdict: 'Sub-Optimal for both Gold exposure and Investment'
      }
    };
  },

  formatINR(amount, compact = false) {
    if (amount === null || amount === undefined || isNaN(amount)) return '—';
    const num = Number(amount);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);

    if (compact) {
      if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
      if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}k`;
    }

    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  },

  formatPercent(rate, decimals = 2) {
    if (rate === null || rate === undefined || isNaN(rate)) return '—';
    return `${(rate * 100).toFixed(decimals)}%`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VednovaMath;
}
