# Complete Prompt List - All 20 Prompts for Building WealthElements

## 📁 Folder: Complete-Build-Documentation/AI-PROMPTS/

---

## ✅ CREATED PROMPTS (Ready to Use)

These prompts are fully written and ready to copy-paste:

### Foundation & Design
✅ **01-PROMPT-Design-System.md** - CSS design system + theme toggle (READY)
✅ **02-PROMPT-Landing-Page.md** - Main landing page + navigation (READY)

### Calculators
✅ **03-PROMPT-Calculator-SIP.md** - SIP Future Value Calculator (READY)

### ML System
✅ **13-PROMPT-ML-Model.md** - TensorFlow.js ML model (READY)

---

## 📝 TEMPLATE PROMPTS (Use These Templates)

For the remaining 16 prompts, I'm providing you with templates below. Simply copy-paste these into new `.md` files in the AI-PROMPTS folder, or use them directly with your AI.

---

## PROMPT 04: All Remaining Calculators

```markdown
# Prompt 4: Remaining 14 Financial Calculators

=== COPY FROM HERE ===

Create 14 additional financial calculators following the same pattern as the SIP calculator.

## Calculators to Create:

### 1. Required SIP Calculator
**File**: calculators/sip-required.html, sip-required.js
**Formula**: P = FV × r / [(1 + r)^n - 1] / (1 + r)
**Inputs**: Target amount, annual return, years
**Output**: Required monthly SIP

### 2. Lumpsum Future Value
**File**: calculators/lumpsum-fv.html, lumpsum-fv.js
**Formula**: FV = PV × (1 + r)^n
**Inputs**: Principal, annual return, years
**Output**: Future value

### 3. Required Lumpsum
**File**: calculators/lumpsum-required.html, lumpsum-required.js
**Formula**: PV = FV / (1 + r)^n
**Inputs**: Target amount, annual return, years
**Output**: Required lumpsum investment

### 4. SWP Duration
**File**: calculators/swp-duration.html, swp-duration.js
**Formula**: n = -log(1 - (corpus × r / withdrawal)) / log(1 + r)
**Inputs**: Corpus, monthly withdrawal, return rate
**Output**: Years corpus will last

### 5. Required Corpus for SWP
**File**: calculators/swp-corpus.html, swp-corpus.js
**Formula**: Corpus = Monthly Withdrawal / (Return Rate / 12)
**Inputs**: Monthly withdrawal, return rate
**Output**: Required corpus for perpetual withdrawal

### 6-14. Create These Additional Calculators:
- Combo (SIP + Lumpsum) Calculator
- Limited Period SIP Future Value
- Limited Period SIP Required
- Required Onetime (SIP Known)
- Required SIP (Onetime Known)
- Step-up SIP Calculator
- SIP vs Lumpsum Comparison
- Goal-based SIP Calculator
- Inflation-Adjusted Calculator

For each calculator, use the same structure as the SIP calculator with:
- Clean HTML form
- Input validation
- Chart.js visualization
- Responsive design
- Error handling

=== COPY UNTIL HERE ===
```

---

## PROMPT 05: Step 1 - Personal Details

