# 8 Events Calculator — AI Instructions

## When to Activate
Activate this full calculator flow when the user says any of:
- "run my 8 events plan" / "8 events" / "financial plan"
- "how much do I need to retire" / "retirement corpus"
- "insurance gap" / "how much SIP do I need"
- Taps the "Run 8 Events Plan" chip (triggers: "Run my complete 8 events financial plan. Use my existing account data and ask me only for what's missing.")

## What You Already Know (from the financial snapshot)
Extract these directly — DO NOT ask:
- Monthly income → from `Monthly Income (profile)`
- Monthly expenses → from `This Month Spend` or profile expenses
- Assets and liabilities → from `ASSETS` and `LIABILITIES` sections
- City → from profile (use for metro detection)
- Existing subscriptions, net worth

## Goals — Critical Rule
**When the user message includes a "Financial Goals:" section, use ONLY those goals.** Do NOT pull goals from the snapshot's `GOALS` section and do NOT invent or assume additional goals.

If the user message says "Financial Goals: None specified", compute only Emergency Fund and Retirement — no other goals.

If the user message does NOT contain a "Financial Goals:" section at all (e.g. they typed freeform), then you may use goals from the snapshot's `GOALS` section.

## What You Must Ask (minimum required inputs)
The user fills a form before submitting — all required data arrives in the message. Do NOT ask follow-up questions. Present the plan immediately.

## ⚠ PRE-COMPUTED VALUES — USE THESE, DO NOT RECALCULATE

When the user message contains `<!-- COMPUTED_8_EVENTS:{...} -->`, **ALL numbers have already been calculated by the backend in JavaScript**. Extract and display these exact values. Do NOT attempt to recalculate anything — your job is formatting and explaining, not computing.

Extract from the JSON block:
- `lifeInsuranceRequired`, `lifeInsuranceGap`, `healthInsuranceRequired`, `healthInsuranceGap`
- `emergencyFundCorpus`, `emergencyFundFV`, `emergencyFundSIP`
- `retirementCorpus`, `retirementSIP`, `yearsToRetirement`, `monthlyExpenseAtRetirement`
- `goals[]` → each has `name`, `currentCost`, `futureValue`, `sip`, `years`, `returnRate`
- `monthlyInvestmentBudget`, `totalMonthlySIPRequired`, `budgetUtilizationPct`, `wasOptimized`

Use these numbers verbatim in your response and in the SAVE_8_EVENTS marker.

If no `<!-- COMPUTED_8_EVENTS -->` block is present (fallback), use the formulas below.

## Computation Steps (fallback only — use if no pre-computed block present)

### Metro Detection
Metro cities: Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Bangalore, Pune, Hyderabad, Ahmedabad
- Metro health multiplier: 1.3
- Non-Metro health multiplier: 1.1

### Step 3A: Insurance Gap
```
annual_income = monthly_income × 12

Life Insurance Required = annual_income × 15
Life Insurance Gap = max(0, Life Required − existing_term_insurance)

Health Insurance Required = annual_income × health_multiplier
Health Insurance Gap = max(0, Health Required − existing_health_insurance)
```

### Step 3B: Emergency Fund
```
emergency_fund_corpus = monthly_expenses × 6
emergency_fund_FV = emergency_fund_corpus × (1.06)^3   [3-year target, 6% inflation]
emergency_fund_return_rate = 4.5% annual = 0.375%/month
emergency_fund_SIP = binary_search(emergency_fund_FV, 3_years, 4.5%, 8%_stepup)
```

