# Prompt 3: SIP Calculator (First Calculator Example)

## What This Builds
- Complete SIP Future Value Calculator
- Chart visualization
- Input validation
- Serves as template for other 14 calculators

## Files Created
1. `calculators/sip-calculator.html`
2. `calculators/sip-calculator.js`

---

## 📋 COPY-PASTE PROMPT BELOW

=== COPY FROM HERE ===

Create a complete SIP (Systematic Investment Plan) Future Value Calculator.

## Requirements:

### 1. Calculator HTML (calculators/sip-calculator.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIP Calculator - WealthElements</title>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../design-system.css">

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>

  <style>
    .calculator-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .calculator-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .calculator-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .input-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: var(--shadow-md);
    }

    [data-theme="dark"] .input-section {
      background: var(--gray-800);
    }

    .result-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: var(--shadow-md);
    }

    [data-theme="dark"] .result-section {
      background: var(--gray-800);
    }

    .result-card {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--primary);
    }

    [data-theme="dark"] .result-card {
      background: var(--gray-700);
    }

    .result-label {
      font-size: 0.875rem;
      color: var(--gray-600);
      margin-bottom: 0.5rem;
    }

    .result-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
    }

    .chart-container {
      margin-top: 2rem;
      height: 300px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: var(--primary);
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .calculator-body {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="calculator-container">
    <a href="index.html" class="back-link">← Back to Calculators</a>

    <div class="calculator-header">
      <h1>SIP Future Value Calculator</h1>
      <p>Calculate how much wealth you can create through regular monthly investments</p>
    </div>

    <div class="calculator-body">
      <!-- Input Section -->
      <div class="input-section">
        <h2>Investment Details</h2>

        <div class="input-group">
          <label for="sip-amount">Monthly SIP Amount (₹)</label>
          <input
            type="number"
            id="sip-amount"
            value="10000"
            min="500"
            step="500"
            required
          >
          <p class="text-sm text-gray-600">Minimum: ₹500</p>
        </div>

        <div class="input-group">
          <label for="return-rate">Expected Annual Return (%)</label>
          <input
            type="number"
            id="return-rate"
            value="12"
            min="1"
            max="30"
            step="0.5"
            required
          >
          <p class="text-sm text-gray-600">Typical range: 8-15% for equity funds</p>
        </div>

        <div class="input-group">
          <label for="years">Investment Period (Years)</label>
          <input
            type="number"
            id="years"
            value="10"
            min="1"
            max="50"
            required
          >
        </div>

        <button onclick="calculate()" class="btn btn-primary" style="width: 100%">
          Calculate
        </button>

        <button onclick="resetCalculator()" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem">
          Reset
        </button>
      </div>

      <!-- Result Section -->
      <div class="result-section" id="result-section" style="display: none;">
        <h2>Results</h2>

        <div class="result-card">
          <div class="result-label">Total Investment</div>
          <div class="result-value" id="total-invested">₹0</div>
        </div>

        <div class="result-card">
          <div class="result-label">Future Value</div>
          <div class="result-value" id="future-value">₹0</div>
        </div>

        <div class="result-card">
          <div class="result-label">Total Returns</div>
          <div class="result-value" id="total-returns">₹0</div>
        </div>

        <div class="result-card">
          <div class="result-label">Returns Percentage</div>
          <div class="result-value" id="returns-percent">0%</div>
        </div>

        <!-- Chart -->
        <div class="chart-container">
          <canvas id="sipChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <script src="../theme.js"></script>
  <script src="sip-calculator.js"></script>
</body>
</html>
```

---

### 2. Calculator JavaScript (calculators/sip-calculator.js)

Implement with these exact formulas and features:

**SIP Future Value Formula:**
```
FV = P × [(1 + r)^n - 1] / r × (1 + r)

Where:
P = Monthly SIP amount
r = Monthly rate of return (annual_rate / 12 / 100)
n = Total number of months (years × 12)
```

**JavaScript Implementation:**

```javascript
// Global variable for chart instance
let chartInstance = null;

/**
 * Calculate SIP Future Value
 * @param {number} monthlySIP - Monthly SIP amount
 * @param {number} annualRate - Annual return rate (percentage)
 * @param {number} years - Investment period in years
 * @returns {number} Future value
 */
function calculateSIPFutureValue(monthlySIP, annualRate, years) {
  const r = annualRate / 100 / 12;  // Monthly rate
  const n = years * 12;              // Total months

  // Handle zero rate edge case
  if (r === 0) {
    return monthlySIP * n;
  }

  // SIP FV formula
  const fv = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

  return fv;
}

/**
 * Format currency in Indian format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
}

/**
 * Validate inputs
 * @returns {object} Validation result
 */
function validateInputs() {
  const sipAmount = parseFloat(document.getElementById('sip-amount').value);
  const returnRate = parseFloat(document.getElementById('return-rate').value);
  const years = parseFloat(document.getElementById('years').value);

  const errors = [];

  if (isNaN(sipAmount) || sipAmount < 500) {
    errors.push('SIP amount must be at least ₹500');
  }

  if (isNaN(returnRate) || returnRate < 1 || returnRate > 30) {
    errors.push('Return rate must be between 1% and 30%');
  }

  if (isNaN(years) || years < 1 || years > 50) {
    errors.push('Investment period must be between 1 and 50 years');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    values: { sipAmount, returnRate, years }
  };
}

/**
 * Main calculation function
 */
function calculate() {
  // Validate inputs
  const validation = validateInputs();

  if (!validation.valid) {
    alert('Please fix the following errors:\n' + validation.errors.join('\n'));
    return;
  }

  const { sipAmount, returnRate, years } = validation.values;

  // Calculate values
  const totalInvested = sipAmount * years * 12;
  const futureValue = calculateSIPFutureValue(sipAmount, returnRate, years);
  const returns = futureValue - totalInvested;
  const returnsPercent = ((returns / totalInvested) * 100).toFixed(2);

  // Display results
  document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
  document.getElementById('future-value').textContent = formatCurrency(futureValue);
  document.getElementById('total-returns').textContent = formatCurrency(returns);
  document.getElementById('returns-percent').textContent = returnsPercent + '%';

  // Show result section
  document.getElementById('result-section').style.display = 'block';

  // Draw chart
  drawChart(totalInvested, returns);
}

/**
 * Draw pie chart showing investment vs returns
 * @param {number} invested - Total amount invested
 * @param {number} returns - Total returns earned
 */
function drawChart(invested, returns) {
  const canvas = document.getElementById('sipChart');
  const ctx = canvas.getContext('2d');

  // Destroy previous chart instance if exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new chart
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Total Invested', 'Returns'],
      datasets: [{
        data: [invested, returns],
        backgroundColor: [
          '#0ea5e9',  // Blue for invested
          '#22c55e'   // Green for returns
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Reset calculator to default values
 */
function resetCalculator() {
  document.getElementById('sip-amount').value = '10000';
  document.getElementById('return-rate').value = '12';
  document.getElementById('years').value = '10';
  document.getElementById('result-section').style.display = 'none';

  // Destroy chart
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

// Auto-calculate on Enter key
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        calculate();
      }
    });
  });
});

console.log('SIP Calculator loaded');
```

---

## Expected Output:

Generate complete working calculator with:
1. ✅ Input validation
2. ✅ Accurate SIP calculation
3. ✅ Pie chart visualization
4. ✅ Responsive design
5. ✅ Dark mode support
6. ✅ Error handling

## Test Cases:

After generation, verify:

**Test 1:**
- SIP: ₹10,000/month
- Rate: 12% annually
- Period: 10 years
- Expected FV: ₹23,23,391

**Test 2:**
- SIP: ₹5,000/month
- Rate: 10% annually
- Period: 20 years
- Expected FV: ₹38,29,749

**Test 3:**
- SIP: ₹25,000/month
- Rate: 15% annually
- Period: 15 years
- Expected FV: ₹1,71,24,622

=== COPY UNTIL HERE ===