```markdown
# Prompt 5: 8-Events Calculator - Step 1 (Personal Details)

=== COPY FROM HERE ===

Create Step 1 of the 8-Events Financial Planning Wizard.

## Requirements:

This step collects comprehensive personal financial data:

### Data to Collect:

**1. Family Mode Toggle**
- Individual or Couple mode
- If couple, collect data for both persons

**2. Personal Information (for each person)**
- Name
- Age
- Retirement Age
- Monthly Income Sources (multiple, with add/remove rows)
- Other Income (annual)
- Provident Fund (monthly)

**3. Assets**
- Real Estate (table with: name, purchase year, purchase value, current value)
- Vehicles (table with: name, purchase year, purchase value, current value)
- Valuables (jewelry, etc.) - single amount
- Investments (mutual funds, stocks, etc.) - single amount
- Bank Balance - single amount

**4. Liabilities**
- Table with columns: Loan Type, Outstanding Amount, EMI, Remaining Tenure

**5. Insurance**
- Life Insurance Cover
- Health Insurance Cover

**6. Monthly Expenses (22 categories)**
Create input fields for:
- Housing (Rent/EMI)
- Utilities (Electricity, Water, Gas)
- Groceries
- Healthcare
- Education
- Transportation
- Fuel
- Dining Out
- Entertainment
- Clothing
- Personal Care
- Domestic Help
- Insurance Premiums
- EMI Payments
- Internet & Phone
- Subscriptions
- Pet Care
- Charity
- Gifts
- Travel
- House Maintenance
- Other Expenses

Show real-time total of all expenses.

### JavaScript Functions Needed:

```javascript
// Add/remove income rows
function addIncomeRow()
function removeIncomeRow(button)

// Add/remove asset/liability rows
function addRealEstate()
function addVehicle()
function addLiability()

// Calculate totals
function updateTotalIncome()
function updateTotalExpenses()
function updateNetWorth()

// Save to localStorage
function saveStep1()

// Load from localStorage
function loadStep1()

// Validate before proceeding
function validateStep1()
```

### localStorage Key:
Save all data as: `we_step1`

### File Structure:
- 8-events-calculator/step1.html
- 8-events-calculator/step1.js

Use the design system for styling. Include proper validation and error messages.

=== COPY UNTIL HERE ===
```

---

## PROMPT 06: Step 2 - Insurance Analysis

```markdown
# Prompt 6: 8-Events Calculator - Step 2 (Insurance Gap Analysis)

=== COPY FROM HERE ===

Create Step 2: Insurance Gap Analysis

## Requirements:

### Data Sources:
- Load from Step 1 (we_step1)
- Age, income, expenses, existing insurance

### Calculations:

**1. Life Insurance Need**
Formula: Annual Income × 15
Gap: Need - Existing Cover

**2. Health Insurance Need**
Formula:
- Tier 1 cities: Annual Income × 1.3
- Other cities: Annual Income × 1.0
Minimum: ₹5 lakhs per family member

Gap: Need - Existing Cover

**3. Emergency Fund**
Formula: Monthly Expenses × 6-12 months
(12 for single income, 9 for dual income, 6 for stable multiple incomes)

### Display:

Show 3 cards:
1. Life Insurance Gap
2. Health Insurance Gap
3. Emergency Fund Gap

Each showing:
- Recommended Amount
- Existing Amount
- Gap (in red if positive)
- Status indicator (✓ if sufficient, ⚠️ if gap exists)

### Files:
- 8-events-calculator/step2.html
- 8-events-calculator/step2.js

No new data to save - this is analysis only.

=== COPY UNTIL HERE ===
```

---

## PROMPT 07: Step 3 - Asset Analysis

```markdown
# Prompt 7: 8-Events Calculator - Step 3 (Asset Analysis)

=== COPY FROM HERE ===

Create Step 3: Asset Analysis with appreciation/depreciation

## Requirements:

Load assets from Step 1 and calculate current values.

### Formulas:

**Real Estate Appreciation**:
Current Value = Purchase Value × (1 + appreciation_rate)^age
Rates: Tier 1 cities: 8%, Tier 2: 6%, Tier 3: 4%

**Vehicle Depreciation**:
Current Value = Purchase Value × (1 - depreciation_rate)^age
Rates: Cars: 15% WDV, Two-wheelers: 20% WDV
Minimum residual: 10%

### Display:

Show tables with:
- Asset name
- Purchase year
- Purchase value
- Age (years)
- Appreciation/Depreciation rate
- Current value
- Gain/Loss

Summary section:
- Total Asset Value
- Total Liabilities
- Net Worth

Use Chart.js pie chart for asset allocation visualization.

### Files:
- 8-events-calculator/step3.html
- 8-events-calculator/step3.js

=== COPY UNTIL HERE ===
```

