const Anthropic = require('@anthropic-ai/sdk');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const Goal = require('../models/Goal');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Model routing ────────────────────────────────────────────────────────────
const COMPLEX_KEYWORDS = [
  'should i', 'compare', 'scenario', 'what if', 'buy or rent',
  'invest', 'plan', 'strategy', 'afford', 'emi', 'loan', 'retire', 'goal',
  'recommend', 'analysis', ' vs ', 'worth it', 'better', 'switch',
  'tax', '80c', 'ltcg', 'stcg', 'section', 'sip', 'mutual fund', 'portfolio',
  'home', 'house', 'property', 'marriage', 'child', 'education', 'insurance',
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

// ─── Context builder ──────────────────────────────────────────────────────────
const buildFinancialContext = async (userId) => {
  const [accounts, recentTx, subscriptions, goals] = await Promise.all([
    Account.find({ userId, isActive: true }).lean(),
    Transaction.find({ userId }).sort({ date: -1 }).limit(50).lean(),
    Subscription.find({ userId, isActive: true }).lean(),
    Goal.find({ userId }).lean(),
  ]);

  const assets = accounts.filter(a => a.assetOrLiability === 'ASSET');
  const liabilities = accounts.filter(a => a.assetOrLiability === 'LIABILITY');

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const liquidAccounts = assets.filter(a =>
    a.accountType === 'SAVINGS' || a.accountType === 'CURRENT'
  );
  const liquidBalance = liquidAccounts.reduce((s, a) => s + a.balance, 0);

  // Monthly spend from recent transactions
  const now = new Date();
  const currentMonthTx = recentTx.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySpend = currentMonthTx
    .filter(tx => tx.type === 'DEBIT')
    .reduce((s, tx) => s + tx.amount, 0);

  // Top spending categories
  const categoryMap = {};
  currentMonthTx.filter(tx => tx.type === 'DEBIT').forEach(tx => {
    const cat = tx.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join(' | ');

  // Subscriptions
  const monthlySubTotal = subscriptions
    .filter(s => s.frequency === 'MONTHLY')
    .reduce((s, sub) => s + sub.amount, 0);
  const subList = subscriptions
    .slice(0, 6)
    .map(s => `${s.merchantName} ₹${s.amount}/${s.frequency === 'YEARLY' ? 'yr' : 'mo'}`)
    .join(', ');

  // Goals
  const goalList = goals.slice(0, 5).map(g => {
    const pct = g.targetAmount > 0
      ? Math.round((g.currentAmount / g.targetAmount) * 100)
      : 0;
    return `${g.goalName}: ₹${(g.currentAmount || 0).toLocaleString('en-IN')} / ₹${(g.targetAmount || 0).toLocaleString('en-IN')} (${pct}%)`;
  }).join(', ');

  const emergencyMonths = monthlySpend > 0
    ? (liquidBalance / monthlySpend).toFixed(1)
    : 'unknown';

  const assetBreakdown = assets
    .map(a => `${a.accountName} (${a.accountType}): ₹${a.balance.toLocaleString('en-IN')}`)
    .join(', ');
  const liabilityBreakdown = liabilities
    .map(a => `${a.accountName} (${a.accountType}): ₹${a.balance.toLocaleString('en-IN')}`)
    .join(', ');

  return `=== USER FINANCIAL SNAPSHOT ===
Net Worth: ₹${netWorth.toLocaleString('en-IN')} | Assets: ₹${totalAssets.toLocaleString('en-IN')} | Liabilities: ₹${totalLiabilities.toLocaleString('en-IN')}
Assets: ${assetBreakdown || 'none'}
Liabilities: ${liabilityBreakdown || 'none'}
Liquid Balance: ₹${liquidBalance.toLocaleString('en-IN')} | Emergency Fund Coverage: ${emergencyMonths} months
Monthly Spend: ₹${monthlySpend.toLocaleString('en-IN')} | Categories: ${topCategories || 'no data'}
Subscriptions (₹${monthlySubTotal.toLocaleString('en-IN')}/mo): ${subList || 'none'}
Goals: ${goalList || 'none set'}
=== END SNAPSHOT ===`;
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are WealthElements AI — a personal financial advisor built for India.

Give users clear, grounded, actionable financial guidance like a trusted CA who knows their full picture.

RULES:
1. Always use the exact numbers from the user's financial snapshot. Never make up numbers.
2. Give concrete recommendations with actual rupee amounts and calculations.
3. Be direct. Take a clear position. No "it depends" without a follow-up answer.
4. Format numbers clearly. Use ₹ and Indian number format (₹1,20,000).
5. Proactively flag issues you see in their data even if not asked.
6. You know Indian finance: 80C, 80D, Section 24, LTCG, STCG, SIP, EPF, PPF, NPS, HRA.
7. For complex answers use short sections with calculations.
8. End with 2-3 concrete next steps.
9. If user pushes back with life context (marriage, family), acknowledge it and re-run numbers.

CAPABILITIES: EMI math, SIP projections, buy vs rent, scenario modeling, tax saving, goal gap analysis, debt analysis, emergency fund, savings rate, investment allocation.

LIMITATIONS: No live stock/NAV prices. No legal advice. No exact future market predictions (give historical ranges).`;

// ─── Main chat handler ────────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const userId = req.user._id;

    // Build financial context
    const financialContext = await buildFinancialContext(userId);

    // Select model
    const model = selectModel(message, history.length);

    // Build messages for Claude
    // Structure: system prompt handles persona, messages carry the conversation
    // First user message always contains the financial snapshot
    // History contains prior assistant replies only (we rebuild the first user msg each time)
    let messages;

    if (history.length === 0) {
      // Fresh conversation
      messages = [{
        role: 'user',
        content: `${financialContext}\n\nMy question: ${message}`,
      }];
    } else {
      // Ongoing — snapshot in first message, then alternating assistant/user
      // history contains only assistant messages from prior turns
      messages = [
        {
          role: 'user',
          content: `${financialContext}\n\nMy question: [see conversation below]`,
        },
        ...history, // these are {role:'assistant', content:'...'} entries
        {
          role: 'user',
          content: message,
        },
      ];
    }

    // Use non-streaming response — more reliable across all environments
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });

    const aiText = response.content[0]?.text || 'Sorry, I could not generate a response.';

    return res.status(200).json({
      success: true,
      message: aiText,
      model,
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    next(error);
  }
};

module.exports = { chat };