### Step 4: Retirement Corpus
```
years_to_retirement = retirement_age − current_age
years_in_retirement = 85 − retirement_age   [life expectancy = 85]

For each expense that continues in retirement:
  inflate to retirement: expense × (1 + inflation_rate)^years_to_retirement

Expense inflation rates (use these exactly):
  Grocery & Toiletries: 4.5%
  House Rent/Maintenance: 4.5%
  Vehicle Fuel/Servicing: 4.5%
  Doctor/Medicines: 9.0%
  Utilities: 5.5%
  Maid/Laundry: 6.5%
  Gadgets (devices): 3.0%
  Gadgets (internet/mobile): 5.5%
  Clothes/Accessories: 4.5%
  Shopping/Gifts: 5.5%
  Dining/Movies/Sports: 6.5%
  Coach (Financial/Fitness): 6.5%
  Travel/Holidays: 6.5%
  Charity/Donations: 0.0%
  House Renovations/Celebrations: 6.5%
  Children school/college: 12.0%
  Children pocket money: 4.5%
  Contribution to parents/siblings: 4.5%
  Personal Expenses: 5.5%
  Any unlisted category: use 5.5%

If you don't know which expenses continue in retirement, assume:
  - Grocery, Utilities, Medical, Personal Expenses, Travel → CONTINUE
  - Children fees, EMIs, commute, work clothes → STOP

Mret = sum of all inflation-adjusted continuing monthly expenses at retirement

real_return = (1.07 / 1.06) − 1 = 0.009434 (0.9434% per year)
corpus_base = Mret × 12 × [1 − (1 + real_return)^(−years_in_retirement)] / real_return
retirement_corpus = corpus_base × 1.5   [50% safety buffer]
```

### Pre-Retirement Return Rate (tier table)
```
years_to_retirement > 18  → 15%
years 15–17               → 14.5%
years 10–14               → 12%
years 7–9                 → 11%
years 5–6                 → 9.5%
years 3–4                 → 9.5%
years 0–2                 → 4.5%
emergency fund always     → 4.5%
```

### SIP Calculation Algorithm (use for ALL goals)
```
Inputs: target_FV, years_left, annual_return_rate, step_up = 8%
monthly_rate = annual_rate / 12
n = years_left × 12

fvFromSip(initialSip):
  totalFV = 0
  for year = 0 to ceil(n/12) − 1:
    sip_this_year = initialSip × (1 + 0.08)^year
    for month = 0 to min(12, n − year×12) − 1:
      months_remaining = n − (year × 12 + month)
      totalFV += sip_this_year × (1 + monthly_rate)^months_remaining
  return totalFV

Binary search (50 iterations):
  low = 0, high = target_FV / n × 5 + 1
  repeat 50 times:
    mid = (low + high) / 2
    if |fvFromSip(mid) − target_FV| < 1000: return mid
    if fvFromSip(mid) >= target_FV: high = mid
    else: low = mid
  return high
```

### Step 4: Goals
For each user goal from snapshot:
```
years_left = target_year − current_year
FV = current_cost × (1.06)^years_left   [6% inflation for all goals]
annual_return = from tier table above based on years_left
SIP = binary_search(FV, years_left, annual_return, 8%)
```

Marriage goal (if unmarried):
```
years_to_marriage = marriage_age − current_age
FV = wedding_budget_today × (1.06)^years_to_marriage
SIP = binary_search(FV, years_to_marriage, 12%, 8%)
```

### Step 5: Budget Review and Optimization
```
investment_budget = monthly_income × (Investment Budget % from user message)
[Read % from: "Investment Budget: X% of monthly income" in the user message. Default 30% if not specified.]
total_SIP_required = retirement_SIP + emergency_SIP + sum(all_goal_SIPs)
utilization = total_SIP_required / investment_budget × 100
```

**If utilization > 100% (over budget), run optimizer:**
Protected goals (reduce carefully):
- Emergency Fund: max 30% FV reduction, max 1 year extension
- Retirement: max 20% FV reduction, max 1 year extension
- Marriage/Wedding: max 25% FV reduction, max 1 year extension
- Education/Children: max 25% FV reduction, max 1 year extension

Other goals: max 50% FV reduction, max 5 year extension

Try combinations of (reduction%, extension_years):
  reductions = [25%, 30%, 35%]
  extensions = [0, 1, 2 years]
For each combo: recalculate SIPs → if total ≤ budget, use this plan
Show user what changed and why.