---

## PROMPT 08: Step 4 - Retirement & Goals

```markdown
# Prompt 8: 8-Events Calculator - Step 4 (Retirement & Goals)

=== COPY FROM HERE ===

Create Step 4: Retirement Planning + Life Goals

## Part 1: Retirement Calculation

### Formula (4% Rule):
Required Corpus = Future Monthly Expenses × 300

Where Future Monthly Expenses = Current Expenses × (1 + inflation)^years_to_retirement

### Display:
- Years to retirement (calculated from age)
- Current monthly expenses (from Step 1)
- Inflation rate (default 6%)
- Future monthly expenses
- Required retirement corpus

## Part 2: Life Goals

Allow users to add multiple goals:

### Goal Fields:
- Goal Name
- Target Amount
- Timeline (years)
- Priority (High/Medium/Low dropdown)

### For Each Goal, Calculate:
- Required Monthly SIP
  Formula: P = FV × r / [(1 + r)^n - 1] / (1 + r)
- Expected Return (based on timeline):
  - > 18 years: 15%
  - 15-17 years: 14.5%
  - 10-14 years: 12%
  - 7-9 years: 12%
  - 5-6 years: 9.5%
  - 3-4 years: 9.5%
  - < 3 years: 4.5%

### Show Summary:
- Total number of goals
- Total monthly SIP required
- Investment budget available (calculated from income - expenses)
- Shortfall/Surplus indicator

### localStorage Keys:
- we_step4_retirement (retirement data)
- we_step4_goals (array of goals)

### Files:
- 8-events-calculator/step4.html
- 8-events-calculator/step4.js

Include table with editable goals (add/edit/delete functionality).

=== COPY UNTIL HERE ===
```

---

## PROMPT 09: Step 5 - Expense Inflation

```markdown
# Prompt 9: 8-Events Calculator - Step 5 (Expense Inflation)

=== COPY FROM HERE ===

Create Step 5: Expense Inflation Projection

## Requirements:

Project how expenses will grow over time using category-specific inflation rates.

### Inflation Rates by Category:

```javascript
const categoryInflation = {
  'Healthcare': 12.0,
  'Education': 12.0,
  'Doctor Visits': 9.0,
  'Medicines': 9.0,
  'Insurance Premiums': 10.0,
  'Dining Out': 6.5,
  'Entertainment': 6.5,
  'Personal Care': 6.5,
  'Domestic Help': 8.0,
  'Utilities': 5.5,
  'Internet & Phone': 5.0,
  'Fuel & Transport': 6.0,
  'Clothing': 5.5,
  'Groceries': 4.5,
  'House Maintenance': 5.0,
  'EMI Payments': 0.0,  // Fixed
  'Other Expenses': 6.0
};
```

### Calculation:
For each category:
Future Value = Current Value × (1 + rate/100)^years

### Display:

**Table showing projection for 5, 10, 15, 20 years:**
| Category | Current | 5 Years | 10 Years | 15 Years | 20 Years |
|----------|---------|---------|----------|----------|----------|

**Chart.js Line Chart:**
- X-axis: Years (0-20)
- Y-axis: Total expenses
- Show how total expenses grow

**Summary:**
- Current total: ₹X
- In 10 years: ₹Y (growth %)
- In 20 years: ₹Z (growth %)
- Average inflation rate: %

### Files:
- 8-events-calculator/step5.html
- 8-events-calculator/step5.js

This is display-only, no new data to save.

=== COPY UNTIL HERE ===
```

---

## PROMPTS 10-12: ML System (3 Parts)

