const Subscription = require('../models/Subscription');

const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const active = subscriptions.filter(s => s.status === 'ACTIVE');
    const detected = subscriptions.filter(s => s.status === 'DETECTED');
    const inactive = subscriptions.filter(s => s.status === 'INACTIVE');
    res.status(200).json({ success: true, data: { active, detected, inactive } });
  } catch (error) {
    next(error);
  }
};

const addSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

const confirmSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'ACTIVE' },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'INACTIVE' },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubscriptions, addSubscription, updateSubscription, confirmSubscription, cancelSubscription };