## Output Format

Once all calculations are complete, follow the presentation structure defined in "8 events output.md" exactly.

The only addition before the presentation: emit the SAVE marker (below) on its own line first — it is invisible to the user.

## Save Marker (MANDATORY — always include at the very end, after all detail)
Emit this HTML comment on its own line — NOT inside a code block, NOT wrapped in backticks. **Use the exact values from `<!-- COMPUTED_8_EVENTS -->` block** (or your own calculations if no block was provided):

<!--SAVE_8_EVENTS:{"age":AGE,"retirementAge":RETIREMENT_AGE,"city":"CITY_NAME","familyMode":"individual_or_couple","isMetroCity":METRO_BOOL,"existingTermInsurance":EXISTING_TERM,"existingHealthInsurance":EXISTING_HEALTH,"lifeInsuranceRequired":LIFE_REQUIRED,"lifeInsuranceGap":LIFE_GAP,"healthInsuranceRequired":HEALTH_REQUIRED,"healthInsuranceGap":HEALTH_GAP,"emergencyFundCorpus":EMERGENCY_CORPUS,"emergencyFundFV":EMERGENCY_FV,"emergencyFundSIP":EMERGENCY_SIP,"retirementCorpus":RETIREMENT_CORPUS,"retirementSIP":RETIREMENT_SIP,"yearsToRetirement":YEARS_TO_RET,"yearsInRetirement":YEARS_IN_RET,"monthlyExpenseAtRetirement":MONTHLY_EXPENSE_AT_RET,"goals":[{"name":"GOAL_NAME","currentCost":COST,"futureValue":FV,"sip":SIP,"years":YEARS,"returnRate":RETURN_RATE,"isProtected":PROTECTED_BOOL,"wasOptimized":OPTIMIZED_BOOL}],"investmentBudgetPct":INVESTMENT_PCT_FROM_USER_MESSAGE,"monthlyInvestmentBudget":MONTHLY_BUDGET,"totalMonthlySIPRequired":TOTAL_SIP,"budgetUtilizationPct":BUDGET_PCT,"wasOptimized":OPTIMIZED_BOOL}-->

IMPORTANT: "investmentBudgetPct" must be the exact % the user specified in their message (e.g. if user said "Investment Budget: 35% of monthly income", use 35 — NOT 30).
Fill every field with real computed numbers. Both markers (PLAN_SUMMARY and SAVE_8_EVENTS) are invisible to the user.

---

8 Events Calculator — Complete Technical Explanation (From Source Code)
What it is
The 8 Events Calculator is a sequential 8-step financial planning tool. Each step collects or computes specific data, stores it in localStorage, and passes it forward. The steps are:

Snapshot → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8

(Steps 1 & 2 are the initial data entry form 8-events.html and the snapshot.html review page.)

Step 1: Data Entry — 8-events.html + 8-events.js
What is collected:

Family Mode — User picks individual or couple. This single switch changes every calculation downstream.

Personal Details (Individual):

Full Name, Age, Retirement Age, Marital Status (Married/Unmarried), City
Personal Details (Couple):

Husband Name, Husband Age, Husband Retirement Age
Wife Name, Wife Age, Wife Retirement Age, Wife Working Status (working/housewife)
City (shared)
Income — Dynamic rows, each with:

Source name (Salary, Business, Rental, etc.)
Monthly amount
Owner: self (individual) or husband / wife (couple)
Expenses — Dynamic rows, each with:

Expense name (must match one of 19+ category names)
Monthly amount OR Annual amount (converted to monthly as annual / 12)
Whether expense continues post-retirement (continues: true/false)
Exact inflation rate assigned per expense category (hardcoded):

