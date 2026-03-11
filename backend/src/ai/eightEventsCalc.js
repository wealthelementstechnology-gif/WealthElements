/**
 * 8 Events Calculator — all numeric logic in JS.
 * The AI receives pre-computed values and only formats/explains them.
 */

const METRO_CITIES = new Set([
  'mumbai', 'delhi', 'kolkata', 'chennai', 'bengaluru', 'bangalore',
  'pune', 'hyderabad', 'ahmedabad',
]);

// ─── SIP helpers ──────────────────────────────────────────────────────────────

function fvFromSip(initialSip, n, monthlyRate, stepUp = 0.08) {
  let totalFV = 0;
  const numYears = Math.ceil(n / 12);
  for (let year = 0; year < numYears; year++) {
    const sipThisYear = initialSip * Math.pow(1 + stepUp, year);
    const monthsInYear = Math.min(12, n - year * 12);
    for (let month = 0; month < monthsInYear; month++) {
      const monthsRemaining = n - (year * 12 + month);
      totalFV += sipThisYear * Math.pow(1 + monthlyRate, monthsRemaining);
    }
  }
  return totalFV;
}

function solveSip(targetFV, years, annualRate, stepUp = 0.08) {
  if (targetFV <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const n = years * 12;
  let low = 0;
  let high = targetFV / n * 5 + 1;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const fv = fvFromSip(mid, n, monthlyRate, stepUp);
    if (Math.abs(fv - targetFV) < 1000) return Math.ceil(mid);
    if (fv >= targetFV) high = mid;
    else low = mid;
  }
  return Math.ceil(high);
}

// ─── Return rate tier table ────────────────────────────────────────────────────

function preRetirementRate(yearsLeft) {
  if (yearsLeft > 18) return 0.15;
  if (yearsLeft >= 15) return 0.145;
  if (yearsLeft >= 10) return 0.12;
  if (yearsLeft >= 7) return 0.11;
  if (yearsLeft >= 3) return 0.095;
  return 0.045;
}

// ─── Expense inflation rates ───────────────────────────────────────────────────

const EXPENSE_INFLATION = {
  'grocery': 0.045, 'groceries': 0.045, 'grocery & toiletries': 0.045,
  'house rent': 0.045, 'rent': 0.045, 'maintenance': 0.045,
  'vehicle': 0.045, 'fuel': 0.045, 'servicing': 0.045,
  'doctor': 0.09, 'medicines': 0.09, 'medical': 0.09, 'health': 0.09,
  'utilities': 0.055, 'electricity': 0.055,
  'maid': 0.065, 'laundry': 0.065,
  'gadgets': 0.03, 'mobile': 0.055, 'internet': 0.055,
  'clothes': 0.045, 'accessories': 0.045,
  'shopping': 0.055, 'gifts': 0.055,
  'dining': 0.065, 'movies': 0.065, 'sports': 0.065,
  'coach': 0.065, 'fitness': 0.065,
  'travel': 0.065, 'holidays': 0.065,
  'charity': 0.0, 'donations': 0.0,
  'renovations': 0.065, 'celebrations': 0.065,
  'children': 0.12, 'education': 0.12, 'school': 0.12, 'college': 0.12,
  'pocket money': 0.045,
  'parents': 0.045, 'siblings': 0.045,
  'personal': 0.055,
};

function getExpenseInflation(categoryName) {
  const lower = (categoryName || '').toLowerCase();
  for (const [key, rate] of Object.entries(EXPENSE_INFLATION)) {
    if (lower.includes(key)) return rate;
  }
  return 0.055; // default
}

// ─── Master compute function ───────────────────────────────────────────────────

/**
 * inputs: {
 *   age, retirementAge, city, familyMode,
 *   existingTermInsurance, existingHealthInsurance,
 *   investmentBudgetPct,
 *   isUnmarried, marriageAge, weddingBudget,
 *   goals: [{ name, currentCost, targetYear }],
 *   // couple mode
 *   husbandAge, husbandRetirementAge, wifeAge, wifeRetirementAge, wifeWorking,
 * }
 * snapshot: {
 *   monthlyIncome, monthlyExpenses, spendingCategories: [{ category, amount }]
 * }
 */
