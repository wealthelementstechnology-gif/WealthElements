const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    category: {
      type: String,
      default: 'Untagged',
    },
    isManualCategory: {
      type: Boolean,
      default: false,
    },
    // Raw narration from bank (e.g. "UPI/RAZORPAY/NETFLIX")
    description: {
      type: String,
      trim: true,
    },
    // Human-readable version (e.g. "Netflix")
    cleanDescription: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'FINVU_AA'],
      default: 'MANUAL',
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Compound index for efficient monthly queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