```markdown
# Prompt 10: ML Feature Engineering

=== COPY FROM HERE ===

Create feature engineering system for ML model.

Extract 22 features from goal + user profile data:

### Features to Extract:

**Goal Features (7):**
1. goal_type (0-7: retirement, emergency, marriage, education, house, vehicle, vacation, other)
2. goal_priority (0-2: Low, Medium, High)
3. goal_amount_normalized (amount / annual_income)
4. years_to_goal
5. required_sip
6. sip_to_income_ratio
7. portfolio_concentration (this goal SIP / total SIP)

**User Features (6):**
8. user_age
9. user_age_group (0-3: <30, 30-39, 40-49, 50+)
10. user_income_group (0-3: <50k, 50-100k, 100-200k, 200k+)
11. family_status (0-2: single, married, married_with_kids)
12. risk_profile (0-2: conservative, moderate, aggressive)
13. city_tier (0-1: tier 1 or other)

**Portfolio Features (4):**
14. total_goals
15. critical_goals (count of retirement/emergency/marriage/education)
16. budget_shortfall_percent
17. savings_rate (investment_budget / monthly_income)

**Time Features (3):**
18. is_near_term (1 if ≤3 years, else 0)
19. is_medium_term (1 if 4-10 years, else 0)
20. is_long_term (1 if >10 years, else 0)

**Interaction Features (3):**
21. age_income_interaction
22. goal_risk_interaction
23. budget_stress

Implement complete FeatureExtractor class in:
- 8-events-calculator/ml-features.js

=== COPY UNTIL HERE ===
```

```markdown
# Prompt 11: Already Created Above (ML Model)

See: 13-PROMPT-ML-Model.md (already complete)
```

```markdown
# Prompt 12: Outcome Tracking System

=== COPY FROM HERE ===

Create outcome tracking system for ML training data collection.

### OptimizationOutcomeTracker Class:

**Methods:**
- recordOptimizationAttempt(data) - Save when optimization happens
- recordUserDecision(id, accepted, feedback) - Save user accept/reject
- recordMonthlyProgress(userId, month, data) - Track ongoing adherence
- recordPlanAbandonment(id, reason) - Track if user stops
- getAllRecords() - Get all data
- exportForMLTraining() - Filter successful outcomes for training
- getStatistics() - Get acceptance rate, success rate, etc.

**Data Structure:**
```javascript
{
  optimizationId: string,
  timestamp: number,
  userId: string,
  userProfile: { ageGroup, incomeGroup, ... },
  originalGoals: [],
  optimizationApplied: { goalAdjustments: [] },
  budgetContext: {},
  userAccepted: boolean,
  outcome: {
    planStarted: boolean,
    monthsFollowed: number,
    goalsAchieved: [],
    planAbandoned: boolean
  }
}
```

Store in localStorage key: `we_optimization_outcomes`

File: 8-events-calculator/outcome-tracker.js

=== COPY UNTIL HERE ===
```

---

## PROMPT 13: Step 6 - Goal Optimization with ML

```markdown
# Prompt 13: Step 6 - ML-Powered Goal Optimization

=== COPY FROM HERE ===

Create Step 6: Goal Optimization using ML model.

## Flow:

1. **Load Data:**
   - Goals from Step 4
   - User profile from Step 1
   - Calculate investment budget (income - expenses)

2. **Check if Optimization Needed:**
   - Calculate total required SIP
   - If total SIP ≤ budget: Skip optimization, proceed to Step 7
   - If total SIP > budget: Continue with optimization

3. **For Each Goal:**
   - Call window.mlModel.predictConstraints(goal, userProfile, allGoals, historicalData)
   - Get: maxAmountReduction, maxTenureExtension, confidence

4. **Apply Optimization:**
   - Reduce goal amounts (within ML constraints)
   - Extend timelines (within ML constraints)
   - Prioritize High → Medium → Low priority goals
   - Recalculate SIPs until total fits budget

5. **Display:**
   - Show original vs optimized goals side-by-side
   - Table with columns:
     * Goal Name
     * Original Amount → Optimized Amount
     * Original Timeline → Optimized Timeline
     * Monthly SIP
   - Show total SIP before/after
   - Highlight that it now fits budget

6. **Get User Feedback:**
   - Buttons: Accept | Reject
   - If accepted: Save to we_plan_goals, record with outcomeTracker
   - If rejected: Ask for feedback, allow manual adjustment

### Files:
- 8-events-calculator/step6.html
- 8-events-calculator/step6.js

=== COPY UNTIL HERE ===
```

