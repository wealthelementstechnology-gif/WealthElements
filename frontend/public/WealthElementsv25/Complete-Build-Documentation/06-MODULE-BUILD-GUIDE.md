# Module-by-Module Build Guide

## How to Build WealthElements from Scratch

This guide provides step-by-step instructions for building each module of WealthElements.

---

## Module 1: Design System & Landing Page

### Estimated Time: 8 hours

### Step 1.1: Create Design System CSS

**File**: `design-system.css`

```css
/* ========== CSS VARIABLES ========== */
:root {
  /* Colors */
  --primary: #22c55e;
  --primary-dark: #16a34a;
  --primary-light: #86efac;
  --secondary: #0ea5e9;
  --accent: #d97706;

  /* Grays */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-900: #111827;

  /* Spacing */
  --space-1: 0.25rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
}

/* ========== DARK MODE ========== */
[data-theme="dark"] {
  --gray-50: #111827;
  --gray-100: #1f2937;
  --gray-900: #f9fafb;
}

/* ========== RESET ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--gray-50);
  color: var(--gray-900);
}

/* ========== COMPONENTS ========== */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ... more components */
```

---

### Step 1.2: Create Theme Toggle

**File**: `theme.js`

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupToggle();
  }

  loadTheme() {
    return localStorage.getItem('wealth-elements-theme') || 'light';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('wealth-elements-theme', theme);

    // Update toggle button icon
    this.updateToggleIcon();

    // Broadcast event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  setupToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  }

  updateToggleIcon() {
    const icon = document.querySelector('#theme-toggle svg');
    if (!icon) return;

    if (this.currentTheme === 'dark') {
      icon.innerHTML = '<!-- Sun icon SVG -->';
    } else {
      icon.innerHTML = '<!-- Moon icon SVG -->';
    }
  }
}

// Initialize
const themeManager = new ThemeManager();
```

---

### Step 1.3: Create Landing Page

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WealthElements - Financial Planning Tool</title>
  <link rel="stylesheet" href="design-system.css">
  <link rel="stylesheet" href="index.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <nav class="container">
      <h1>WealthElements</h1>
      <button id="theme-toggle" aria-label="Toggle theme">
        <svg><!-- Moon icon --></svg>
      </button>
    </nav>
  </header>

  <main class="container">
    <section class="hero">
      <h2>Plan Your Financial Future</h2>
      <p>Comprehensive financial planning tools for life goals, retirement, and investments</p>
    </section>

    <section class="features">
      <div class="card">
        <h3>8 Events Calculator</h3>
        <p>Plan for 8 major life events with ML-powered optimization</p>
        <a href="8-events-calculator/index.html" class="btn-primary">Start Planning</a>
      </div>

      <div class="card">
        <h3>Financial Calculators</h3>
        <p>15+ specialized calculators for SIP, lumpsum, SWP, and more</p>
        <a href="calculators/index.html" class="btn-primary">Explore Tools</a>
      </div>

      <div class="card">
        <h3>Mutual Fund Analyzer</h3>
        <p>Analyze and compare Indian mutual funds with advanced metrics</p>
        <a href="mutual-fund-analyzer/index.html" class="btn-primary">Analyze Funds</a>
      </div>

      <div class="card">
        <h3>Tax Calculator</h3>
        <p>Calculate income tax for old vs new regime</p>
        <a href="tax-calculator/index.html" class="btn-primary">Calculate Tax</a>
      </div>
    </section>
  </main>

  <script src="theme.js"></script>
</body>
</html>
```

---

## Module 2: Simple Financial Calculators

### Estimated Time: 12 hours

### Step 2.1: SIP Future Value Calculator

