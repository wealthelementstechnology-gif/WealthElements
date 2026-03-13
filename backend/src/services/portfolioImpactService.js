const Anthropic = require('@anthropic-ai/sdk');
const Account = require('../models/Account');
const ProactiveAlert = require('../models/ProactiveAlert');
const NewsEvent = require('../models/NewsEvent');
const { getRecentHighImpact } = require('./newsService');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INVESTMENT_TYPES = ['MUTUAL_FUND', 'STOCKS', 'EPF', 'PPF', 'FD', 'REAL_ESTATE', 'GOLD'];
const MAX_USERS_PER_BATCH = 50;
const MAX_ALERTS_PER_USER_PER_DAY = 3;

async function getUsersWithInvestments() {
  return Account.distinct('userId', {
    accountType: { $in: INVESTMENT_TYPES },
    isActive: true,
  });
}

async function getUserDailyAlertCount(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return ProactiveAlert.countDocuments({
    userId,
    createdAt: { $gte: startOfDay },
  });
}

async function buildMiniPortfolioContext(userId) {
  const accounts = await Account.find({
    userId,
    accountType: { $in: INVESTMENT_TYPES },
    isActive: true,
  }).select('accountName accountType balance institution');

  if (accounts.length === 0) return null;

  const lines = accounts.map((a) => {
    const label = a.accountName || `${a.accountType} Account`;
    const institution = a.institution ? ` (${a.institution})` : '';
    return `- ${label}${institution}: ₹${a.balance.toLocaleString('en-IN')}`;
  });

  return lines.join('\n');
}

function buildAnalysisPrompt(newsEvent, portfolioContext) {
  return `You are a conservative Indian financial advisor. A market event just occurred. Analyze its impact on this user's investment portfolio and give a specific recommendation.

NEWS EVENT:
Headline: ${newsEvent.headline}
Category: ${newsEvent.eventCategory}
Affected Assets: ${newsEvent.affectedAssets.join(', ')}
Impact Score: ${newsEvent.impactScore}/10

USER'S INVESTMENT PORTFOLIO:
${portfolioContext}

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON):
{
  "urgency": "HIGH" | "MEDIUM" | "LOW",
  "alertType": "ALLOCATION_CHANGE" | "SIP_PAUSE" | "REBALANCE" | "OPPORTUNITY" | "MARKET_UPDATE",
  "headline": "Short 10-word recommendation headline",
  "rationale": "2-3 sentence explanation of why this matters for this user's specific portfolio",
  "affectedFunds": ["fund name 1", "fund name 2"],
  "suggestedAction": "One specific actionable step the user can take",
  "confidence": 0.0 to 1.0
}

Rules:
- Only recommend changes relevant to assets the user actually holds
- If the user has no exposure to affected assets, set urgency to LOW and alertType to MARKET_UPDATE
- Be conservative — never recommend panic selling
- Confidence should reflect how directly this news impacts their portfolio`;
}

async function analyzeForUser(userId, newsEvent) {
  const portfolioContext = await buildMiniPortfolioContext(userId);
  if (!portfolioContext) return null;

  const prompt = buildAnalysisPrompt(newsEvent, portfolioContext);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const rec = JSON.parse(jsonMatch[0]);
    if (!rec.urgency || !rec.headline || !rec.rationale) return null;

    return {
      userId,
      newsEventId: newsEvent._id,
      alertType: rec.alertType || 'MARKET_UPDATE',
      urgency: rec.urgency,
      recommendation: {
        headline: rec.headline,
        rationale: rec.rationale,
        affectedFunds: Array.isArray(rec.affectedFunds) ? rec.affectedFunds : [],
        suggestedAction: rec.suggestedAction || '',
        confidence: typeof rec.confidence === 'number' ? rec.confidence : 0.5,
      },
      newsHeadline: newsEvent.headline,
    };
  } catch (err) {
    console.error(`[portfolioImpact] Analysis error for user ${userId}:`, err.message);
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processUnanalyzedEvents() {
  console.log('[portfolioImpact] Processing unanalyzed high-impact news events...');

  const events = await getRecentHighImpact(6);
  if (events.length === 0) {
    console.log('[portfolioImpact] No high-impact events to process.');
    return;
  }

  const userIds = await getUsersWithInvestments();
  const batchedUsers = userIds.slice(0, MAX_USERS_PER_BATCH);

  let totalAlerts = 0;

  for (const newsEvent of events) {
    console.log(`[portfolioImpact] Processing: "${newsEvent.headline.slice(0, 60)}..."`);

    for (const userId of batchedUsers) {
      try {
        const dailyCount = await getUserDailyAlertCount(userId);
        if (dailyCount >= MAX_ALERTS_PER_USER_PER_DAY) continue;

        const existing = await ProactiveAlert.findOne({ userId, newsEventId: newsEvent._id });
        if (existing) continue;

        const alertData = await analyzeForUser(userId, newsEvent);
        if (!alertData) continue;

        await ProactiveAlert.create(alertData);
        totalAlerts++;

        await sleep(300);
      } catch (err) {
        console.error(`[portfolioImpact] Error for user ${userId}:`, err.message);
      }
    }

    await NewsEvent.findByIdAndUpdate(newsEvent._id, {
      processed: true,
      processedAt: new Date(),
    });
  }

  console.log(`[portfolioImpact] Created ${totalAlerts} proactive alerts.`);
}

async function expireOldAlerts() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const result = await ProactiveAlert.updateMany(
    { status: 'PENDING', createdAt: { $lt: cutoff } },
    { $set: { status: 'EXPIRED' } }
  );
  console.log(`[portfolioImpact] Expired ${result.modifiedCount} old alerts.`);
}

module.exports = { processUnanalyzedEvents, expireOldAlerts };