---

## PROMPT 14: Step 7 - Monte Carlo Simulation

```markdown
# Prompt 14: Step 7 - Monte Carlo Probability Simulation

=== COPY FROM HERE ===

Create Step 7: Monte Carlo Simulation for goal achievement probability.

## Requirements:

Run probabilistic simulation to show likelihood of reaching each goal.

### Algorithm:

```javascript
// Box-Muller transform for normal distribution
function generateNormalRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// Run simulation
function runMonteCarloSimulation(goal, numScenarios = 10000) {
  const monthlyReturn = goal.expectedReturn / 100 / 12;
  const monthlyVolatility = volatility / 100 / Math.sqrt(12);
  const finalValues = [];

  for (let i = 0; i < numScenarios; i++) {
    let corpus = goal.lumpsumInvestment || 0;

    for (let month = 0; month < goal.timeline * 12; month++) {
      // Random return
      const randomReturn = generateNormalRandom(monthlyReturn, monthlyVolatility);

      // Grow corpus
      corpus = corpus * (1 + randomReturn);

      // Add SIP
      corpus += goal.monthlySIP;
    }

    finalValues.push(corpus);
  }

  // Sort and calculate percentiles
  finalValues.sort((a, b) => a - b);

  const successCount = finalValues.filter(v => v >= goal.targetAmount).length;

  return {
    successRate: (successCount / numScenarios) * 100,
    percentiles: {
      p5: finalValues[Math.floor(numScenarios * 0.05)],
      p25: finalValues[Math.floor(numScenarios * 0.25)],
      p50: finalValues[Math.floor(numScenarios * 0.50)],
      p75: finalValues[Math.floor(numScenarios * 0.75)],
      p95: finalValues[Math.floor(numScenarios * 0.95)]
    }
  };
}
```

### Display:

For selected goal:
- Success Rate (large, prominent)
- Percentile table (5th, 25th, 50th, 75th, 95th)
- Histogram chart showing distribution
- Goal amount indicator line

### Options:
- Select goal from dropdown
- Number of scenarios: 1,000 / 10,000 / 25,000
- Volatility assumption: Conservative (15%) / Realistic (18%) / Aggressive (22%)

### Files:
- 8-events-calculator/step7.html
- 8-events-calculator/step7.js

=== COPY UNTIL HERE ===
```

---

## PROMPT 15: Step 8 - Investment Allocation

```markdown
# Prompt 15: Step 8 - Mutual Fund Allocation

=== COPY FROM HERE ===

Create Step 8: Investment Allocation Recommendations

## Requirements:

Recommend mutual fund allocation for each goal based on timeline and priority.

### Allocation Logic:

**By Timeline:**
- 0-3 years: 100% Debt (Liquid, Ultra Short)
- 3-5 years: 60% Debt, 40% Equity (Conservative Hybrid)
- 5-10 years: 40% Debt, 60% Equity (Aggressive Hybrid, Large Cap)
- 10+ years: 100% Equity (Flexi Cap, Large Cap, Mid Cap)

**Sample Recommendations:**

```javascript
const recommendations = {
  '0-3 years': [
    { category: 'Liquid Fund', allocation: 60 },
    { category: 'Ultra Short Duration', allocation: 40 }
  ],
  '3-5 years': [
    { category: 'Conservative Hybrid', allocation: 60 },
    { category: 'Large Cap', allocation: 40 }
  ],
  '5-10 years': [
    { category: 'Aggressive Hybrid', allocation: 40 },
    { category: 'Large Cap', allocation: 30 },
    { category: 'Mid Cap', allocation: 30 }
  ],
  '10+ years': [
    { category: 'Flexi Cap', allocation: 40 },
    { category: 'Large Cap', allocation: 30 },
    { category: 'Mid Cap', allocation: 20 },
    { category: 'Small Cap', allocation: 10 }
  ]
};
```

### Display:

For each goal:
- Goal name and timeline
- Monthly SIP allocation
- Recommended fund categories with percentages
- Pie chart visualization
- Link to Mutual Fund Analyzer for specific fund selection

### Save:
localStorage key: we_step8_assignments

### Files:
- 8-events-calculator/step8.html
- 8-events-calculator/step8.js

=== COPY UNTIL HERE ===
```

