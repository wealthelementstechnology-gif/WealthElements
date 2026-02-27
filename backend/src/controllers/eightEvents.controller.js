const EightEventsPlan = require('../models/EightEventsPlan');

// ─── Save / update plan (one per user, upsert) ─────────────────────────────────
const savePlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payload = { ...req.body, userId, computedAt: new Date() };

    const plan = await EightEventsPlan.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// ─── Get saved plan ────────────────────────────────────────────────────────────
const getPlan = async (req, res, next) => {
  try {
    const plan = await EightEventsPlan.findOne({ userId: req.user._id }).lean();
    return res.status(200).json({ success: true, data: plan || null });
  } catch (error) {
    next(error);
  }
};

module.exports = { savePlan, getPlan };
