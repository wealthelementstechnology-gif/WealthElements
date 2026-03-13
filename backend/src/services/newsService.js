const https = require('https');
const http = require('http');
const { XMLParser } = require('fast-xml-parser');
const crypto = require('crypto');
const NewsEvent = require('../models/NewsEvent');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// RSS feed sources — all free, no API key needed
const RSS_FEEDS = [
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    source: 'Economic Times',
  },
  {
    url: 'https://www.moneycontrol.com/rss/marketreports.xml',
    source: 'Moneycontrol',
  },
  {
    url: 'https://www.livemint.com/rss/markets',
    source: 'LiveMint',
  },
  {
    url: 'https://feeds.feedburner.com/ndtvprofit-latest',
    source: 'NDTV Profit',
  },
];

// Keyword rules for categorization — no AI cost
const CATEGORY_RULES = [
  {
    category: 'MARKET_CRASH',
    keywords: ['crash', 'circuit breaker', 'nifty falls', 'sensex drops', 'sell-off', 'selloff', 'market falls', 'market crash', 'bloodbath', 'plunges', 'nosedive'],
    affectedAssets: ['EQUITY'],
    baseScore: 9,
  },
  {
    category: 'GEOPOLITICAL',
    keywords: ['war', 'attack', 'sanction', 'missile', 'conflict', 'iran', 'russia', 'china tension', 'military', 'airstrike', 'invasion', 'nuclear', 'geopolitical'],
    affectedAssets: ['GOLD', 'OIL', 'EQUITY'],
    baseScore: 8,
  },
  {
    category: 'RBI_POLICY',
    keywords: ['rbi', 'repo rate', 'monetary policy', 'interest rate', 'mpc', 'rate cut', 'rate hike', 'reserve bank', 'liquidity', 'crr', 'slr'],
    affectedAssets: ['DEBT', 'FD', 'EQUITY'],
    baseScore: 7,
  },
  {
    category: 'INFLATION',
    keywords: ['inflation', 'cpi', 'wpi', 'price rise', 'retail inflation', 'wholesale price', 'cost of living', 'deflation'],
    affectedAssets: ['DEBT', 'GOLD'],
    baseScore: 6,
  },
  {
    category: 'CURRENCY',
    keywords: ['rupee falls', 'rupee drops', 'usd/inr', 'dollar rises', 'forex', 'currency depreciation', 'rupee weakens', 'exchange rate'],
    affectedAssets: ['INTERNATIONAL_FUNDS', 'GOLD'],
    baseScore: 6,
  },
  {
    category: 'COMMODITY',
    keywords: ['gold price', 'crude oil', 'commodity', 'silver price', 'metal prices', 'oil prices', 'brent crude'],
    affectedAssets: ['GOLD', 'OIL'],
    baseScore: 5,
  },
  {
    category: 'EARNINGS',
    keywords: ['quarterly results', 'earnings', 'profit rises', 'profit falls', 'revenue', 'q1 results', 'q2 results', 'q3 results', 'q4 results'],
    affectedAssets: ['EQUITY'],
    baseScore: 5,
  },
  {
    category: 'SECTOR_NEWS',
    keywords: ['it sector', 'pharma', 'banking sector', 'nse', 'bse', 'sebi', 'ipo', 'fii', 'fdi', 'budget'],
    affectedAssets: ['EQUITY'],
    baseScore: 5,
  },
];

const INDIA_KEYWORDS = [
  'india', 'indian', 'nifty', 'sensex', 'bse', 'nse', 'sebi', 'rbi', 'rupee', 'inr',
  'mumbai', 'delhi', 'hdfc', 'icici', 'sbi', 'tata', 'reliance', 'infosys', 'wipro',
  'modi', 'finance minister', 'budget', 'gst', 'epf', 'nps', 'ppf',
];

function hashHeadline(headline) {
  return crypto.createHash('sha256').update(headline.toLowerCase().trim()).digest('hex');
}

function categorizeNews(headline, summary = '') {
  const text = `${headline} ${summary}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const matchCount = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (matchCount > 0) {
      const score = rule.baseScore + Math.min(matchCount - 1, 2);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = rule;
      }
    }
  }

  const isIndiaRelevant = INDIA_KEYWORDS.some((kw) => text.includes(kw));

  return {
    eventCategory: bestMatch ? bestMatch.category : 'GENERAL',
    affectedAssets: bestMatch ? bestMatch.affectedAssets : [],
    impactScore: bestMatch ? Math.min(bestScore, 10) : 2,
    isIndiaRelevant,
  };
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 PeaKFinanceBot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpGet(res.headers.location));
      }
      if (res.statusCode !== 200) return resolve(null);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

async function fetchFeed(feed) {
  try {
    const xml = await httpGet(feed.url);
    if (!xml) return [];
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) return [];

    const rawItems = channel.item || channel.entry || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    return items.slice(0, 20).map((item) => ({
      headline: (item.title || '').toString().replace(/<[^>]*>/g, '').trim(),
      summary: (item.description || item.summary || '').toString().replace(/<[^>]*>/g, '').slice(0, 500).trim(),
      url: (item.link || item.id || '').toString().trim(),
      publishedAt: item.pubDate || item.published || item.updated || new Date(),
      source: feed.source,
    }));
  } catch (err) {
    console.error(`[newsService] Failed to fetch ${feed.source}:`, err.message);
    return [];
  }
}

async function fetchAndStoreNews() {
  console.log('[newsService] Fetching news from RSS feeds...');
  let newCount = 0;

  try {
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    const allItems = results.flat().filter((item) => item.headline.length > 10);

    for (const item of allItems) {
      const headlineHash = hashHeadline(item.headline);
      const { eventCategory, affectedAssets, impactScore, isIndiaRelevant } = categorizeNews(
        item.headline,
        item.summary
      );

      try {
        await NewsEvent.create({
          headline: item.headline,
          summary: item.summary,
          source: item.source,
          url: item.url,
          publishedAt: new Date(item.publishedAt),
          headlineHash,
          eventCategory,
          affectedAssets,
          impactScore,
          isIndiaRelevant,
        });
        newCount++;
      } catch (err) {
        if (err.code !== 11000) {
          console.error('[newsService] Error saving news item:', err.message);
        }
      }
    }

    console.log(`[newsService] Stored ${newCount} new news items.`);
    return newCount;
  } catch (err) {
    console.error('[newsService] fetchAndStoreNews error:', err.message);
    return 0;
  }
}

async function getRecentHighImpact(hours = 6) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return NewsEvent.find({
    processed: false,
    impactScore: { $gte: 6 },
    isIndiaRelevant: true,
    publishedAt: { $gte: since },
  })
    .sort({ impactScore: -1, publishedAt: -1 })
    .limit(10);
}

module.exports = { fetchAndStoreNews, getRecentHighImpact, categorizeNews };