Expense Category	Inflation Rate
Grocery & Toiletries	4.5%
House Rent, Maintenance, Repair	4.5%
Vehicle - Fuel, Servicing	4.5%
Doctor Visits, Medicines	9.0%
Utilities (Electricity, Property tax)	5.5%
Maid, Laundry, Newspaper	6.5%
Gadgets - Mobile/TV devices	3.0%
Gadgets - Internet/Mobile plans	5.5%
Clothes & Accessories	4.5%
Shopping, Gifts	5.5%
Dining, Movies, Sports	6.5%
Coach - Financial, Fitness	6.5%
Travel, Annual holidays	6.5%
Charity, Donations	0.0%
House renovations, Celebrations	6.5%
Children school / college fees	12.0%
Children pocket money	4.5%
Contribution to parents, siblings	4.5%
Personal Expenses	5.5%
Assets & Liabilities — Each row has:

Name, Type (asset or liability), Current Value, EMI (monthly, only for liabilities)
Existing Investments — Each row has:

Name, Amount, Frequency (Monthly, Quarterly, Yearly), Type
Existing Insurances — Each row has:

Name, Type (Term, Health, ULIP), Sum Assured, Premium, Term, Payment Mode (Monthly/Quarterly/Half Yearly/Yearly)
Storage: Everything saved as localStorage.setItem('we_step1', JSON.stringify(data))

Snapshot — snapshot.html + snapshot.js
Purpose: Financial health overview before progressing. Also where the user sets the SIP investment percentage.

Calculations performed:


Total Monthly Income     = Sum of all income[].value
Total Monthly Expenses   = Sum of expenses[].monthly + expenses[].annual/12
Total Monthly EMIs       = Sum of assets[] where type='liability' → emi
Total Monthly Insurance  = Sum of insurances[] premiums converted to monthly
Total Monthly Investments = Sum of investments[] amounts converted to monthly

Net Worth     = Total Assets (value where type='asset') − Total Liabilities (value where type='liability')
Monthly Surplus = Income − Expenses − EMIs − Insurances − Investments
Investment Rule (SIP Budget):

User adjusts a slider: what % of monthly income to invest
Default: 30%
Formula: SIP Budget = Monthly Income × Percentage / 100
Stored as: localStorage.setItem('we_invest_rule', JSON.stringify({ pct: 30 }))
Example:


Monthly Income:     ₹1,00,000
Monthly Expenses:   ₹45,000
Monthly EMIs:       ₹15,000
Monthly Insurance:  ₹5,000
Monthly Investments: ₹10,000
Net Worth:          ₹80,00,000 (assets) − ₹20,00,000 (loans) = ₹60,00,000
Monthly Surplus:    ₹1,00,000 − ₹45,000 − ₹15,000 − ₹5,000 − ₹10,000 = ₹25,000

SIP Budget (30%): ₹1,00,000 × 30% = ₹30,000
Step 3: Insurance Gap Analysis — step3.js
Metro city detection (exact list):
mumbai, delhi, kolkata, chennai, bengaluru, bangalore, pune, hyderabad, ahmedabad

Health multiplier:

Metro: 1.3
Non-Metro: 1.1
Individual Mode

Annual Income = Monthly Income × 12

Life Insurance Required = Annual Income × 15
Life Insurance Gap      = Max(0, Life Required − Existing Term Insurance)

Health Insurance Required = Annual Income × health_multiplier
Health Insurance Gap      = Max(0, Health Required − Existing Health Insurance)
Example (Mumbai, ₹1,00,000/month income, ₹50L existing term, ₹5L existing health):


Annual Income = ₹12,00,000
Life Required = ₹12,00,000 × 15 = ₹1,80,00,000
Life Gap = ₹1,80,00,000 − ₹50,00,000 = ₹1,30,00,000

Health Required = ₹12,00,000 × 1.3 = ₹15,60,000
Health Gap = ₹15,60,000 − ₹5,00,000 = ₹10,60,000
Couple Mode
Life Insurance:


Husband Life Required = Husband Annual Income × 15
Wife Life Required    = Wife Annual Income × 15   (only if wifeWorkingStatus === 'working')
Housewife             = "Not required"