function compute8Events(inputs, snapshot) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const {
    age, retirementAge = 60, city = '', familyMode = 'individual',
    existingTermInsurance = 0, existingHealthInsurance = 0,
    investmentBudgetPct = 30,
    isUnmarried = false, marriageAge, weddingBudget = 0,
    goals = [],
  } = inputs;

  const monthlyIncome = snapshot.monthlyIncome || 0;
  const monthlyExpenses = snapshot.monthlyExpenses || 0;

  const isMetro = METRO_CITIES.has((city || '').toLowerCase().trim());
  const healthMultiplier = isMetro ? 1.3 : 1.1;
  const annualIncome = monthlyIncome * 12;

  // ── Insurance gap ──────────────────────────────────────────────────────────
  const lifeInsuranceRequired = annualIncome * 15;
  const lifeInsuranceGap = Math.max(0, lifeInsuranceRequired - existingTermInsurance);
  const healthInsuranceRequired = annualIncome * healthMultiplier;
  const healthInsuranceGap = Math.max(0, healthInsuranceRequired - existingHealthInsurance);

  // ── Emergency fund ─────────────────────────────────────────────────────────
  const emergencyFundCorpus = monthlyExpenses * 6;
  const emergencyFundFV = emergencyFundCorpus * Math.pow(1.06, 3);
  const emergencyFundSIP = solveSip(emergencyFundFV, 3, 0.045, 0.08);

  // ── Retirement ─────────────────────────────────────────────────────────────
  const yearsToRetirement = (retirementAge || 60) - (age || 30);
  const yearsInRetirement = 85 - (retirementAge || 60);

  // Build continuing expenses list from snapshot categories
  // If no category breakdown available, assume whole monthlyExpenses at 5.5%
  const categories = snapshot.spendingCategories || [];
  let monthlyExpenseAtRetirement;

  if (categories.length > 0) {
    // Filter out non-continuing categories
    const nonContinuing = ['emi', 'loan', 'school', 'college', 'commute', 'work'];
    const continuing = categories.filter(c => {
      const lower = (c.category || '').toLowerCase();
      return !nonContinuing.some(kw => lower.includes(kw));
    });
    const base = continuing.length > 0 ? continuing : categories;
    monthlyExpenseAtRetirement = base.reduce((sum, c) => {
      const rate = getExpenseInflation(c.category);
      return sum + (c.amount || 0) * Math.pow(1 + rate, yearsToRetirement);
    }, 0);
    // If result is 0 or unreasonably low, fallback
    if (monthlyExpenseAtRetirement < monthlyExpenses * 0.5) {
      monthlyExpenseAtRetirement = monthlyExpenses * Math.pow(1.055, yearsToRetirement);
    }
  } else {
    monthlyExpenseAtRetirement = monthlyExpenses * Math.pow(1.055, yearsToRetirement);
  }

  const realReturn = (1.07 / 1.06) - 1; // 0.9434% per year
  const corpusBase = yearsInRetirement > 0
    ? monthlyExpenseAtRetirement * 12 * (1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn
    : monthlyExpenseAtRetirement * 12 * yearsInRetirement;
  const retirementCorpus = corpusBase * 1.5;

  const retirementReturnRate = preRetirementRate(yearsToRetirement);
  const retirementSIP = solveSip(retirementCorpus, yearsToRetirement, retirementReturnRate, 0.08);

  // ── Goal SIPs ──────────────────────────────────────────────────────────────
  const goalResults = [];

  // Marriage goal (if unmarried)
  if (isUnmarried && marriageAge && weddingBudget > 0) {
    const yearsToMarriage = (marriageAge || 30) - (age || 25);
    if (yearsToMarriage > 0) {
      const fv = weddingBudget * Math.pow(1.06, yearsToMarriage);
      const sip = solveSip(fv, yearsToMarriage, 0.12, 0.08);
      goalResults.push({
        name: 'Wedding',
        currentCost: weddingBudget,
        futureValue: Math.round(fv),
        sip,
        years: yearsToMarriage,
        returnRate: 12,
        isProtected: true,
        wasOptimized: false,
      });
    }
  }

  // User-specified goals
  for (const g of goals) {
    const yearsLeft = (g.targetYear || currentYear + 5) - currentYear;
    if (yearsLeft <= 0) continue;
    const cost = g.currentCost || 0;
    const fv = cost * Math.pow(1.06, yearsLeft);
    const rate = preRetirementRate(yearsLeft);
    const sip = solveSip(fv, yearsLeft, rate, 0.08);
    const isProtected = /wedding|marriage|education|children|child/i.test(g.name || '');
    goalResults.push({
      name: g.name,
      currentCost: cost,
      futureValue: Math.round(fv),
      sip,
      years: yearsLeft,
      returnRate: Math.round(rate * 100 * 10) / 10,
      isProtected,
      wasOptimized: false,
    });
  }

  // ── Budget review ──────────────────────────────────────────────────────────
  const monthlyBudget = Math.round(monthlyIncome * investmentBudgetPct / 100);
  let totalSIP = emergencyFundSIP + retirementSIP + goalResults.reduce((s, g) => s + g.sip, 0);
  let wasOptimized = false;
  let optimizedEmergencySIP = emergencyFundSIP;
  let optimizedRetirementSIP = retirementSIP;

  if (totalSIP > monthlyBudget) {
    // Try to fit within budget with optimizer
    const reductions = [0.25, 0.30, 0.35];
    const extensions = [0, 1, 2];
    let bestPlan = null;
    let bestTotal = Infinity;

    for (const red of reductions) {
      for (const ext of extensions) {
        const trialGoals = goalResults.map(g => {
          if (g.isProtected) {
            // Protected — smaller reduction/extension
            const maxRed = /emergency/i.test(g.name) ? 0.30 : 0.25;
            const maxExt = 1;
            const r = Math.min(red, maxRed);
            const e = Math.min(ext, maxExt);
            const newFV = g.futureValue * (1 - r);
            const newYears = g.years + e;
            const rate = preRetirementRate(newYears);
            const newSip = solveSip(newFV, newYears, rate, 0.08);
            return { ...g, futureValue: Math.round(newFV), sip: newSip, years: newYears, wasOptimized: r > 0 || e > 0 };
          } else {
            // Non-protected — up to 50% reduction, 5yr extension
            const r = Math.min(red * 2, 0.50);
            const e = Math.min(ext * 2, 5);
            const newFV = g.futureValue * (1 - r);
            const newYears = g.years + e;
            const rate = preRetirementRate(newYears);
            const newSip = solveSip(newFV, newYears, rate, 0.08);
            return { ...g, futureValue: Math.round(newFV), sip: newSip, years: newYears, wasOptimized: true };
          }
        });

        // Also try reducing retirement (max 20%) and emergency (max 30%)
        const retRed = Math.min(red, 0.20);
        const retExt = Math.min(ext, 1);
        const newRetFV = retirementCorpus * (1 - retRed);
        const newRetYears = yearsToRetirement + retExt;
        const newRetSip = solveSip(newRetFV, newRetYears, preRetirementRate(newRetYears), 0.08);

        const emgRed = Math.min(red, 0.30);
        const newEmgFV = emergencyFundFV * (1 - emgRed);
        const newEmgSip = solveSip(newEmgFV, 3, 0.045, 0.08);

        const trial = newEmgSip + newRetSip + trialGoals.reduce((s, g) => s + g.sip, 0);
        if (trial <= monthlyBudget && trial < bestTotal) {
          bestTotal = trial;
          bestPlan = { goals: trialGoals, retirementSIP: newRetSip, emergencySIP: newEmgSip };
        }
      }
    }

    if (bestPlan) {
      wasOptimized = true;
      goalResults.splice(0, goalResults.length, ...bestPlan.goals);
      optimizedRetirementSIP = bestPlan.retirementSIP;
      optimizedEmergencySIP = bestPlan.emergencySIP;
      totalSIP = bestTotal;
    }
    // If no plan fits, just report as-is (don't force-fit)
  }

  const budgetUtilizationPct = monthlyBudget > 0
    ? Math.round(totalSIP / monthlyBudget * 100)
    : 0;

  return {
    age: age || 0,
    retirementAge: retirementAge || 60,
    city: city || '',
    familyMode,
    isMetroCity: isMetro,
    existingTermInsurance,
    existingHealthInsurance,
    lifeInsuranceRequired: Math.round(lifeInsuranceRequired),
    lifeInsuranceGap: Math.round(lifeInsuranceGap),
    healthInsuranceRequired: Math.round(healthInsuranceRequired),
    healthInsuranceGap: Math.round(healthInsuranceGap),
    emergencyFundCorpus: Math.round(emergencyFundCorpus),
    emergencyFundFV: Math.round(emergencyFundFV),
    emergencyFundSIP: optimizedEmergencySIP,
    retirementCorpus: Math.round(retirementCorpus),
    retirementSIP: optimizedRetirementSIP,
    yearsToRetirement,
    yearsInRetirement,
    monthlyExpenseAtRetirement: Math.round(monthlyExpenseAtRetirement),
    goals: goalResults,
    investmentBudgetPct,
    monthlyInvestmentBudget: monthlyBudget,
    totalMonthlySIPRequired: Math.round(totalSIP),
    budgetUtilizationPct,
    wasOptimized,
  };
}