**File**: `calculators/sip-calculator.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>SIP Calculator</title>
  <link rel="stylesheet" href="../design-system.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>SIP Future Value Calculator</h1>

    <div class="calculator-form">
      <div class="input-group">
        <label>Monthly SIP Amount (₹)</label>
        <input type="number" id="sip-amount" value="10000" min="500">
      </div>

      <div class="input-group">
        <label>Expected Annual Return (%)</label>
        <input type="number" id="return-rate" value="12" min="1" max="30" step="0.5">
      </div>

      <div class="input-group">
        <label>Investment Period (Years)</label>
        <input type="number" id="years" value="10" min="1" max="50">
      </div>

      <button onclick="calculate()" class="btn-primary">Calculate</button>
    </div>

    <div id="results" style="display: none;">
      <h2>Results</h2>
      <div class="result-cards">
        <div class="card">
          <h3>Total Investment</h3>
          <p id="total-invested" class="amount">₹0</p>
        </div>
        <div class="card">
          <h3>Future Value</h3>
          <p id="future-value" class="amount">₹0</p>
        </div>
        <div class="card">
          <h3>Total Returns</h3>
          <p id="total-returns" class="amount">₹0</p>
        </div>
      </div>

      <canvas id="chart"></canvas>
    </div>
  </div>

  <script src="sip-calculator.js"></script>
</body>
</html>
```

**File**: `calculators/sip-calculator.js`

```javascript
let chartInstance = null;

function calculateSIPFutureValue(monthlySIP, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (r === 0) {
    return monthlySIP * n;
  }

  const fv = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fv;
}

function calculate() {
  const sip = parseFloat(document.getElementById('sip-amount').value);
  const rate = parseFloat(document.getElementById('return-rate').value);
  const years = parseFloat(document.getElementById('years').value);

  // Calculate
  const totalInvested = sip * years * 12;
  const futureValue = calculateSIPFutureValue(sip, rate, years);
  const returns = futureValue - totalInvested;

  // Display results
  document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
  document.getElementById('future-value').textContent = formatCurrency(futureValue);
  document.getElementById('total-returns').textContent = formatCurrency(returns);

  document.getElementById('results').style.display = 'block';

  // Draw chart
  drawChart(totalInvested, returns);
}

function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function drawChart(invested, returns) {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Total Invested', 'Returns'],
      datasets: [{
        data: [invested, returns],
        backgroundColor: ['#0ea5e9', '#22c55e']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
```

**Repeat similar pattern** for:
- One-time investment calculator
- SWP calculator
- Combo (SIP + Lumpsum) calculator
- Required SIP calculator
- 10 more variants

---

## Module 3: 8-Events Calculator (Core Module)

### Estimated Time: 40 hours

### Step 3.1: Wizard Navigation Structure

**File**: `8-events-calculator/index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>8 Events Financial Planning</title>
  <link rel="stylesheet" href="../design-system.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="wizard-container">
    <!-- Progress Indicator -->
    <div class="progress-steps">
      <div class="step active" data-step="1">
        <span class="step-number">1</span>
        <span class="step-label">Personal Details</span>
      </div>
      <div class="step" data-step="2">
        <span class="step-number">2</span>
        <span class="step-label">Insurance Analysis</span>
      </div>
      <!-- ... steps 3-8 -->
    </div>

    <!-- Content Area -->
    <div id="step-content">
      <!-- Dynamic content loaded here -->
    </div>

    <!-- Navigation Buttons -->
    <div class="wizard-nav">
      <button id="prev-btn" class="btn-secondary">Previous</button>
      <button id="next-btn" class="btn-primary">Next</button>
    </div>
  </div>

  <script src="8-events.js"></script>
</body>
</html>
```

---

### Step 3.2: Step 1 - Personal Details

**File**: `8-events-calculator/step1.html`