If existing term insurance exists, split it proportionally:
  husband_share = husband_life_required / total_life_required
  wife_share    = wife_life_required / total_life_required

  Husband Gap = Max(0, Husband Required − existing_term × husband_share)
  Wife Gap    = Max(0, Wife Required − existing_term × wife_share)
Health Insurance:


Total Health Required = Total Annual Income × health_multiplier
Husband Health = Total Health Required × 0.5   ← Policy A
Wife Health    = Total Health Required × 0.5   ← Policy B

Husband Health Gap = Max(0, Husband Health − existing_health × 0.5)
Wife Health Gap    = Max(0, Wife Health − existing_health × 0.5)
Emergency Fund

Emergency Fund = Monthly Expenses × 6
Target Achievement: 3 years from today
Return Rate: Always 4.5% (conservative, regardless of tenure)
Future Value = Emergency Fund × (1.06)^3
The SIP to achieve this is calculated using binary search (see SIP algorithm below).

Emergency Fund SIP Example:


Monthly Expenses = ₹60,000
Emergency Fund = ₹60,000 × 6 = ₹3,60,000
FV in 3 years @ 6% inflation = ₹3,60,000 × (1.06)^3 = ₹4,28,624
Return Rate = 4.5% annual = 0.375%/month
Step-up = 8% (from we_invest_rule)

Binary search finds: SIP ≈ ₹10,800/month
Marriage Goal (only for unmarried individuals)

User inputs: marriage_age, total_expense_today
years_to_marriage = marriage_age − current_age
FV = total_expense × (1.06)^years_to_marriage
Return Rate: 12% (equity investment)
Example:


Current Age: 27, Marriage Age: 31 → 4 years
Today's Cost: ₹8,00,000
FV = ₹8,00,000 × (1.06)^4 = ₹10,09,967
SIP @ 12%, 4 years, 8% step-up → ~₹17,400/month
Both goals are saved to localStorage (we_emergency_goal, we_marriage_goal) and picked up in Step 4.

Step 4: Retirement Corpus & Other Goals — step4.js
Retirement Corpus Calculation
Step 4a — Inflate each continuing expense to retirement date:


For each expense where continues = true:
  base_monthly = expense.monthly + expense.annual/12
  rate = itemInflationRates[expense.name] / 100
  inflated = base_monthly × (1 + rate)^years_to_retirement

Mret = Sum of all inflated continuing expenses
Step 4b — Post-retirement real return:


Post-Retirement Portfolio Return (rPost) = 7%   (conservative balanced fund)
Post-Retirement Inflation (piPost)       = 6%
Real Return (rReal) = (1 + 0.07) / (1 + 0.06) − 1 = 0.9434%
Step 4c — Corpus using Present Value of annuity formula:


If rReal ≈ 0 (very rare):
  Corpus_base = Mret × 12 × Nret

Otherwise:
  Corpus_base = Mret × 12 × [1 − (1 + rReal)^(−Nret)] / rReal

Final Corpus = Corpus_base × 1.5    ← 50% safety buffer added
Where:

Nret = Life Expectancy − Retirement Age (years in retirement, default life expectancy = 85)
Individual Mode Example:


Current Age: 32, Retirement Age: 60, Life Expectancy: 85
years_to_retirement (nToRet) = 28
years_in_retirement (Nret) = 85 − 60 = 25

Continuing monthly expenses:
  Grocery ₹8,000 @ 4.5% for 28 years = ₹8,000 × (1.045)^28 = ₹25,100
  Medical ₹3,000 @ 9.0% for 28 years = ₹3,000 × (1.09)^28 = ₹30,680
  Utilities ₹4,000 @ 5.5% for 28 years = ₹4,000 × (1.055)^28 = ₹18,290
  (and so on for all continuing expenses...)
  Total Mret = ₹1,10,000/month (example)

rReal = (1.07/1.06) − 1 = 0.009434 (i.e. 0.9434% per year)
Corpus_base = ₹1,10,000 × 12 × [1 − (1.009434)^(−25)] / 0.009434
            = ₹13,20,000 × [1 − 0.7925] / 0.009434
            = ₹13,20,000 × 21.99
            = ₹2,90,27,000

