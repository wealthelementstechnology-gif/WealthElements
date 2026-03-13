const mongoose = require('mongoose');

const proactiveAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    newsEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsEvent',
    },
    alertType: {
      type: String,
      enum: ['ALLOCATION_CHANGE', 'SIP_PAUSE', 'REBALANCE', 'OPPORTUNITY', 'MARKET_UPDATE'],
      default: 'MARKET_UPDATE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'DISMISSED', 'ACTED', 'EXPIRED'],
      default: 'PENDING',
    },
    urgency: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    recommendation: {
      headline: { type: String, required: true },
      rationale: { type: String, default: '' },
      affectedFunds: { type: [String], default: [] },
      suggestedAction: { type: String, default: '' },
      confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    },
    newsHeadline: { type: String, default: '' },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    },
  },
  { timestamps: true }
);

proactiveAlertSchema.index({ userId: 1, status: 1, createdAt: -1 });
// TTL index — MongoDB auto-deletes documents 7 days after expiresAt
proactiveAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('ProactiveAlert', proactiveAlertSchema);