```html
<div class="step-container">
  <h2>Step 1: Personal Details</h2>

  <!-- Family Mode Toggle -->
  <div class="toggle-group">
    <button id="individual-mode" class="toggle-btn active">Individual</button>
    <button id="couple-mode" class="toggle-btn">Couple</button>
  </div>

  <!-- Person 1 Details -->
  <div class="person-section">
    <h3>Your Details</h3>
    <div class="form-grid">
      <div>
        <label>Name</label>
        <input type="text" id="person1-name" required>
      </div>
      <div>
        <label>Age</label>
        <input type="number" id="person1-age" min="18" max="100" required>
      </div>
      <div>
        <label>Retirement Age</label>
        <input type="number" id="person1-retirement-age" value="60" min="50" max="80">
      </div>
    </div>

    <!-- Income Section -->
    <h4>Monthly Income</h4>
    <div id="income-rows">
      <div class="income-row">
        <input type="text" placeholder="Source" class="income-source">
        <input type="number" placeholder="Amount" class="income-amount">
        <button onclick="removeIncomeRow(this)">×</button>
      </div>
    </div>
    <button onclick="addIncomeRow()" class="btn-secondary">+ Add Income</button>

    <!-- Other Income -->
    <div class="form-grid">
      <div>
        <label>Other Income (Annual)</label>
        <input type="number" id="other-income" value="0">
      </div>
      <div>
        <label>Provident Fund (Monthly)</label>
        <input type="number" id="provident-fund" value="0">
      </div>
    </div>
  </div>

  <!-- Assets Section -->
  <div class="assets-section">
    <h3>Assets</h3>

    <h4>Real Estate</h4>
    <table id="real-estate-table">
      <thead>
        <tr>
          <th>Property Name</th>
          <th>Purchase Year</th>
          <th>Purchase Value</th>
          <th>Current Value</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button onclick="addRealEstate()" class="btn-secondary">+ Add Property</button>

    <!-- Similar sections for Vehicles, Valuables, Investments -->
  </div>

  <!-- Liabilities Section -->
  <div class="liabilities-section">
    <h3>Liabilities</h3>
    <table id="liabilities-table">
      <thead>
        <tr>
          <th>Loan Type</th>
          <th>Outstanding Amount</th>
          <th>EMI</th>
          <th>Remaining Tenure (months)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button onclick="addLiability()" class="btn-secondary">+ Add Liability</button>
  </div>

  <!-- Insurance Section -->
  <div class="insurance-section">
    <h3>Insurance</h3>
    <div class="form-grid">
      <div>
        <label>Life Insurance Cover</label>
        <input type="number" id="life-insurance" value="0">
      </div>
      <div>
        <label>Health Insurance Cover</label>
        <input type="number" id="health-insurance" value="0">
      </div>
    </div>
  </div>

  <!-- Monthly Expenses Section -->
  <div class="expenses-section">
    <h3>Monthly Expenses</h3>
    <div class="expenses-grid">
      <div>
        <label>Housing (Rent/EMI)</label>
        <input type="number" name="housing" value="0">
      </div>
      <div>
        <label>Utilities</label>
        <input type="number" name="utilities" value="0">
      </div>
      <div>
        <label>Groceries</label>
        <input type="number" name="groceries" value="0">
      </div>
      <!-- ... 19 more expense categories -->
    </div>

    <div class="total-expenses">
      <strong>Total Monthly Expenses: </strong>
      <span id="total-expenses">₹0</span>
    </div>
  </div>
</div>
```

**File**: `8-events-calculator/step1.js`

```javascript
// Income row management
function addIncomeRow() {
  const container = document.getElementById('income-rows');
  const row = document.createElement('div');
  row.className = 'income-row';
  row.innerHTML = `
    <input type="text" placeholder="Source" class="income-source">
    <input type="number" placeholder="Amount" class="income-amount">
    <button onclick="removeIncomeRow(this)">×</button>
  `;
  container.appendChild(row);
}

function removeIncomeRow(button) {
  button.parentElement.remove();
}

// Real estate management
function addRealEstate() {
  const tbody = document.querySelector('#real-estate-table tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" placeholder="Property name"></td>
    <td><input type="number" placeholder="2020" min="1950" max="${new Date().getFullYear()}"></td>
    <td><input type="number" placeholder="Purchase value"></td>
    <td><input type="number" placeholder="Current value" readonly></td>
    <td><button onclick="this.closest('tr').remove()">Delete</button></td>
  `;
  tbody.appendChild(row);
}

// Calculate total expenses
function updateTotalExpenses() {
  const inputs = document.querySelectorAll('.expenses-grid input');
  let total = 0;
  inputs.forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById('total-expenses').textContent = '₹' + total.toLocaleString('en-IN');
}

// Attach listeners
document.querySelectorAll('.expenses-grid input').forEach(input => {
  input.addEventListener('input', updateTotalExpenses);
});

