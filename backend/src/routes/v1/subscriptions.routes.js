const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  confirmSubscription,
  cancelSubscription,
} = require('../../controllers/subscriptions.controller');

router.use(protect);

router.get('/', getSubscriptions);
router.post('/', addSubscription);
router.put('/:id', updateSubscription);
router.put('/:id/confirm', confirmSubscription);
router.put('/:id/cancel', cancelSubscription);

module.exports = router;
