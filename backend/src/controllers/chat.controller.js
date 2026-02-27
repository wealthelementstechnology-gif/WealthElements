const Anthropic = require('@anthropic-ai/sdk');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const Goal = require('../models/Goal');
const FinancialProfile = require('../models/FinancialProfile');
const User = require('../models/User');
const { loadInstructions } = require('../ai/loadInstructions');
const EightEventsPlan = require('../models/EightEventsPlan');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Model routing ─────────────────────────────────────────────────────────────
// Sonnet: 8 events, complex questions, long messages, deep conversations
// Haiku: simple greetings, short factual questions
const COMPLEX_KEYWORDS = [
  'should i', 'compare', 'scenario', 'what if', 'buy or rent', 'buy vs rent',
  'invest', 'plan', 'strategy', 'afford', 'emi', 'loan', 'retire', 'goal',
  'recommend', 'analysis', ' vs ', 'worth it', 'better', 'switch',
  'tax', '80c', '80d', 'ltcg', 'stcg', 'section', 'sip', 'mutual fund', 'portfolio',
  'home', 'house', 'property', 'marriage', 'child', 'education', 'insurance',
  'salary', 'raise', 'job', 'resign', 'layoff', 'freelance', 'business',
  'withdrawal', 'break fd', 'redeem', 'corpus', 'pension', 'epf',
  'debt', 'credit card', 'personal loan', 'prepay', 'foreclose',
  '8 events', 'eight events', 'financial plan',
];

