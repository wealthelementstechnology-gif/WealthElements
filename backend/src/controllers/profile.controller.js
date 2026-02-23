const FinancialProfile = require('../models/FinancialProfile');
const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    let profile = await FinancialProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await FinancialProfile.create({ userId: req.user._id });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Financial profile fields
    const fpFields = ['monthlyIncome', 'monthlyExpenses', 'riskProfile'];
    const fpUpdates = {};
    fpFields.forEach(f => { if (req.body[f] !== undefined) fpUpdates[f] = req.body[f]; });

    const profile = await FinancialProfile.findOneAndUpdate(
      { userId: req.user._id },
      fpUpdates,
      { new: true, upsert: true }
    );

    // User profile fields (name, dateOfBirth, city, employmentType)
    const userUpdates = {};
    if (req.body.name) userUpdates['profile.name'] = req.body.name;
    if (req.body.dateOfBirth) userUpdates['profile.dateOfBirth'] = req.body.dateOfBirth;
    if (req.body.city) userUpdates['profile.city'] = req.body.city;
    if (req.body.employmentType) userUpdates['profile.employmentType'] = req.body.employmentType;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const updateOnboarding = async (req, res, next) => {
  try {
    const { step, completed } = req.body;
    const updates = {};
    if (step !== undefined) updates.onboardingStep = step;
    if (completed !== undefined) updates.onboardingCompleted = completed;

    const profile = await FinancialProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, upsert: true }
    );

    if (completed) {
      await User.findByIdAndUpdate(req.user._id, { 'profile.onboardingCompleted': true });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updateOnboarding };
