const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    // Calculated from transactions — updated on sync
    monthlyExpenses: {
      type: Number,
      default: 0,
    },
    savingsRate: {
      type: Number,
      default: 0,
    },
    emergencyFundMonths: {
      type: Number,
      default: 0,
    },
    riskProfile: {
      type: String,
      enum: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'],
      default: 'MODERATE',
    },
    // Finvu AA fields
    aaConsentHandle: {
      type: String,
      select: false,
    },
    aaConsentStatus: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED', 'NONE'],
      default: 'NONE',
    },
    aaLastSyncedAt: {
      type: Date,
    },
    // Networth history for trend chart — array of { month: 'YYYY-MM', netWorth, assets, liabilities }
    networthHistory: {
      type: [{
        month: String,
        netWorth: Number,
        assets: Number,
        liabilities: Number,
      }],
      default: [],
    },
    // Onboarding tracking
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