const selectModel = (message, historyLength) => {
  const lower = message.toLowerCase();
  const hasComplexKeyword = COMPLEX_KEYWORDS.some(kw => lower.includes(kw));
  const isLongMessage = message.length > 100;
  const isDeepConversation = historyLength >= 4;
  if (hasComplexKeyword || isLongMessage || isDeepConversation) {
    return 'claude-sonnet-4-6';
  }
  return 'claude-haiku-4-5-20251001';
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString('en-IN')}`;
const monthName = (d) => d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

// ─── Context builder ───────────────────────────────────────────────────────────
const buildFinancialContext = async (userId) => {
  const now = new Date();

  const [accounts, allTx, subscriptions, goals, profile, user, eightEventsPlan] = await Promise.all([
    Account.find({ userId, isActive: true }).lean(),
    Transaction.find({ userId }).sort({ date: -1 }).limit(150).lean(),
    Subscription.find({ userId }).lean(),
    Goal.find({ userId }).lean(),
    FinancialProfile.findOne({ userId }).lean(),
    User.findById(userId).select('profile').lean(),
    EightEventsPlan.findOne({ userId }).lean(),
  ]);

  // ── Accounts ──────────────────────────────────────────────────────────────
  const assets = accounts.filter(a => a.assetOrLiability === 'ASSET');
  const liabilities = accounts.filter(a => a.assetOrLiability === 'LIABILITY');
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const liquidAccounts = assets.filter(a =>
    a.accountType === 'SAVINGS' || a.accountType === 'CURRENT'
  );
  const liquidBalance = liquidAccounts.reduce((s, a) => s + a.balance, 0);

  const assetBreakdown = assets
    .map(a => `  • ${a.accountName} (${a.accountType}): ${fmt(a.balance)}`)
    .join('\n');
  const liabilityBreakdown = liabilities
    .map(a => `  • ${a.accountName} (${a.accountType}): ${fmt(a.balance)}`)
    .join('\n');

  // ── Monthly transactions ──────────────────────────────────────────────────
  const currentMonthTx = allTx.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthTx = allTx.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
  });

  const monthlySpend = currentMonthTx
    .filter(tx => tx.type === 'DEBIT')
    .reduce((s, tx) => s + tx.amount, 0);
  const prevMonthSpend = prevMonthTx
    .filter(tx => tx.type === 'DEBIT')
    .reduce((s, tx) => s + tx.amount, 0);

  const spendChange = prevMonthSpend > 0
    ? ((monthlySpend - prevMonthSpend) / prevMonthSpend * 100).toFixed(1)
    : null;

  // ── Category breakdown ────────────────────────────────────────────────────
  const catMap = {};
  currentMonthTx.filter(tx => tx.type === 'DEBIT').forEach(tx => {
    const cat = tx.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + tx.amount;
  });
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amt]) => `  • ${cat}: ${fmt(amt)}`)
    .join('\n');

  // ── Spending spikes vs prior month ────────────────────────────────────────
  const prevCatMap = {};
  prevMonthTx.filter(tx => tx.type === 'DEBIT').forEach(tx => {
    const cat = tx.category || 'Other';
    prevCatMap[cat] = (prevCatMap[cat] || 0) + tx.amount;
  });
  const spendingSpikes = Object.entries(catMap)
    .filter(([cat, amt]) => {
      const prev = prevCatMap[cat] || 0;
      return prev > 0 && amt > prev * 1.3;
    })
    .map(([cat, amt]) => {
      const prev = prevCatMap[cat];
      const pct = Math.round((amt - prev) / prev * 100);
      return `  • ${cat}: ${fmt(amt)} this month vs ${fmt(prev)} last month (+${pct}%)`;
    })
    .join('\n');

  // ── Income & savings ──────────────────────────────────────────────────────
  const monthlyIncome = profile?.monthlyIncome || 0;
  const savingsRate = monthlyIncome > 0
    ? ((monthlyIncome - monthlySpend) / monthlyIncome * 100).toFixed(1)
    : null;

  // ── Emergency fund ────────────────────────────────────────────────────────
  const monthlyExpenses = profile?.monthlyExpenses || monthlySpend;
  const emergencyMonths = monthlyExpenses > 0
    ? (liquidBalance / monthlyExpenses).toFixed(1)
    : 'unknown';

  // ── Subscriptions ─────────────────────────────────────────────────────────
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const monthlySubTotal = activeSubs
    .filter(s => s.frequency === 'MONTHLY')
    .reduce((s, sub) => s + sub.amount, 0);
  const annualSubTotal = activeSubs
    .filter(s => s.frequency === 'ANNUAL' || s.frequency === 'YEARLY')
    .reduce((s, sub) => s + sub.amount, 0);
  const subList = activeSubs
    .map(s => `  • ${s.brandName || s.merchantName || 'Unknown'}: ${fmt(s.amount)}/${s.frequency === 'MONTHLY' ? 'mo' : 'yr'}`)
    .join('\n');

  // ── Goals ─────────────────────────────────────────────────────────────────
  const goalList = goals.map(g => {
    const pct = g.targetAmount > 0
      ? Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)
      : 0;
    const monthsLeft = g.targetDate
      ? Math.max(0, Math.round((new Date(g.targetDate) - now) / (1000 * 60 * 60 * 24 * 30)))
      : null;
    const monthlyNeeded = monthsLeft > 0
      ? Math.round(((g.targetAmount || 0) - (g.currentAmount || 0)) / monthsLeft)
      : null;
    return [
      `  • ${g.title || g.goalName} (${g.category || 'Goal'})`,
      `    Progress: ${fmt(g.currentAmount || 0)} / ${fmt(g.targetAmount || 0)} (${pct}%)`,
      monthsLeft !== null ? `    Time left: ${monthsLeft} months` : '',
      monthlyNeeded !== null && monthlyNeeded > 0
        ? `    Monthly needed to stay on track: ${fmt(monthlyNeeded)}`
        : '',
    ].filter(Boolean).join('\n');
  }).join('\n');

  // ── Behavioral flags ──────────────────────────────────────────────────────
  const flags = [];
  if (savingsRate !== null && parseFloat(savingsRate) < 10) {
    flags.push(`⚠ Savings rate critically low at ${savingsRate}% (target: 20%+)`);
  }
  if (parseFloat(emergencyMonths) < 3) {
    flags.push(`⚠ Emergency fund only ${emergencyMonths} months — dangerously low`);
  }
  const ccLiabilities = liabilities.filter(a => a.accountType === 'CREDIT_CARD');
  if (ccLiabilities.length > 0) {
    const ccTotal = ccLiabilities.reduce((s, a) => s + a.balance, 0);
    flags.push(`⚠ Credit card balance: ${fmt(ccTotal)} — high-interest debt (36-42%/yr)`);
  }
  if (spendChange !== null && parseFloat(spendChange) > 20) {
    flags.push(`⚠ Spending up ${spendChange}% vs last month`);
  }
  if (monthlyIncome > 0) {
    const totalEMIs = liabilities
      .filter(a => a.accountType === 'LOAN')
      .reduce((s, a) => s + Math.round(a.balance * 0.02), 0);
    const emiRatio = (totalEMIs / monthlyIncome * 100).toFixed(0);
    if (parseFloat(emiRatio) > 40) {
      flags.push(`⚠ EMI-to-income ratio ~${emiRatio}% — above safe threshold of 40%`);
    }
  }

  const userName = user?.profile?.name || 'the user';

  return `=== WEALTHELEMENTS FINANCIAL SNAPSHOT FOR ${userName.toUpperCase()} ===
