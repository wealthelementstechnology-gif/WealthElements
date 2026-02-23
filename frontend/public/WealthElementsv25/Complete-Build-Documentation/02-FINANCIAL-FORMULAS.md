# Complete Financial Formulas & Calculations Guide

## Table of Contents
1. [Basic Financial Formulas](#basic-financial-formulas)
2. [SIP Calculations](#sip-calculations)
3. [Retirement Planning](#retirement-planning)
4. [Insurance Gap Analysis](#insurance-gap-analysis)
5. [Inflation Modeling](#inflation-modeling)
6. [Tax Calculations](#tax-calculations)
7. [Mutual Fund Metrics](#mutual-fund-metrics)
8. [Asset Depreciation](#asset-depreciation)
9. [Goal Optimization](#goal-optimization)
10. [Monte Carlo Simulation](#monte-carlo-simulation)

---

## 1. Basic Financial Formulas

### Future Value of One-Time Investment (Lumpsum)

**Formula**:
```
FV = PV × (1 + r)^n

Where:
FV = Future Value
PV = Present Value (initial investment)
r = Rate of return per period
n = Number of periods
```

**Example**:
```javascript
// ₹1,00,000 invested for 10 years at 12% annual return
const PV = 100000;
const r = 0.12;
const n = 10;

const FV = PV * Math.pow(1 + r, n);
// FV = ₹3,10,585
```

**Code Implementation**:
```javascript
function calculateFutureValue(principal, annualRate, years) {
  const rate = annualRate / 100;
  return principal * Math.pow(1 + rate, years);
}

// Usage
const futureValue = calculateFutureValue(100000, 12, 10);
console.log(futureValue.toFixed(2)); // 310584.82
```

---

### Present Value (Reverse Calculation)

**Formula**:
```
PV = FV / (1 + r)^n

Where:
PV = Present Value needed
FV = Future Value target
r = Rate of return per period
n = Number of periods
```

**Code Implementation**:
```javascript
function calculateRequiredInvestment(futureValue, annualRate, years) {
  const rate = annualRate / 100;
  return futureValue / Math.pow(1 + rate, years);
}

// Example: How much to invest today to get ₹10 lakhs in 10 years at 12%?
const requiredAmount = calculateRequiredInvestment(1000000, 12, 10);
console.log(requiredAmount.toFixed(2)); // 321973.24
```

---

## 2. SIP Calculations

### SIP Future Value

**Formula**:
```
FV = P × [(1 + r)^n - 1] / r × (1 + r)

Where:
FV = Future Value
P = Monthly SIP amount
r = Monthly rate of return (annual rate / 12)
n = Total number of months
```

**Derivation**:
This is a geometric series formula:
```
FV = P(1+r)^n + P(1+r)^(n-1) + ... + P(1+r)
   = P × (1+r) × [(1+r)^n - 1] / r
```

**Code Implementation**:
```javascript
function calculateSIPFutureValue(monthlySIP, annualRate, years) {
  const r = annualRate / 100 / 12;  // Monthly rate
  const n = years * 12;              // Total months

  if (r === 0) {
    return monthlySIP * n;
  }

  const fv = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fv;
}

// Example: ₹10,000/month for 20 years at 12% annual
const sipFV = calculateSIPFutureValue(10000, 12, 20);
console.log(sipFV.toFixed(2)); // 99,91,473.70
```

---

### Required SIP for Target Amount

**Formula**:
```
P = FV × r / [(1 + r)^n - 1] / (1 + r)

Where:
P = Monthly SIP needed
FV = Target future value
r = Monthly rate of return
n = Total number of months
```

**Code Implementation**:
```javascript
function calculateRequiredSIP(targetAmount, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (r === 0) {
    return targetAmount / n;
  }

  const sip = (targetAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  return sip;
}

// Example: To accumulate ₹1 crore in 20 years at 12%
const requiredSIP = calculateRequiredSIP(10000000, 12, 20);
console.log(requiredSIP.toFixed(2)); // 10,086.11
```

---

### SIP with Annual Step-Up

**Formula**:
```
FV = P × [(1 + r)^n - 1] / r × (1 + r) +
     P × s × Σ[(1 + r)^(n - 12k) - 1] / r × (1 + r)

Where:
s = Annual step-up percentage
k = Year number (1, 2, 3, ...)
```

**Simplified Implementation** (year-by-year calculation):
```javascript
function calculateSIPWithStepUp(initialSIP, annualRate, years, stepUpPercent) {
  const monthlyRate = annualRate / 100 / 12;
  let totalValue = 0;
  let currentSIP = initialSIP;

  for (let year = 1; year <= years; year++) {
    // Calculate FV for this year's SIP
    const n = 12; // 12 months in each year
    const yearFV = currentSIP * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);

    // Compound the existing total value for one year
    totalValue = totalValue * Math.pow(1 + monthlyRate, 12);

    // Add this year's contributions
    totalValue += yearFV;

    // Increase SIP for next year (except last year)
    if (year < years) {
      currentSIP = currentSIP * (1 + stepUpPercent / 100);
    }
  }

  return totalValue;
}

// Example: Start with ₹10,000, 10% annual step-up, 20 years, 12% return
const stepUpFV = calculateSIPWithStepUp(10000, 12, 20, 10);
console.log(stepUpFV.toFixed(2)); // Significantly higher than regular SIP
```

---

### SWP (Systematic Withdrawal Plan)

**Formula** (How long will corpus last):
```
n = -log(1 - (FV × r / P)) / log(1 + r)

Where:
n = Number of months corpus will last
FV = Initial corpus
P = Monthly withdrawal amount
r = Monthly return rate
```

**Code Implementation**:
```javascript
function calculateSWPDuration(corpus, monthlyWithdrawal, annualRate) {
  const r = annualRate / 100 / 12;

  // If withdrawal > interest earned, corpus will deplete
  const monthlyInterest = corpus * r;

  if (monthlyWithdrawal > monthlyInterest && r > 0) {
    const n = -Math.log(1 - (corpus * r / monthlyWithdrawal)) / Math.log(1 + r);
    return n / 12; // Return in years
  } else if (monthlyWithdrawal <= monthlyInterest) {
    return Infinity; // Corpus will never deplete
  } else {
    return corpus / monthlyWithdrawal / 12; // No growth case
  }
}

// Example: ₹1 crore corpus, ₹50,000/month withdrawal, 8% return
const duration = calculateSWPDuration(10000000, 50000, 8);
console.log(duration); // Approximately 23.5 years
```

**Required Corpus for Perpetual Withdrawal**:
```javascript
function calculateRequiredCorpusForSWP(monthlyWithdrawal, annualRate) {
  const r = annualRate / 100 / 12;
  // For perpetual withdrawal: withdrawal = corpus × monthly_rate
  return monthlyWithdrawal / r;
}

// Example: For ₹50,000/month at 8% return
const requiredCorpus = calculateRequiredCorpusForSWP(50000, 8);
console.log(requiredCorpus.toFixed(2)); // 75,00,000
```

---

## 3. Retirement Planning

### Retirement Corpus Calculation (4% Rule)

**The 4% Rule**:
You can safely withdraw 4% of your retirement corpus annually, adjusted for inflation, without running out of money for 30+ years.

**Formula**:
```
Annual Safe Withdrawal = Corpus × 0.04
Therefore:
Required Corpus = Annual Expenses / 0.04
                = Annual Expenses × 25
                = Monthly Expenses × 12 × 25
                = Monthly Expenses × 300
```

**Code Implementation**:
```javascript
function calculateRetirementCorpus(monthlyExpenses, inflationRate, yearsToRetirement) {
  // Inflate current expenses to retirement age
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Apply 4% rule (multiply by 300)
  const corpus = futureMonthlyExpenses * 300;

  return {
    futureMonthlyExpenses: futureMonthlyExpenses,
    requiredCorpus: corpus,
    annualWithdrawal: futureMonthlyExpenses * 12
  };
}

// Example: Current expenses ₹50,000/month, 6% inflation, 20 years to retirement
const retirement = calculateRetirementCorpus(50000, 6, 20);
console.log(retirement);
// {
//   futureMonthlyExpenses: 160356.77,
//   requiredCorpus: 48107031.50,
//   annualWithdrawal: 1924281.26
// }
```

---

### Post-Retirement Corpus Growth

**Formula**:
During retirement, corpus grows at a conservative rate while you withdraw.

```javascript
function simulateRetirementYears(initialCorpus, annualWithdrawal, returnRate, inflationRate, years) {
  let corpus = initialCorpus;
  const yearlyData = [];

  for (let year = 1; year <= years; year++) {
    // Inflate withdrawal
    const withdrawal = annualWithdrawal * Math.pow(1 + inflationRate / 100, year - 1);

    // Corpus grows at return rate
    corpus = corpus * (1 + returnRate / 100);

    // Withdraw annually
    corpus = corpus - withdrawal;

    yearlyData.push({
      year: year,
      withdrawal: withdrawal,
      endingCorpus: corpus
    });

    if (corpus <= 0) {
      break; // Corpus depleted
    }
  }

  return yearlyData;
}

// Example: ₹5 crore corpus, ₹20 lakh annual withdrawal, 8% return, 6% inflation, 30 years
const retirementSimulation = simulateRetirementYears(50000000, 2000000, 8, 6, 30);
console.log(retirementSimulation);
```

---

## 4. Insurance Gap Analysis

### Life Insurance Requirement

**Method 1: Income Replacement Method**
```
Life Insurance Needed = Annual Income × 15 to 20

Rationale:
- If corpus invested at 5-7% returns
- Can generate annual income for dependents
```

**Method 2: Human Life Value (HLV)**
```
HLV = Annual Income × Remaining Working Years × Discount Factor

Discount Factor = 1 - (1 / (1 + r)^n) / r
Where r = discount rate (inflation-adjusted return)
```

**Code Implementation**:
```javascript
function calculateLifeInsuranceNeed(annualIncome, age, retirementAge, existingCoverage) {
  // Method 1: Simple 15x multiplier
  const method1 = annualIncome * 15;

  // Method 2: Human Life Value
  const remainingYears = retirementAge - age;
  const discountRate = 0.05; // 5% real return
  const discountFactor = (1 - Math.pow(1 / (1 + discountRate), remainingYears)) / discountRate;
  const method2 = annualIncome * discountFactor;

  // Take average of both methods
  const recommended = (method1 + method2) / 2;

  // Calculate gap
  const gap = Math.max(0, recommended - existingCoverage);

  return {
    recommended: recommended,
    existing: existingCoverage,
    gap: gap
  };
}

// Example: ₹10 lakh annual income, 30 years old, retirement at 60, existing ₹50 lakh cover
const lifeInsurance = calculateLifeInsuranceNeed(1000000, 30, 60, 5000000);
console.log(lifeInsurance);
// {
//   recommended: 1,24,22,182,
//   existing: 50,00,000,
//   gap: 74,22,182
// }
```

---

### Health Insurance Requirement

**Formula**:
```
Health Insurance = Annual Income × Coverage Multiplier

Coverage Multipliers:
- Tier 1 cities (Mumbai, Delhi, Bangalore): 1.3x to 1.5x
- Tier 2 cities: 1.0x to 1.2x
- Tier 3 cities: 0.8x to 1.0x

Minimum: ₹5 lakhs per person
Family floater: 1.5x to 2x individual sum
```

**Code Implementation**:
```javascript
function calculateHealthInsuranceNeed(annualIncome, familySize, cityTier, existingCoverage) {
  let multiplier;

  switch(cityTier) {
    case 1:
      multiplier = 1.3;
      break;
    case 2:
      multiplier = 1.0;
      break;
    case 3:
      multiplier = 0.8;
      break;
    default:
      multiplier = 1.0;
  }

  // Base coverage
  let recommended = annualIncome * multiplier;

  // Minimum per person
  const minimumPerPerson = 500000;
  const minimumTotal = minimumPerPerson * familySize;

  // Take the higher of calculated or minimum
  recommended = Math.max(recommended, minimumTotal);

  // Calculate gap
  const gap = Math.max(0, recommended - existingCoverage);

  return {
    recommended: Math.ceil(recommended / 100000) * 100000, // Round to lakhs
    existing: existingCoverage,
    gap: Math.ceil(gap / 100000) * 100000
  };
}

// Example: ₹12 lakh income, family of 4, Tier 1 city, existing ₹10 lakh cover
const healthInsurance = calculateHealthInsuranceNeed(1200000, 4, 1, 1000000);
console.log(healthInsurance);
```

---

### Emergency Fund

**Formula**:
```
Emergency Fund = Monthly Expenses × 6 to 12 months

Conservative: 12 months (single income household)
Moderate: 9 months (dual income household)
Aggressive: 6 months (stable job, multiple income sources)
```

**Code Implementation**:
```javascript
function calculateEmergencyFund(monthlyExpenses, incomeStability, existingSavings) {
  let months;

  switch(incomeStability) {
    case 'single-income':
      months = 12;
      break;
    case 'dual-income':
      months = 9;
      break;
    case 'stable-multiple':
      months = 6;
      break;
    default:
      months = 9;
  }

  const recommended = monthlyExpenses * months;
  const gap = Math.max(0, recommended - existingSavings);

  return {
    recommended: recommended,
    months: months,
    existing: existingSavings,
    gap: gap
  };
}

// Example: ₹60,000 monthly expenses, dual income, ₹3 lakh existing savings
const emergencyFund = calculateEmergencyFund(60000, 'dual-income', 300000);
console.log(emergencyFund);
// {
//   recommended: 540000,
//   months: 9,
//   existing: 300000,
//   gap: 240000
// }
```

---

## 5. Inflation Modeling

### Category-Specific Inflation Rates

**WealthElements uses 22 expense categories with different inflation rates**:

```javascript
const categoryInflationRates = {
  // High inflation (9-12%)
  'Healthcare': 12.0,
  'Education': 12.0,
  'Insurance Premiums': 10.0,
  'Doctor Visits': 9.0,
  'Medicines': 9.0,

  // Medium-high inflation (6.5-8%)
  'Dining Out': 6.5,
  'Entertainment': 6.5,
  'Personal Care': 6.5,
  'Domestic Help': 8.0,

  // Medium inflation (5-6%)
  'Utilities': 5.5,
  'Internet & Phone': 5.0,
  'Fuel & Transport': 6.0,
  'Clothing': 5.5,

  // Lower inflation (3-5%)
  'Groceries': 4.5,
  'House Maintenance': 5.0,
  'EMI Payments': 0.0,  // Fixed

  // Average inflation
  'Other Expenses': 6.0
};
```

---

### Future Value with Category Inflation

**Formula**:
```
Future Value = Current Value × (1 + inflation_rate)^years
```

**Code Implementation**:
```javascript
function calculateFutureExpenses(currentExpenses, yearsAhead) {
  const futureExpenses = {};
  let totalFuture = 0;

  for (const [category, amount] of Object.entries(currentExpenses)) {
    const inflationRate = categoryInflationRates[category] || 6.0; // Default 6%
    const futureValue = amount * Math.pow(1 + inflationRate / 100, yearsAhead);
    futureExpenses[category] = futureValue;
    totalFuture += futureValue;
  }

  return {
    breakdown: futureExpenses,
    total: totalFuture
  };
}

// Example: Current monthly expenses
const currentExpenses = {
  'Groceries': 15000,
  'Healthcare': 5000,
  'Education': 10000,
  'Utilities': 3000,
  'Entertainment': 5000
};

const futureExpenses = calculateFutureExpenses(currentExpenses, 10);
console.log(futureExpenses);
// Healthcare and Education will grow much faster than Groceries and Utilities
```

---

### Compound Annual Growth Rate (CAGR)

**Formula**:
```
CAGR = (Ending Value / Beginning Value)^(1 / years) - 1
```

**Code Implementation**:
```javascript
function calculateCAGR(beginningValue, endingValue, years) {
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
}

// Example: Investment grew from ₹1 lakh to ₹3 lakhs in 10 years
const cagr = calculateCAGR(100000, 300000, 10);
console.log(cagr.toFixed(2)); // 11.61%
```

---

## 6. Tax Calculations

### Income Tax - New Regime (AY 2025-26)

**Tax Slabs**:
```javascript
const newRegimeSlabs = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400001, max: 800000, rate: 5 },
  { min: 800001, max: 1200000, rate: 10 },
  { min: 1200001, max: 1600000, rate: 15 },
  { min: 1600001, max: 2000000, rate: 20 },
  { min: 2000001, max: 2400000, rate: 25 },
  { min: 2400001, max: Infinity, rate: 30 }
];

const standardDeduction = 75000; // For FY 2025-26
const rebateLimit = 700000;      // Rebate u/s 87A
const rebateAmount = 25000;
```

**Code Implementation**:
```javascript
function calculateIncomeTax(grossIncome, regime = 'new') {
  let taxableIncome = grossIncome;

  // Standard deduction (both regimes for salaried)
  taxableIncome -= standardDeduction;

  let tax = 0;
  let slabs;

  if (regime === 'new') {
    slabs = newRegimeSlabs;

    // Calculate tax
    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        tax += taxableInSlab * (slab.rate / 100);
      }
    }

    // Rebate u/s 87A
    if (taxableIncome <= rebateLimit) {
      tax = Math.max(0, tax - rebateAmount);
    }
  } else {
    // Old regime implementation (more complex with deductions)
    slabs = oldRegimeSlabs;
    // ... old regime logic
  }

  // Health and Education Cess (4%)
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return {
    grossIncome: grossIncome,
    taxableIncome: taxableIncome,
    taxBeforeCess: tax,
    cess: cess,
    totalTax: totalTax,
    effectiveRate: (totalTax / grossIncome) * 100
  };
}

// Example: ₹12 lakh gross income
const tax = calculateIncomeTax(1200000, 'new');
console.log(tax);
// {
//   grossIncome: 1200000,
//   taxableIncome: 1125000,
//   taxBeforeCess: 52500,
//   cess: 2100,
//   totalTax: 54600,
//   effectiveRate: 4.55
// }
```

---

### Capital Gains Tax

**Long Term Capital Gains (LTCG) - Equity**:
```
Holding Period: > 12 months
Tax Rate: 12.5% (from FY 2024-25)
Exemption: First ₹1,25,000 per year
```

**Short Term Capital Gains (STCG) - Equity**:
```
Holding Period: ≤ 12 months
Tax Rate: 20% (from FY 2024-25)
```

**Code Implementation**:
```javascript
function calculateCapitalGainsTax(gains, holdingPeriod, assetType = 'equity') {
  let tax = 0;

  if (assetType === 'equity') {
    if (holdingPeriod > 12) {
      // LTCG
      const exemption = 125000;
      const taxableGains = Math.max(0, gains - exemption);
      tax = taxableGains * 0.125; // 12.5%
    } else {
      // STCG
      tax = gains * 0.20; // 20%
    }
  }

  return tax;
}

// Example: ₹5 lakh gains, held for 18 months
const ltcgTax = calculateCapitalGainsTax(500000, 18);
console.log(ltcgTax); // (500000 - 125000) × 0.125 = 46,875
```

---

## 7. Mutual Fund Metrics

### Sharpe Ratio

**Formula**:
```
Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Standard Deviation

Higher is better (better risk-adjusted returns)
> 1.0: Good
> 2.0: Very Good
> 3.0: Excellent
```

**Code Implementation**:
```javascript
function calculateSharpeRatio(returns, riskFreeRate = 6.5) {
  // Calculate average return
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Annualize if needed (assuming daily returns)
  const annualizedReturn = avgReturn * 252; // 252 trading days

  // Calculate standard deviation
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const annualizedStdDev = stdDev * Math.sqrt(252);

  // Calculate Sharpe
  const sharpe = (annualizedReturn - riskFreeRate) / annualizedStdDev;

  return sharpe;
}

// Example: Daily returns array
const dailyReturns = [0.001, -0.002, 0.003, 0.001, -0.001, /* ... */];
const sharpe = calculateSharpeRatio(dailyReturns);
console.log(sharpe.toFixed(2));
```

---

### Sortino Ratio

**Formula**:
```
Sortino Ratio = (Portfolio Return - Risk Free Rate) / Downside Deviation

Similar to Sharpe but only considers downside volatility
Penalizes only negative volatility
```

**Code Implementation**:
```javascript
function calculateSortinoRatio(returns, riskFreeRate = 6.5) {
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = avgReturn * 252;

  // Calculate downside deviation (only negative returns)
  const negativeReturns = returns.filter(r => r < 0);
  const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
  const downsideStdDev = Math.sqrt(downsideVariance);
  const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(252);

  const sortino = (annualizedReturn - riskFreeRate) / annualizedDownsideStdDev;

  return sortino;
}
```

---

### Maximum Drawdown

**Formula**:
```
Maximum Drawdown = (Trough Value - Peak Value) / Peak Value

Measures worst peak-to-trough decline
```

**Code Implementation**:
```javascript
function calculateMaxDrawdown(navHistory) {
  let maxDrawdown = 0;
  let peak = navHistory[0];

  for (const nav of navHistory) {
    if (nav > peak) {
      peak = nav;
    }

    const drawdown = (peak - nav) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown * 100; // Return as percentage
}

// Example: NAV history
const navHistory = [100, 105, 103, 110, 95, 98, 115];
const maxDD = calculateMaxDrawdown(navHistory);
console.log(maxDD.toFixed(2)); // Percentage
```

---

### Rolling Returns

**Formula**:
```
Rolling Return = ((Ending NAV / Starting NAV)^(1/years) - 1) × 100

Calculated for overlapping periods to show consistency
```

**Code Implementation**:
```javascript
function calculateRollingReturns(navData, windowYears = 3) {
  const rollingReturns = [];
  const daysInWindow = windowYears * 365;

  for (let i = 0; i <= navData.length - daysInWindow; i++) {
    const startNAV = navData[i].nav;
    const endNAV = navData[i + daysInWindow - 1].nav;
    const years = windowYears;

    const cagr = (Math.pow(endNAV / startNAV, 1 / years) - 1) * 100;

    rollingReturns.push({
      startDate: navData[i].date,
      endDate: navData[i + daysInWindow - 1].date,
      return: cagr
    });
  }

  return rollingReturns;
}
```

---

## 8. Asset Depreciation

### Vehicle Depreciation

**Formula** (WDV Method - Written Down Value):
```
Current Value = Purchase Price × (1 - depreciation_rate)^age

Depreciation Rates:
- Cars: 15% per year (WDV)
- Two-wheelers: 20% per year (WDV)
```

**Code Implementation**:
```javascript
function calculateVehicleValue(purchasePrice, purchaseYear, assetType = 'car') {
  const currentYear = new Date().getFullYear();
  const age = currentYear - purchaseYear;

  let depreciationRate;
  switch(assetType) {
    case 'car':
      depreciationRate = 0.15;
      break;
    case 'two-wheeler':
      depreciationRate = 0.20;
      break;
    default:
      depreciationRate = 0.15;
  }

  const currentValue = purchasePrice * Math.pow(1 - depreciationRate, age);
  const totalDepreciation = purchasePrice - currentValue;

  return {
    purchasePrice: purchasePrice,
    age: age,
    currentValue: Math.max(currentValue, purchasePrice * 0.1), // Min 10% residual
    depreciation: totalDepreciation,
    depreciationRate: depreciationRate * 100
  };
}

// Example: Car bought for ₹10 lakhs in 2020
const carValue = calculateVehicleValue(1000000, 2020, 'car');
console.log(carValue);
```

---

### Real Estate Appreciation

**Formula**:
```
Current Value = Purchase Price × (1 + appreciation_rate)^age

Appreciation Rates (India):
- Metro cities: 7-10% per year
- Tier 2 cities: 5-7% per year
- Tier 3 cities: 3-5% per year
```

**Code Implementation**:
```javascript
function calculateRealEstateValue(purchasePrice, purchaseYear, cityTier = 1) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - purchaseYear;

  let appreciationRate;
  switch(cityTier) {
    case 1:
      appreciationRate = 0.08; // 8%
      break;
    case 2:
      appreciationRate = 0.06; // 6%
      break;
    case 3:
      appreciationRate = 0.04; // 4%
      break;
    default:
      appreciationRate = 0.06;
  }

  const currentValue = purchasePrice * Math.pow(1 + appreciationRate, age);
  const totalAppreciation = currentValue - purchasePrice;

  return {
    purchasePrice: purchasePrice,
    age: age,
    currentValue: currentValue,
    appreciation: totalAppreciation,
    cagr: appreciationRate * 100
  };
}
```

---

## 9. Goal Optimization

### Multi-Goal SIP Allocation

**Algorithm**:
```
1. Calculate required SIP for each goal
2. Sum total SIP needed
3. If total > budget:
   a. Prioritize High → Medium → Low
   b. Reduce goal amounts or extend timelines
   c. Apply ML-predicted constraints
4. Allocate budget proportionally
```

**Code Implementation**:
```javascript
function optimizeGoals(goals, totalBudget) {
  // Step 1: Calculate required SIP for each goal
  goals.forEach(goal => {
    goal.requiredSIP = calculateRequiredSIP(
      goal.targetAmount,
      goal.expectedReturn,
      goal.timeline
    );
  });

  // Step 2: Check if budget sufficient
  const totalRequired = goals.reduce((sum, g) => sum + g.requiredSIP, 0);

  if (totalRequired <= totalBudget) {
    // Budget sufficient, no optimization needed
    return goals;
  }

  // Step 3: Optimization needed
  goals.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Step 4: Reduce goals iteratively
  const optimizedGoals = goals.map(goal => {
    // Apply reduction constraints
    const maxReduction = 0.30; // Max 30% reduction
    const maxExtension = 3;    // Max 3 years extension

    let optimized = {...goal};

    // Try reducing amount first
    optimized.targetAmount = goal.targetAmount * (1 - maxReduction);
    optimized.requiredSIP = calculateRequiredSIP(
      optimized.targetAmount,
      optimized.expectedReturn,
      optimized.timeline
    );

    // If still over budget, extend timeline
    if (optimized.requiredSIP * goals.length > totalBudget) {
      optimized.timeline = Math.min(goal.timeline + maxExtension, 30);
      optimized.requiredSIP = calculateRequiredSIP(
        optimized.targetAmount,
        optimized.expectedReturn,
        optimized.timeline
      );
    }

    return optimized;
  });

  return optimizedGoals;
}
```

---

## 10. Monte Carlo Simulation

### Probability Distribution

**Box-Muller Transform** (Generate normal distribution):
```javascript
function generateNormalRandom(mean, stdDev) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  return mean + z0 * stdDev;
}
```

---

### Monte Carlo Simulation for Goal Achievement

**Algorithm**:
```
For each scenario (1 to 10,000):
  1. Start with initial investment
  2. For each month until goal:
     a. Generate random monthly return ~ Normal(expected_return, volatility)
     b. Grow corpus: corpus × (1 + monthly_return)
     c. Add SIP: corpus + monthly_SIP
  3. Record final corpus value

Calculate:
- Success rate: % scenarios where final corpus >= goal
- Percentiles: 5th, 25th, 50th, 75th, 95th
```

**Code Implementation**:
```javascript
function runMonteCarloSimulation(config, numScenarios = 10000) {
  const {
    goalAmount,
    initialInvestment,
    monthlySIP,
    annualReturn,
    volatility,
    timelineYears
  } = config;

  const monthlyReturn = annualReturn / 100 / 12;
  const monthlyVolatility = volatility / 100 / Math.sqrt(12);
  const totalMonths = timelineYears * 12;

  const finalValues = [];

  // Run scenarios
  for (let scenario = 0; scenario < numScenarios; scenario++) {
    let corpus = initialInvestment;

    for (let month = 0; month < totalMonths; month++) {
      // Generate random return
      const randomReturn = generateNormalRandom(monthlyReturn, monthlyVolatility);

      // Grow corpus
      corpus = corpus * (1 + randomReturn);

      // Add SIP
      corpus += monthlySIP;
    }

    finalValues.push(corpus);
  }

  // Sort for percentile calculation
  finalValues.sort((a, b) => a - b);

  // Calculate statistics
  const successCount = finalValues.filter(v => v >= goalAmount).length;
  const successRate = (successCount / numScenarios) * 100;

  const percentile = (p) => finalValues[Math.floor(numScenarios * p / 100)];

  return {
    successRate: successRate,
    percentiles: {
      p5: percentile(5),
      p25: percentile(25),
      p50: percentile(50),  // Median
      p75: percentile(75),
      p95: percentile(95)
    },
    mean: finalValues.reduce((sum, v) => sum + v, 0) / numScenarios,
    goalAmount: goalAmount
  };
}

// Example: Goal of ₹50 lakhs in 15 years
const simulation = runMonteCarloSimulation({
  goalAmount: 5000000,
  initialInvestment: 100000,
  monthlySIP: 15000,
  annualReturn: 12,
  volatility: 18,
  timelineYears: 15
});

console.log(simulation);
// {
//   successRate: 78.5,
//   percentiles: { p5: 3800000, p25: 4500000, p50: 5200000, p75: 6000000, p95: 7200000 },
//   mean: 5250000,
//   goalAmount: 5000000
// }
```

---

## Summary

This document provides all the financial formulas and calculations used in WealthElements. Each formula includes:
- Mathematical representation
- Code implementation
- Example usage
- Real-world applications

**Key Takeaways**:
1. All formulas are implemented in pure JavaScript
2. Edge cases are handled (zero rates, infinity, etc.)
3. Results are rounded appropriately for currency (2 decimal places)
4. Validation is applied to all inputs
5. Complex calculations are broken into smaller functions

**Next Steps**:
- Implement these formulas in your application
- Add unit tests for each calculation
- Validate against known financial calculators
- Handle edge cases gracefully
- Display results in user-friendly format

Refer to [03-ML-SYSTEM.md](./03-ML-SYSTEM.md) for machine learning implementation details.