Final Corpus = ₹2,90,27,000 × 1.5 = ₹4,35,40,000 (₹4.35 Cr)
Couple Mode:

Each spouse calculates 100% of family expenses inflated to their own retirement date. The two corpuses are added together.


Husband corpus: Mret inflated to husband's retirement date × annuity factor × 1.5
Wife corpus:    Mret inflated to wife's retirement date × annuity factor × 1.5
Total Corpus  = Husband Corpus + Wife Corpus
Pre-Retirement Annual Return Rate (Tier-Based, from actual code)
Years to Retirement	Annual Return
> 18 years	15%
15 to 17 years	14.5%
10 to 14 years	12%
7 to 9 years	11%
5 to 6 years	9.5%
3 to 4 years	9.5%
0 to 2 years	4.5%
Emergency Fund (always)	4.5%
SIP Calculation Algorithm (used everywhere — Step 3, 4, 5, 6, 7)
The same binary search + step-up algorithm is used for every goal:


Inputs:
  target_fv   = future value needed
  years_left  = years to goal
  step_up     = annual SIP increase rate (default 8%, max 10%)
  annual_rate = from return tier table above
  monthly_rate = annual_rate / 12
  n = years_left × 12   (total months)

Algorithm — fvFromSip(initialSip):
  totalFV = 0
  for year = 0 to ceil(n/12) − 1:
    sip_this_year = initialSip × (1 + step_up)^year
    for month = 0 to min(12, n − year×12) − 1:
      months_remaining = n − (year×12 + month)
      totalFV += sip_this_year × (1 + monthly_rate)^months_remaining
  return totalFV

Binary search — solveSip():
  low = 0
  high = target_fv / n × 5 + 1
  repeat 50 times (or 100 in some steps):
    mid = (low + high) / 2
    fv = fvFromSip(mid)
    if |fv − target_fv| < 1000: return mid   ← converged
    if fv >= target_fv: high = mid
    else: low = mid
  return high
SIP Example — Retirement Corpus:


Target: ₹4,35,40,000
Years: 28 → 336 months
Annual Return: 15% (since 28 > 18)
Monthly Rate: 15%/12 = 1.25%/month
Step-up: 8%

Binary search finds: Initial SIP ≈ ₹12,500/month

Verification:
Year 1: ₹12,500 × 12 months at 1.25%/month
Year 2: ₹13,500 (= ₹12,500 × 1.08) × 12 months
Year 3: ₹14,580 × 12 months
...
Year 28: ₹12,500 × (1.08)^27 = ₹86,400/month
Total FV across all months ≈ ₹4,35,40,000 ✓
Goals Table (Other Goals):

User adds rows with:

Goal Name, Current Cost, Target Year, Priority (High/Medium/Low)
Auto-calculated: Years Left, Future Value, Required SIP

Years Left = Target Year − Current Year
FV = Current Cost × (1.06)^years_left   ← 6% inflation always for goals
SIP = solve using binary search with tier return rate based on years_left
Example (Car goal):


Goal: Buy Car
Current Cost: ₹12,00,000
Target Year: 2030 → 4 years
FV = ₹12,00,000 × (1.06)^4 = ₹15,14,972
Return: 9.5% (4 years → 3-4 year tier)
Step-up: 8%
SIP ≈ ₹27,800/month
Pre-loaded goals from Step 3 (Emergency Fund and Marriage) are automatically placed at the top of the goals table.

Step 5: SIP Budget Review — step5.js
Purpose: Show total SIP required vs. available budget. Detect if over-budget.

Calculations:


Budget = Monthly Income × investment_pct / 100
         (investment_pct comes from we_invest_rule.pct, default 30%)

Retirement SIP: Re-computed from we_step4_retirement corpus using sipFor()

For each goal: recalculate SIP using sipFor(fv, yearsLeft, stepUp)

Total Required = Retirement SIP + Sum of all goal SIPs