// Save data
function saveStep1() {
  const data = {
    familyMode: document.querySelector('.toggle-btn.active').id,
    person1: {
      name: document.getElementById('person1-name').value,
      age: parseInt(document.getElementById('person1-age').value),
      retirementAge: parseInt(document.getElementById('person1-retirement-age').value),
      monthlyIncome: Array.from(document.querySelectorAll('.income-row')).map(row => ({
        source: row.querySelector('.income-source').value,
        amount: parseFloat(row.querySelector('.income-amount').value) || 0
      })),
      otherIncome: parseFloat(document.getElementById('other-income').value) || 0,
      providentFund: parseFloat(document.getElementById('provident-fund').value) || 0
    },
    assets: {
      realEstate: Array.from(document.querySelectorAll('#real-estate-table tbody tr')).map(row => ({
        name: row.cells[0].querySelector('input').value,
        purchaseYear: parseInt(row.cells[1].querySelector('input').value),
        purchaseValue: parseFloat(row.cells[2].querySelector('input').value),
        currentValue: parseFloat(row.cells[3].querySelector('input').value)
      })),
      // ... other assets
    },
    liabilities: Array.from(document.querySelectorAll('#liabilities-table tbody tr')).map(row => ({
      type: row.cells[0].querySelector('input').value,
      amount: parseFloat(row.cells[1].querySelector('input').value),
      emi: parseFloat(row.cells[2].querySelector('input').value),
      tenure: parseInt(row.cells[3].querySelector('input').value)
    })),
    insurance: {
      life: parseFloat(document.getElementById('life-insurance').value) || 0,
      health: parseFloat(document.getElementById('health-insurance').value) || 0
    },
    monthlyExpenses: getExpensesObject()
  };

  localStorage.setItem('we_step1', JSON.stringify(data));
  return true;
}

function getExpensesObject() {
  const expenses = {};
  document.querySelectorAll('.expenses-grid input').forEach(input => {
    expenses[input.name] = parseFloat(input.value) || 0;
  });
  return expenses;
}

// Load data
function loadStep1() {
  const saved = localStorage.getItem('we_step1');
  if (!saved) return;

  const data = JSON.parse(saved);
  // Populate form fields
  document.getElementById('person1-name').value = data.person1.name;
  document.getElementById('person1-age').value = data.person1.age;
  // ... populate all fields
}

// Initialize
document.addEventListener('DOMContentLoaded', loadStep1);
```

**Continue similar pattern for Steps 2-5** with increasing complexity.

---

### Step 3.3: Step 6 - ML-Powered Optimization

**File**: `8-events-calculator/step6.html`

```html
<div class="step-container">
  <h2>Step 6: Goal Optimization</h2>

  <div class="budget-summary">
    <div class="card">
      <h3>Monthly Investment Budget</h3>
      <p class="amount">₹<span id="investment-budget">40,000</span></p>
    </div>
    <div class="card">
      <h3>Required SIP (All Goals)</h3>
      <p class="amount warning">₹<span id="total-required-sip">65,000</span></p>
    </div>
    <div class="card alert">
      <h3>Shortfall</h3>
      <p class="amount">₹<span id="shortfall">25,000</span></p>
    </div>
  </div>

  <div class="optimization-message">
    <p>⚠️ Your required SIP exceeds your budget. We'll optimize your goals to fit your budget.</p>
    <button onclick="runOptimization()" class="btn-primary">Optimize Goals</button>
  </div>

  <div id="optimized-goals" style="display: none;">
    <h3>Optimized Goals</h3>
    <table class="goals-table">
      <thead>
        <tr>
          <th>Goal</th>
          <th>Original Amount</th>
          <th>Optimized Amount</th>
          <th>Original Timeline</th>
          <th>Optimized Timeline</th>
          <th>Monthly SIP</th>
        </tr>
      </thead>
      <tbody id="optimized-goals-body"></tbody>
    </table>

    <div class="optimization-summary">
      <p>Total Monthly SIP: ₹<span id="optimized-total-sip"></span></p>
      <p class="success">✓ Within budget</p>
    </div>

    <div class="feedback-section">
      <p>Does this optimization look reasonable to you?</p>
      <button onclick="acceptOptimization()" class="btn-primary">Accept</button>
      <button onclick="rejectOptimization()" class="btn-secondary">Reject</button>
    </div>
  </div>
