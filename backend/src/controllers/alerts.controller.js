const ProactiveAlert = require('../models/ProactiveAlert');
const NewsEvent = require('../models/NewsEvent');
const { fetchAndStoreNews } = require('../services/newsService');
const { processUnanalyzedEvents } = require('../services/portfolioImpactService');

// GET /api/v1/alerts
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const status = req.query.status || 'PENDING';

    const alerts = await ProactiveAlert.find({ userId, status })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('newsEventId', 'headline source url publishedAt eventCategory');

    const pendingCount = await ProactiveAlert.countDocuments({ userId, status: 'PENDING' });
    const hasHighUrgency = alerts.some((a) => a.urgency === 'HIGH' && a.status === 'PENDING');

    res.json({ success: true, alerts, pendingCount, hasHighUrgency });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/alerts/:id/dismiss
const dismissAlert = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const alert = await ProactiveAlert.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { status: 'DISMISSED' } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/alerts/:id/act
const actOnAlert = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const alert = await ProactiveAlert.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { status: 'ACTED' } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/alerts/summary — for nav badge (pendingCount + hasHighUrgency)
const getAlertSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pendingCount = await ProactiveAlert.countDocuments({ userId, status: 'PENDING' });
    const latestHigh = await ProactiveAlert.findOne({ userId, status: 'PENDING', urgency: 'HIGH' })
      .sort({ createdAt: -1 })
      .select('recommendation.headline urgency createdAt');

    res.json({ success: true, pendingCount, hasHighUrgency: !!latestHigh, latestHigh });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/alerts/trigger-fetch — dev utility: manually trigger news fetch + analysis
const triggerFetch = async (req, res, next) => {
  try {
    const newItems = await fetchAndStoreNews();
    await processUnanalyzedEvents();
    res.json({ success: true, message: `Fetched ${newItems} new news items and ran analysis.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/alerts/news-feed — dev utility: view recent fetched news
const getNewsFeed = async (req, res, next) => {
  try {
    const news = await NewsEvent.find()
      .sort({ publishedAt: -1 })
      .limit(30)
      .select('headline source eventCategory impactScore isIndiaRelevant processed publishedAt');
    res.json({ success: true, news });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, dismissAlert, actOnAlert, getAlertSummary, triggerFetch, getNewsFeed };
