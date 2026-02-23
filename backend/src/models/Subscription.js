const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'WEEKLY'],
      default: 'MONTHLY',
    },
    nextRenewalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DETECTED'],
      default: 'ACTIVE',
    },
    // If auto-detected from a transaction
    detectedFromTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    source: {
      type: String,
      enum: ['MANUAL', 'AUTO_DETECTED'],
      default: 'MANUAL',
    },
    category: {
      type: String,
      default: 'Entertainment',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
