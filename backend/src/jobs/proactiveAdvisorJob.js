const cron = require('node-cron');
const { fetchAndStoreNews } = require('../services/newsService');
const { processUnanalyzedEvents, expireOldAlerts } = require('../services/portfolioImpactService');

function startProactiveAdvisorJobs() {
  // Every 30 minutes: fetch latest news from RSS feeds
  cron.schedule('*/30 * * * *', async () => {
    console.log('[cron] Running news fetch...');
    await fetchAndStoreNews();
  });

  // Every 6 hours: analyze high-impact events and create user alerts
  cron.schedule('0 */6 * * *', async () => {
    console.log('[cron] Running portfolio impact analysis...');
    await processUnanalyzedEvents();
  });

  // 9 AM IST (3:30 AM UTC) daily: expire stale alerts
  cron.schedule('30 3 * * *', async () => {
    console.log('[cron] Running alert expiry...');
    await expireOldAlerts();
  });

  console.log('[cron] Proactive advisor jobs scheduled (news every 30min, analysis every 6hr).');
}

module.exports = { startProactiveAdvisorJobs };