</div>
```

**File**: `8-events-calculator/step6.js`

```javascript
async function runOptimization() {
  // 1. Load goals from Step 4
  const goals = loadGoals();
  const userProfile = loadUserProfile();
  const budget = calculateInvestmentBudget();

  // 2. For each goal, predict constraints using ML
  for (let goal of goals) {
    const constraints = await window.mlModel.predictConstraints(
      goal,
      userProfile,
      goals,
      await window.outcomeTracker.getAllRecords()
    );

    console.log(`ML Constraints for ${goal.name}:`, constraints);

    // 3. Apply optimization
    const optimized = applyConstraints(goal, constraints, budget);
    goal.optimizedAmount = optimized.amount;
    goal.optimizedTimeline = optimized.timeline;
    goal.optimizedSIP = optimized.sip;
  }

  // 4. Display results
  displayOptimizedGoals(goals);

  // 5. Record attempt
  const optimizationId = await window.outcomeTracker.recordOptimizationAttempt({
    userAge: userProfile.age,
    monthlyIncome: userProfile.monthlyIncome,
    monthlyExpenses: userProfile.monthlyExpenses,
    investmentBudget: budget,
    originalGoals: goals.map(g => ({
      name: g.name,
      fv: g.targetAmount,
      yearsLeft: g.timeline,
      sip: g.requiredSIP
    })),
    goals: goals.map(g => ({
      name: g.name,
      fv: g.optimizedAmount,
      yearsLeft: g.optimizedTimeline,
      sip: g.optimizedSIP
    })),
    // ... other data
  });

  // Store for later feedback
  sessionStorage.setItem('current_optimization_id', optimizationId);
}

function applyConstraints(goal, constraints, budget) {
  // Simple logic - can be made more sophisticated
  let amount = goal.targetAmount;
  let timeline = goal.timeline;

  // Reduce amount by up to maxAmountReduction
  const reduction = Math.min(0.15, constraints.maxAmountReduction);
  amount = amount * (1 - reduction);

  // Extend timeline if needed
  let sip = calculateRequiredSIP(amount, goal.expectedReturn, timeline);

  if (sip > budget * 0.5) {  // Goal takes >50% of budget
    const extension = Math.min(2, constraints.maxTenureExtension);
    timeline = timeline + extension;
    sip = calculateRequiredSIP(amount, goal.expectedReturn, timeline);
  }

  return { amount, timeline, sip };
}

async function acceptOptimization() {
  const optimizationId = sessionStorage.getItem('current_optimization_id');
  await window.outcomeTracker.recordUserDecision(optimizationId, true, 'Accepted');

  // Save optimized goals
  const goals = getOptimizedGoals();
  localStorage.setItem('we_plan_goals', JSON.stringify(goals));

  // Proceed to next step
  goToStep(7);
}

async function rejectOptimization() {
  const optimizationId = sessionStorage.getItem('current_optimization_id');
  await window.outcomeTracker.recordUserDecision(optimizationId, false, 'Rejected - too aggressive');

  alert('Please adjust your budget or goal amounts manually.');
}
```

---

### Step 3.4: Step 7 - Monte Carlo Simulation

**File**: `8-events-calculator/step7.html`

```html
<div class="step-container">
  <h2>Step 7: Probability Analysis</h2>

  <p>Let's simulate 10,000 market scenarios to see the probability of achieving your goals.</p>

  <div class="simulation-controls">
    <label>Number of Scenarios:</label>
    <select id="scenario-count">
      <option value="1000">1,000 (Fast)</option>
      <option value="10000" selected>10,000 (Recommended)</option>
      <option value="25000">25,000 (Thorough)</option>
    </select>

    <label>Volatility Assumption:</label>
    <select id="volatility">
      <option value="15">Conservative (15%)</option>
      <option value="18" selected>Realistic (18%)</option>
      <option value="22">Aggressive (22%)</option>
    </select>

    <button onclick="runSimulation()" class="btn-primary">Run Simulation</button>
  </div>

  <div id="simulation-results" style="display: none;">
    <h3>Results for: <span id="selected-goal"></span></h3>

    <div class="probability-cards">
      <div class="card success">
        <h4>Success Rate</h4>
        <p class="percentage"><span id="success-rate">85</span>%</p>
      </div>
      <div class="card">
        <h4>Median Outcome</h4>
        <p class="amount">₹<span id="median-outcome">52,00,000</span></p>
      </div>
      <div class="card">
        <h4>Goal Amount</h4>
        <p class="amount">₹<span id="goal-amount">50,00,000</span></p>
      </div>
    </div>

    <h4>Outcome Distribution</h4>
    <canvas id="distribution-chart"></canvas>

    <table class="percentile-table">
      <thead>
        <tr>
          <th>Percentile</th>
          <th>Final Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>5th (Worst Case)</td>
          <td id="p5">₹38,00,000</td>
        </tr>
        <tr>
          <td>25th</td>
          <td id="p25">₹45,00,000</td>
        </tr>
        <tr>
          <td>50th (Median)</td>
          <td id="p50">₹52,00,000</td>
        </tr>
        <tr>
          <td>75th</td>
          <td id="p75">₹60,00,000</td>
        </tr>
        <tr>
          <td>95th (Best Case)</td>
          <td id="p95">₹75,00,000</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**File**: `8-events-calculator/step7.js`