Utilization = Total Required / Budget × 100
Budget status display rules (exact from code):

Utilization %	Bar Color	Message
90–95%	Green #22c55e	"Optimal! Budget utilization maximized..."
95–100%	Blue #3b82f6	"Excellent! Budget utilization optimized..."
> 100%	Red #ef4444	"Budget exceeded! Plan optimized for maximum..."
80–90%	Green #10b981	"Good! Budget utilization is efficient..."
< 80%	Amber #f59e0b	"Budget utilization is low. Consider increasing goal amounts..."
Example:


Monthly Income: ₹1,00,000
Investment %: 30%
Budget = ₹30,000

Retirement SIP:  ₹12,500
Emergency Fund:  ₹10,800
Car Goal:        ₹27,800 (if planned)
Total Required = ₹51,100

Utilization = ₹51,100 / ₹30,000 × 100 = 170%   ← Red, exceeded
User must either optimize or increase budget
If over budget, user can click Optimize which reduces non-protected goals by 25%, 30%, or 35% and extends their target years by 0, 1, or 2 years — trying combinations until total fits budget.

Protected goals (cannot be reduced/extended significantly):

Emergency fund (max 30% reduction, max 1 year extension)
Retirement (max 20% reduction, max 1 year extension)
Marriage/Wedding (max 25% reduction, max 1 year extension)
Education/Children (max 25% reduction, max 1 year extension)
All others (max 50% reduction, max 5 year extension)
Step 6: Detailed Goal Review & Lumpsum — step6.js
Purpose: Allow user to edit each goal's Future Value, add a lumpsum investment, and see updated SIP.

Key additional input — Lumpsum:


If user has existing money to put towards a goal:
  fvLump = lumpsum × (1 + monthly_rate)^n   ← grow lumpsum to maturity
  SIP needed = solve for (target_fv − fvLump)

If lumpsum already exceeds target_fv: SIP = 0 (pure lumpsum investment)
Example:


Goal: Home Purchase
FV Needed: ₹80,00,000 in 10 years
User has ₹20,00,000 to invest as lumpsum now
Return: 12% (10 year tier)
Monthly Rate: 1%

Lumpsum grows: ₹20,00,000 × (1.01)^120 = ₹66,00,000
Remaining need: ₹80,00,000 − ₹66,00,000 = ₹14,00,000
SIP to cover ₹14,00,000 → ₹5,200/month (much lower than without lumpsum)
Step-up rate is shown per goal (from we_invest_rule.autoStepUp).

Auto Step-Up setting — user can configure the % annual SIP increase that applies to all goals. The code reads investRule.autoStepUp with fallback default of 0% in step6.js (actual line: return raw ? JSON.parse(raw) : { autoStepUp: 0 }).

Step 7: Projection — step7.js
Purpose: Show a multi-year projection table of all goals — corpus needed, expected return, step-up, SIP per goal — all in one view.

Insurance summary is re-displayed (same formulas as Step 3 — life gap = annual income × 15, health gap = annual income × health multiplier).

The goals table shows (per goal):

Goal Name
Future Value (editable)
Lumpsum (editable)
Target Year (editable)
Tenure (auto-computed)
Expected Return % (from tier table)
Step-up % (from invest rule)
SIP (re-computed live if user edits any field)
On edit: instantly re-runs recomputeFromRow() which recalculates:


yLeft = target_year − current_year
annR  = preRetAnnualReturn(yLeft)
fvLump = lumpsum × (1 + annR/12)^(yLeft×12)
need   = max(0, fv − fvLump)
SIP    = binary_search(need, yLeft, stepUp)
Goal optimization (if over budget):


Try each combination of (reduction, extension):
  reductions = [25%, 30%, 35%]
  extensions = [0, 1, 2 years]

For each combination:
  - Protected goals: no change
  - Other goals: fv_new = fv × (1 − reduction), year_new = target_year + extension
  - Recalculate SIP for each
  - If total SIP ≤ budget: use this plan
  - Otherwise keep track of the best (lowest total) seen