// ─── Parse 8 events message from frontend ─────────────────────────────────────

function parse8EventsMessage(message) {
  const get = (label, defaultVal = '') => {
    const re = new RegExp(`${label}[:\\s]+([^\\n,]+)`, 'i');
    const m = message.match(re);
    return m ? m[1].trim().replace(/^₹/, '') : defaultVal;
  };
  const getNum = (label, defaultVal = 0) => {
    const raw = get(label, String(defaultVal));
    return parseFloat(raw.replace(/[^0-9.]/g, '')) || defaultVal;
  };

  const isCouple = /family mode:\s*couple/i.test(message);

  let age, retirementAge;
  if (isCouple) {
    age = getNum('husband age', 0);
    retirementAge = getNum('husband retirement age', 60);
  } else {
    age = getNum('current age', 0);
    retirementAge = getNum('target retirement age', 60);
  }

  const city = get('city', '');
  const existingTermInsurance = getNum('existing term life insurance sum assured', 0);
  const existingHealthInsurance = getNum('existing health insurance sum assured', 0);
  // "Investment Budget: 35% of monthly income" — grab just the number before %
  const budgetMatch = message.match(/investment budget[:\s]+(\d+)%/i);
  const investmentBudgetPct = budgetMatch ? parseInt(budgetMatch[1]) : 30;

  // Unmarried / marriage goal
  const isUnmarried = /marital status:\s*unmarried/i.test(message);
  const marriageAge = getNum('planned marriage age', 0) || null;
  const weddingBudget = getNum('estimated wedding budget today', 0);

  // Goals
  const goals = [];
  const goalsSection = message.match(/financial goals[^:]*:([\s\S]*?)(?:\n\n|\n(?:[A-Z])|$)/i);
  if (goalsSection && !/none specified/i.test(goalsSection[1])) {
    const lines = goalsSection[1].split('\n').filter(l => l.includes('•') || l.match(/^\s*-/));
    for (const line of lines) {
      const costMatch = line.match(/current cost[:\s]+₹?([\d,]+)/i);
      const yearMatch = line.match(/target year[:\s]+(20\d\d)/i);
      const nameMatch = line.match(/[•\-]\s*([^:]+?):/);
      if (nameMatch && (costMatch || yearMatch)) {
        goals.push({
          name: nameMatch[1].trim(),
          currentCost: costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 0,
          targetYear: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear() + 5,
        });
      }
    }
  }

  return {
    age, retirementAge, city, familyMode: isCouple ? 'couple' : 'individual',
    existingTermInsurance, existingHealthInsurance, investmentBudgetPct,
    isUnmarried, marriageAge, weddingBudget,
    goals,
  };
}

module.exports = { compute8Events, parse8EventsMessage, solveSip, fvFromSip, preRetirementRate };