Generated: ${monthName(now)}

── NET WORTH ─────────────────────────────────────────────
Total Net Worth:   ${fmt(netWorth)}${netWorth < 0 ? ' (NEGATIVE — liabilities exceed assets)' : ''}
Total Assets:      ${fmt(totalAssets)}
Total Liabilities: ${fmt(totalLiabilities)}

── ASSETS ────────────────────────────────────────────────
${assetBreakdown || '  (none recorded)'}

── LIABILITIES ───────────────────────────────────────────
${liabilityBreakdown || '  (none recorded)'}

── CASH FLOW ─────────────────────────────────────────────
Monthly Income (profile):        ${monthlyIncome > 0 ? fmt(monthlyIncome) : 'not set'}
This Month Spend (${monthName(now)}): ${fmt(monthlySpend)}${spendChange !== null ? ` (${parseFloat(spendChange) > 0 ? '+' : ''}${spendChange}% vs last month)` : ''}
Savings Rate This Month:         ${savingsRate !== null ? `${savingsRate}%` : 'income not set — cannot calculate'}

── SPENDING BREAKDOWN (${monthName(now)}) ──────────────────
${topCategories || '  (no transactions this month)'}
${spendingSpikes ? `\n── SPENDING SPIKES vs LAST MONTH ─────────────────────\n${spendingSpikes}` : ''}

── LIQUID SAFETY NET ─────────────────────────────────────
Liquid Balance (savings/current): ${fmt(liquidBalance)}
Emergency Fund Coverage:          ${emergencyMonths} months
${parseFloat(emergencyMonths) < 1 ? '🚨 CRITICAL — less than 1 month of coverage' : parseFloat(emergencyMonths) < 3 ? '⚠ Below minimum recommended 3 months' : parseFloat(emergencyMonths) < 6 ? '⚠ Below recommended 6 months' : '✓ Good emergency coverage'}

── SUBSCRIPTIONS ─────────────────────────────────────────
Monthly total: ${fmt(monthlySubTotal)}/month | Annual: ${fmt(annualSubTotal)}/year
${subList || '  (none recorded)'}

── GOALS ─────────────────────────────────────────────────
${goalList || '  (no goals set)'}

── PROFILE ───────────────────────────────────────────────
Risk Profile: ${profile?.riskProfile || 'not set'}
Employment: ${user?.profile?.employmentType || 'not set'}
${profile?.monthlyExpenses ? `Monthly Expenses (profile): ${fmt(profile.monthlyExpenses)}` : ''}

── BEHAVIORAL FLAGS ──────────────────────────────────────
${flags.length > 0 ? flags.join('\n') : '✓ No critical flags detected'}

