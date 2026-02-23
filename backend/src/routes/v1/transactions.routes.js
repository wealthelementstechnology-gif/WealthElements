const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
  getTransactions,
  getMonthlySummary,
  addTransaction,
  updateCategory,
  getSpendingTrend,
} = require('../../controllers/transactions.controller');

router.use(protect);

router.get('/', getTransactions);
router.get('/summary', getMonthlySummary);
router.get('/trend', getSpendingTrend);
router.post('/', addTransaction);
router.put('/:id/category', updateCategory);

module.exports = router;