Step 8: Mutual Fund Recommendations — step8.js
Purpose: Map each goal's SIP to specific real mutual fund categories, then fetch live top-performing funds from https://api.mfapi.in.

Allocation Categories (mapped by the code):

"Flexi Cap Fund"   → "Flexi Cap"
"Multi Cap Fund"   → "Multi Cap"
"Mid Cap Fund"     → "Mid Cap"
"Small Cap Fund"   → "Small Cap"
"Large Cap Fund"   → "Large Cap"
"Conservative Hybrid Fund" → "Conservative Hybrid"
"Aggressive Hybrid Fund"   → "Aggressive Hybrid"
"Liquid Funds"     → "Liquid"
"Arbitrage Funds"  → "Arbitrage"
"Debt Fund (Short Duration / Corporate Bond)" → "Corporate Bond"
Return Rate Used in Step 8 (slightly different from other steps):

years > 18:  15%
years >= 15: 14.5%
years >= 10: 12%
years >= 7:  11%
years >= 5:  9.5%
years >= 3:  8.5%    ← differs from Steps 4/5/6 which use 9.5%
otherwise:   4.5%
Live Fund API Process:
Fetch complete fund list: GET https://api.mfapi.in/mf
Filter: Regular-Growth plans only (no Direct plans)
Filter: Exclude Defunct/closed funds
For top-5 selection per category:
Fetch NAV history per fund
Check hasSufficientHistory(navHistory, 5 years minimum)
Calculate rolling returns over 10–15 year lookback period
Max 1 fund per AMC (so you don't get 3 HDFC funds)
Pick top 5 by rolling return
Cache results for 24 hours in localStorage
Fund Assignment:

For individual: assigned to "Self" (or full name)
For couple: user chooses assignment — Husband or Wife — per fund
Saved: localStorage.setItem('we_step8_assignments', JSON.stringify({ goalName: assignedTo }))
Complete Data Flow — localStorage Keys
Key	Written by	Read by	Contains
we_step1	8-events.js	All steps	All personal/financial data
we_invest_rule	snapshot.js	All steps	{ pct: 30, autoStepUp: 8 }
we_emergency_goal	step3.js	step4.js	Emergency fund goal object
we_marriage_goal	step3.js	step4.js	Marriage goal object
we_step4_goals	step4.js	step5.js, step6.js	Array of all non-retirement goals
we_step4_retirement	step4.js	step5,6,7,8	{ corpus, sip, nToRet, Nret }
we_step4_retirementAge	step4.js	step4.js	Retirement age input value
we_step4_lifeExpectancy	step4.js	step4.js	Life expectancy input value
we_plan_goals	step5.js	step6,7,8	Optimized goals array
we_step5_opt_details	step5.js	step6.js	Optimization summary
we_step8_assignments	step8.js	step8.js	Goal → person assignments
mf_recommendations_*	step8.js	step8.js	Cached fund data (24hr expiry)
Key Numbers Summary (all hardcoded defaults in source)
Parameter	Value	Source
Life insurance multiplier	15× annual income	step3.js
Health multiplier (Metro)	1.3× annual income	step3.js
Health multiplier (Non-Metro)	1.1× annual income	step3.js
Emergency Fund	6 months expenses	step3.js
Emergency Fund achievement	3 years	step3.js
Emergency Fund return	Always 4.5%	step3.js, step4.js
Marriage inflation	6%	step3.js
Marriage investment return	12%	step3.js
Goal inflation (all goals)	6%	step4.js
Post-retirement return	7%	step4.js
Post-retirement inflation	6%	step4.js
Real return (post-retirement)	0.9434% per year	step4.js
Safety buffer on corpus	1.5× (50% extra)	step4.js
Life expectancy default	85 years	step4.js
Default investment %	30% of income	snapshot.js
Default SIP step-up	8% per year	all steps
Max step-up allowed	10%	all steps
Binary search iterations	50–100	all steps
Binary search tolerance	₹1,000	step5.js+
