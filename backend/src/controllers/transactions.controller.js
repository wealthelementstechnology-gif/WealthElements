const Transaction = require('../models/Transaction');

// @desc    Get transactions with optional filters
// @route   GET /api/v1/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { month, year, category, limit = 100 } = req.query;
    const filter = { userId: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly spending summary by category
// @route   GET /api/v1/transactions/summary
const getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = month ? Number(month) : now.getMonth() + 1;
    const y = year ? Number(year) : now.getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'DEBIT',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpend = summary.reduce((sum, s) => sum + s.total, 0);

    res.status(200).json({
      success: true,
      data: { month: m, year: y, totalSpend, categories: summary },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add transaction manually
// @route   POST /api/v1/transactions
const addTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction category (manual override)
// @route   PUT /api/v1/transactions/:id/category
const updateCategory = async (req, res, next) => {
  try {
    const { category } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category, isManualCategory: true },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 6-month spending trend
// @route   GET /api/v1/transactions/trend
const getSpendingTrend = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trend = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'DEBIT',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, getMonthlySummary, addTransaction, updateCategory, getSpendingTrend };