---

## PROMPTS 16-17: Mutual Fund Analyzer (2 Parts)

```markdown
# Prompt 16: Mutual Fund API Integration

=== COPY FROM HERE ===

Create API integration layer for mutual fund data.

### API Details:
- Base URL: https://api.mfapi.in
- Endpoints:
  * GET /mf - All funds list
  * GET /mf/{schemeCode} - Fund NAV history

### Implementation (mutual-fund-analyzer/js/api.js):

**Features:**
- 30-second timeout with AbortController
- Retry logic (3 attempts, exponential backoff)
- Error handling (404, 429, 500+)
- Response validation
- Caching (5 minute TTL)

**Functions:**
```javascript
async function fetchAllFunds()
async function fetchNavHistory(schemeCode)
async function retryApiCall(apiCall, attempts = 3)
function getBenchmarkName(fundName)
```

### Fund Filtering:

24 categories support:
- Flexi Cap, Large Cap, Mid Cap, Small Cap
- Large & Mid Cap, Multi Cap
- Value, Contra, Focused
- ELSS, Dividend Yield
- Index, Sectoral
- Aggressive Hybrid, Conservative Hybrid, Balanced Advantage
- Equity Savings, Multi Asset
- International, Debt, Liquid, Banking & PSU, Corporate Bond

**Filter Functions:**
```javascript
function filterByCategory(funds, category)
function filterByPlan(funds, planType)  // Direct/Regular
function filterByAMC(funds, amc)
function excludeDefunctFunds(funds)
```

### Files:
- mutual-fund-analyzer/js/api.js
- mutual-fund-analyzer/js/utils.js (helper functions)

=== COPY UNTIL HERE ===
```

```markdown
# Prompt 17: Mutual Fund Analyzer React UI

=== COPY FROM HERE ===

Create React-based Mutual Fund Analyzer with advanced metrics.

### Components:

**1. App.js (Main Component)**
- Fund search/filter controls
- Fund list display
- Fund comparison table
- Chart visualizations

**2. Components:**
```javascript
// FundFilter - Category, Plan, AMC dropdowns
function FundFilter({ onFilterChange })

// FundList - Display filtered funds
function FundList({ funds, onFundSelect })

// FundDetails - Show selected fund details
function FundDetails({ fund, navHistory })

// FundComparison - Compare multiple funds
function FundComparison({ selectedFunds })

