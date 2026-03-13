const { Router } = require('express');
const { protect } = require('../../middleware/auth');
const {
  getAlerts,
  dismissAlert,
  actOnAlert,
  getAlertSummary,
  triggerFetch,
  getNewsFeed,
} = require('../../controllers/alerts.controller');

const router = Router();

router.use(protect);

router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.get('/news-feed', getNewsFeed);
router.put('/:id/dismiss', dismissAlert);
router.put('/:id/act', actOnAlert);
router.post('/trigger-fetch', triggerFetch);

module.exports = router;