```javascript
// Box-Muller transform for normal distribution
function generateNormalRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

async function runSimulation() {
  const numScenarios = parseInt(document.getElementById('scenario-count').value);
  const volatility = parseInt(document.getElementById('volatility').value);

  // Get selected goal
  const goals = JSON.parse(localStorage.getItem('we_plan_goals'));
  const selectedGoal = goals[0];  // Or let user select

  const config = {
    goalAmount: selectedGoal.fv,
    initialInvestment: 0,
    monthlySIP: selectedGoal.sip,
    annualReturn: selectedGoal.rateOfReturn,
    volatility: volatility,
    timelineYears: selectedGoal.yearsLeft
  };

  // Run simulation
  showLoader('Running ' + numScenarios.toLocaleString() + ' scenarios...');
  const results = await runMonteCarloSimulation(config, numScenarios);
  hideLoader();

  // Display results
  displaySimulationResults(selectedGoal.name, results);
}

async function runMonteCarloSimulation(config, numScenarios) {
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

    // Update progress every 1000 scenarios
    if (scenario % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));  // Yield to UI
    }
  }

  // Sort for percentiles
  finalValues.sort((a, b) => a - b);

  // Calculate statistics
  const successCount = finalValues.filter(v => v >= goalAmount).length;
  const successRate = (successCount / numScenarios) * 100;

  const percentile = (p) => finalValues[Math.floor(numScenarios * p / 100)];

  return {
    successRate: successRate.toFixed(1),
    percentiles: {
      p5: percentile(5),
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p95: percentile(95)
    },
    mean: finalValues.reduce((sum, v) => sum + v, 0) / numScenarios,
    goalAmount: goalAmount,
    allValues: finalValues  // For histogram
  };
}

function displaySimulationResults(goalName, results) {
  document.getElementById('selected-goal').textContent = goalName;
  document.getElementById('success-rate').textContent = results.successRate;
  document.getElementById('median-outcome').textContent = formatCurrency(results.percentiles.p50);
  document.getElementById('goal-amount').textContent = formatCurrency(results.goalAmount);

  // Percentile table
  document.getElementById('p5').textContent = formatCurrency(results.percentiles.p5);
  document.getElementById('p25').textContent = formatCurrency(results.percentiles.p25);
  document.getElementById('p50').textContent = formatCurrency(results.percentiles.p50);
  document.getElementById('p75').textContent = formatCurrency(results.percentiles.p75);
  document.getElementById('p95').textContent = formatCurrency(results.percentiles.p95);

  // Draw histogram
  drawDistributionChart(results.allValues, results.goalAmount);

  document.getElementById('simulation-results').style.display = 'block';
}

function drawDistributionChart(values, goalAmount) {
  // Create histogram data (20 bins)
  const bins = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / bins;

  const histogram = new Array(bins).fill(0);
  values.forEach(v => {
    const binIndex = Math.min(Math.floor((v - min) / binSize), bins - 1);
    histogram[binIndex]++;
  });

  const labels = new Array(bins).fill(0).map((_, i) => {
    const binStart = min + i * binSize;
    return formatCurrency(binStart);
  });

  const canvas = document.getElementById('distribution-chart');
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Frequency',
        data: histogram,
        backgroundColor: '#0ea5e9'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
```

Continue with Steps 8, Tax Calculator, Mutual Fund Analyzer with similar detailed implementations.

---

## Summary

This build guide provides:
1. **Step-by-step HTML structure**
2. **Complete JavaScript logic**
3. **CSS styling patterns**
4. **Data flow and state management**
5. **Integration with ML system**
6. **Chart visualizations**

**Total Build Time Estimate**: 150-200 hours for complete implementation

**Next**: See complete code examples in the existing codebase for reference.