// MetricsChart - NAV history chart
function MetricsChart({ navHistory })
```

### Metrics to Calculate (mutual-fund-analyzer/js/calculations.js):

**1. CAGR:**
```javascript
function calculateCAGR(startNAV, endNAV, years) {
  return (Math.pow(endNAV / startNAV, 1 / years) - 1) * 100;
}
```

**2. Annualized Returns:**
```javascript
function calculateAnnualizedReturns(navHistory, period) {
  // For 1Y, 3Y, 5Y, 10Y
}
```

**3. Sharpe Ratio:**
```javascript
function calculateSharpeRatio(returns, riskFreeRate = 6.5) {
  const avgReturn = mean(returns) * 252;  // Annualize
  const stdDev = standardDeviation(returns) * Math.sqrt(252);
  return (avgReturn - riskFreeRate) / stdDev;
}
```

**4. Sortino Ratio:**
```javascript
function calculateSortinoRatio(returns, riskFreeRate = 6.5) {
  const avgReturn = mean(returns) * 252;
  const downsideReturns = returns.filter(r => r < 0);
  const downsideStdDev = standardDeviation(downsideReturns) * Math.sqrt(252);
  return (avgReturn - riskFreeRate) / downsideStdDev;
}
```

**5. Maximum Drawdown:**
```javascript
function calculateMaxDrawdown(navHistory) {
  let maxDD = 0;
  let peak = navHistory[0];

  navHistory.forEach(nav => {
    if (nav > peak) peak = nav;
    const dd = (peak - nav) / peak;
    maxDD = Math.max(maxDD, dd);
  });

  return maxDD * 100;
}
```

**6. Rolling Returns:**
```javascript
function calculateRollingReturns(navHistory, windowYears = 3) {
  // Calculate overlapping 3-year returns
}
```

### Display:

- Fund details card (name, category, AMC)
- Returns table (1Y, 3Y, 5Y, 10Y)
- Risk metrics (Sharpe, Sortino, Max DD, Volatility)
- NAV history chart
- Rolling returns chart
- Comparison table (up to 5 funds)

### Files:
- mutual-fund-analyzer/index.html
- mutual-fund-analyzer/js/app.js (React)
- mutual-fund-analyzer/js/calculations.js
- mutual-fund-analyzer/js/components.js
- mutual-fund-analyzer/styles.css

Use React CDN:
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

=== COPY UNTIL HERE ===
```

---

## PROMPT 18: Tax Calculator

```markdown
# Prompt 18: Income Tax Calculator

=== COPY FROM HERE ===

Create comprehensive Income Tax Calculator for Indian tax system.

### Tax Slabs (FY 2025-26):

**New Regime:**
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

const standardDeduction = 75000;
const rebate87A = 25000;  // If income ≤ 7 lakhs
```

**Old Regime:**
```javascript
const oldRegimeSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 }
];

// Deductions: 80C (1.5L), 80D (25k-50k), HRA, etc.
```

### Features:

**1. Income Inputs:**
- Gross Salary
- Other Income (rental, interest, etc.)
- Capital Gains (STCG, LTCG)

**2. Deductions (Old Regime):**
- 80C (up to ₹1.5 lakhs)
- 80D (health insurance)
- HRA
- Home loan interest

**3. Calculations:**
- Tax in both regimes
- Cess (4%)
- Net tax payable
- Tax saved (difference between regimes)

**4. Display:**
- Side-by-side comparison table
- Bar chart comparing both regimes
- Recommendation (which regime is better)
- Slab-wise breakdown

### Files:
- tax-calculator/index.html
- tax-calculator/tax-calc.js
- tax-calculator/styles.css

Include assessment year selector (2024-25, 2025-26, 2026-27).

=== COPY UNTIL HERE ===
```

---

## PROMPT 19: Financial Snapshot

```markdown
# Prompt 19: Financial Snapshot Dashboard

=== COPY FROM HERE ===

Create visual dashboard of user's complete financial health.

### Data Sources:
- Load from Step 1 (we_step1)
- Aggregate all data

### Visualizations:

**1. Net Worth Card:**
```
Net Worth = Total Assets - Total Liabilities

Total Assets = Real Estate + Vehicles + Valuables + Investments + Bank Balance
Total Liabilities = Sum of all outstanding loans
```

**2. Monthly Cash Flow:**
```
Monthly Income = Sum of all income sources
Monthly Expenses = Sum of all expense categories
Monthly Surplus/Deficit = Income - Expenses - EMIs
```

