const mongoose = require('mongoose');

const goalResultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentCost: { type: Number, default: 0 },
  futureValue: { type: Number, required: true },
  sip: { type: Number, required: true },
  years: { type: Number, required: true },
  returnRate: { type: Number },
  isProtected: { type: Boolean, default: false },
  wasOptimized: { type: Boolean, default: false },
}, { _id: false });

const eightEventsPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ── User inputs ────────────────────────────────────────────────────────────
    familyMode: {
      type: String,
      enum: ['individual', 'couple'],
      default: 'individual',
    },
    age: { type: Number, required: true },
    retirementAge: { type: Number, required: true },
    city: { type: String, trim: true },
    isMetroCity: { type: Boolean, default: false },

    // Couple fields (populated only when familyMode = 'couple')
    husbandAge: { type: Number },
    wifeAge: { type: Number },
    husbandRetirementAge: { type: Number },
    wifeRetirementAge: { type: Number },
    wifeWorking: { type: Boolean, default: false },

    // ── Step 3: Insurance gap ─────────────────────────────────────────────────
    existingTermInsurance: { type: Number, default: 0 },
    existingHealthInsurance: { type: Number, default: 0 },
    lifeInsuranceRequired: { type: Number, default: 0 },
    lifeInsuranceGap: { type: Number, default: 0 },
    healthInsuranceRequired: { type: Number, default: 0 },
    healthInsuranceGap: { type: Number, default: 0 },

    // ── Step 3: Emergency fund ────────────────────────────────────────────────
    emergencyFundCorpus: { type: Number, default: 0 },
    emergencyFundFV: { type: Number, default: 0 },
    emergencyFundSIP: { type: Number, default: 0 },

    // ── Step 4: Retirement corpus ─────────────────────────────────────────────
    retirementCorpus: { type: Number, default: 0 },
    retirementSIP: { type: Number, default: 0 },
    yearsToRetirement: { type: Number, default: 0 },
    yearsInRetirement: { type: Number, default: 0 },
    monthlyExpenseAtRetirement: { type: Number, default: 0 },

    // ── Step 4–7: Goals ───────────────────────────────────────────────────────
    goals: { type: [goalResultSchema], default: [] },

    // ── Step 5: Budget ────────────────────────────────────────────────────────
    investmentBudgetPct: { type: Number, default: 30 },
    monthlyInvestmentBudget: { type: Number, default: 0 },
    totalMonthlySIPRequired: { type: Number, default: 0 },
    budgetUtilizationPct: { type: Number, default: 0 },
    wasOptimized: { type: Boolean, default: false },

    // ── Meta ──────────────────────────────────────────────────────────────────
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EightEventsPlan', eightEventsPlanSchema);
