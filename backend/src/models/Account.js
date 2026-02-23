const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['SAVINGS', 'CURRENT', 'CREDIT_CARD', 'LOAN', 'FD', 'RD', 'MUTUAL_FUND', 'EPF', 'PPF', 'STOCKS', 'REAL_ESTATE', 'GOLD', 'OTHER'],
      required: true,
    },
    assetOrLiability: {
      type: String,
      enum: ['ASSET', 'LIABILITY'],
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    institution: {
      type: String,
      trim: true,
    },
    // Masked account number e.g. XXXX1234
    maskedAccountNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'FINVU_AA'],
      default: 'MANUAL',
    },
    finvuAccountId: {
      type: String,
      select: false,
    },
    lastSyncedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