**3. Asset Allocation Pie Chart:**
- Real Estate: X%
- Vehicles: Y%
- Investments: Z%
- Bank Balance: W%
- Others: V%

**4. Expense Breakdown Pie Chart:**
- Housing: X%
- Food: Y%
- Healthcare: Z%
- (Show top 10 categories)

**5. Income vs Expenses Bar Chart:**
- Income bar
- Fixed expenses bar
- Variable expenses bar
- Savings bar

**6. Liabilities Summary:**
- Table showing all loans
- Total outstanding
- Monthly EMI burden
- Debt-to-Income ratio

### Cards to Display:
- Net Worth (big, prominent)
- Monthly Income
- Monthly Expenses
- Monthly Savings
- Total Assets
- Total Liabilities
- Debt-to-Income Ratio
- Savings Rate

### Files:
- financial-snapshot/index.html
- financial-snapshot/snapshot.js
- financial-snapshot/styles.css

Use multiple Chart.js charts for visualization.

=== COPY UNTIL HERE ===
```

---

## PROMPT 20: Integration & Testing

```markdown
# Prompt 20: Integration Testing & Bug Fixes

=== COPY FROM HERE ===

Create comprehensive testing suite and fix integration issues.

### Test Cases:

**1. Calculator Tests:**
```javascript
// Test SIP calculation
function testSIPCalculation() {
  const result = calculateSIPFutureValue(10000, 12, 10);
  assert(Math.abs(result - 2323391) < 100, 'SIP calculation failed');
}

// Test all 15 calculators with known values
```

**2. Step Flow Tests:**
```javascript
// Test data flows from Step 1 → Step 8
function testStepFlow() {
  // Save dummy data in Step 1
  // Verify Step 2 loads it correctly
  // ... through Step 8
}
```

**3. ML System Tests:**
```javascript
// Test feature extraction
function testFeatureExtraction() {
  const features = window.featureExtractor.extractGoalFeatures(...);
  assert(features.length === 22, 'Feature count mismatch');
}

// Test prediction
function testMLPrediction() {
  const constraints = await window.mlModel.predictConstraints(...);
  assert(constraints.maxAmountReduction >= 0 && constraints.maxAmountReduction <= 0.7);
}
```

**4. API Tests:**
```javascript
// Test fund fetch
async function testFundFetch() {
  const funds = await fetchAllFunds();
  assert(funds.length > 0, 'No funds returned');
}

// Test error handling
async function testAPIErrorHandling() {
  // Test timeout, retry, etc.
}
```

### Integration Checklist:

- [ ] All calculators work correctly
- [ ] Step 1-8 navigation flows smoothly
- [ ] Data persists in localStorage
- [ ] Theme toggle works on all pages
- [ ] Charts render without errors
- [ ] ML model loads (or falls back to rules)
- [ ] API calls succeed with retry logic
- [ ] Mobile responsive on all pages
- [ ] No console errors
- [ ] Dark mode works everywhere

### Bug Fix Guide:

Create a file: testing/bug-fixes.md

Document:
- Common issues found
- Solutions applied
- Edge cases handled

### Files to Create:
- testing/test-suite.html
- testing/test-runner.js
- testing/test-cases.js
- testing/bug-fixes.md

=== COPY UNTIL HERE ===
```

---

## 🎯 Summary

**YOU NOW HAVE:**
- ✅ 4 complete, ready-to-use prompts
- ✅ 16 detailed prompt templates above
- ✅ All formulas, algorithms, and specifications
- ✅ Complete build order and dependencies

**TOTAL: 20 PROMPTS TO BUILD ENTIRE APP**

**Estimated Build Time:** 55-65 hours with AI assistance

**Next Steps:**
1. Start with Prompt 01 (Design System)
2. Work through in order
3. Test after each prompt
4. Use templates above for remaining prompts
5. Refer to main documentation for detailed specs

---

**Ready to build! 🚀**
