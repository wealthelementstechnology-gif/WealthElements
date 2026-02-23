const Account = require('../models/Account');
const FinancialProfile = require('../models/FinancialProfile');

// @desc    Get all accounts (assets + liabilities) + networth summary + trend history
// @route   GET /api/v1/accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });

    const assets = accounts.filter(a => a.assetOrLiability === 'ASSET');
    const liabilities = accounts.filter(a => a.assetOrLiability === 'LIABILITY');
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const currentNetWorth = totalAssets - totalLiabilities;

    // Get stored history + append current month
    const profile = await FinancialProfile.findOne({ userId: req.user._id });
    const storedHistory = profile?.networthHistory || [];
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Build trend: stored history + ensure current month is up to date
    let trendData = [...storedHistory];
    const lastEntry = trendData[trendData.length - 1];
    if (!lastEntry || lastEntry.month !== currentMonth) {
      trendData.push({ month: currentMonth, netWorth: currentNetWorth, assets: totalAssets, liabilities: totalLiabilities });
    } else {
      trendData[trendData.length - 1] = { month: currentMonth, netWorth: currentNetWorth, assets: totalAssets, liabilities: totalLiabilities };
    }

    res.status(200).json({
      success: true,
      data: {
        accounts,
        summary: {
          totalAssets,
          totalLiabilities,
          netWorth: currentNetWorth,
        },
        trendData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add account
// @route   POST /api/v1/accounts
const addAccount = async (req, res, next) => {
  try {
    const account = await Account.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/v1/accounts/:id
const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (soft) account
// @route   DELETE /api/v1/accounts/:id
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, message: 'Account removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccounts, addAccount, updateAccount, deleteAccount };