── 8 EVENTS PLAN ─────────────────────────────────────────
${eightEventsPlan ? `Computed: ${monthName(new Date(eightEventsPlan.computedAt))}
Age: ${eightEventsPlan.age} | Retirement Age: ${eightEventsPlan.retirementAge} | Years Left: ${eightEventsPlan.yearsToRetirement}
City: ${eightEventsPlan.city || 'not set'} (${eightEventsPlan.isMetroCity ? 'Metro' : 'Non-Metro'})
Retirement Corpus Needed: ${fmt(eightEventsPlan.retirementCorpus)} | Retirement SIP: ${fmt(eightEventsPlan.retirementSIP)}/mo
Life Insurance Gap: ${fmt(eightEventsPlan.lifeInsuranceGap)} | Health Insurance Gap: ${fmt(eightEventsPlan.healthInsuranceGap)}
Emergency Fund: ${fmt(eightEventsPlan.emergencyFundCorpus)} (SIP: ${fmt(eightEventsPlan.emergencyFundSIP)}/mo)
Goals (${eightEventsPlan.goals.length}): ${eightEventsPlan.goals.map(g => `${g.name} — SIP ${fmt(g.sip)}/mo`).join(' | ') || 'none'}
Total SIP Required: ${fmt(eightEventsPlan.totalMonthlySIPRequired)}/mo | Budget: ${fmt(eightEventsPlan.monthlyInvestmentBudget)}/mo (${eightEventsPlan.budgetUtilizationPct.toFixed(0)}% utilized)${eightEventsPlan.wasOptimized ? ' [plan was auto-optimized to fit budget]' : ''}` : '(no 8 events plan computed yet — user can trigger it in chat)'}

=== END SNAPSHOT ===`;
};

// ─── System prompt ─────────────────────────────────────────────────────────────
// Instructions are loaded from backend/src/ai/*.md files (alphabetical order).
// Edit or add .md files there — restart server to pick up changes.
const getSystemPrompt = () => loadInstructions();

// ─── Proactive insight generator ───────────────────────────────────────────────
const getProactiveInsight = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const financialContext = await buildFinancialContext(userId);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: `Generate ONE proactive financial insight about this user's data. Rules:
- Max 2 sentences, plain text, no markdown
- Start with the most important thing: a risk, spike, or opportunity
- Use their real numbers
- Be direct and specific — no generic advice
- Do NOT start with "I" or "Based on your data"
- Do NOT ask a question — state the insight`,
      messages: [{
        role: 'user',
        content: `${financialContext}\n\nGive me one proactive insight about what stands out most.`,
      }],
    });

    const insight = response.content[0]?.text || null;
    return res.status(200).json({ success: true, insight });
  } catch (error) {
    return res.status(200).json({ success: true, insight: null });
  }
};

// ─── Anthropic call with retry on overload ─────────────────────────────────────
const callAnthropicWithRetry = async (params, maxRetries = 3) => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await anthropic.messages.create(params);
    } catch (err) {
      const status = err.status || err.statusCode;
      const isOverloaded = status === 529 || err.message?.includes('overloaded');
      const isRateLimit = status === 429 || err.message?.includes('rate limit');
      if ((isOverloaded || isRateLimit) && attempt < maxRetries - 1) {
        const wait = (attempt + 1) * 3000; // 3s, 6s
        console.log(`Anthropic overloaded (attempt ${attempt + 1}), retrying in ${wait}ms…`);
        await delay(wait);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

// ─── Main chat handler ─────────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const userId = req.user._id;
    const financialContext = await buildFinancialContext(userId);
    const model = selectModel(message, history.length);

    let messages;
    if (history.length === 0) {
      messages = [{
        role: 'user',
        content: `${financialContext}\n\nMy question: ${message}`,
      }];
    } else {
      messages = [
        { role: 'user', content: `${financialContext}\n\n[conversation follows]` },
        ...history,
        { role: 'user', content: message },
      ];
    }

    const response = await callAnthropicWithRetry({
      model,
      max_tokens: 8000,
      system: getSystemPrompt(),
      messages,
    });

    const aiText = response.content[0]?.text || 'Sorry, I could not generate a response.';

    return res.status(200).json({ success: true, message: aiText, model });

  } catch (error) {
    console.error('Chat error:', error.message);

    // Anthropic API errors — return a clean user-facing message instead of raw JSON
    const status = error.status || error.statusCode;
    if (status === 529 || error.message?.includes('overloaded')) {
      return res.status(503).json({
        success: false,
        message: 'The AI is currently busy. Please wait a few seconds and try again.',
      });
    }
    if (status === 429 || error.message?.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before sending another message.',
      });
    }
    if (status === 401) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error. Please contact support.',
      });
    }

    next(error);
  }
};

module.exports = { chat, getProactiveInsight };
