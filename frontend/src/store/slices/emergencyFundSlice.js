import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Emergency fund status
  currentAmount: 0,
  monthlyEssentialExpenses: 0,
  survivalMonths: 0,
  targetMonths: 6, // Standard recommendation
  shortfall: 0,
  status: 'CRITICAL', // CRITICAL, WARNING, ADEQUATE, STRONG
  statusMessage: '',

  // Calculation inputs
  liquidAssets: [], // Accounts that can be accessed quickly
  essentialExpenseBreakdown: {
    rent: 0,
    utilities: 0,
    groceries: 0,
    insurance: 0,
    emis: 0,
    medical: 0,
    transport: 0,
    other: 0,
  },

  // Alerts
  alerts: [],

  // Historical tracking
  monthlyHistory: [],

  // Contribution plan
  monthlyContributionNeeded: 0,
  projectedFullFundDate: null,

  isLoading: false,
  error: null,
};

const emergencyFundSlice = createSlice({
  name: 'emergencyFund',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setEmergencyFundData: (state, action) => {
      const {
        liquidAssets,
        essentialExpenseBreakdown,
        targetMonths,
        monthlyHistory,
        currentAmount,
        monthlyEssentialExpenses,
        monthlyContribution,
      } = action.payload;

      state.liquidAssets = liquidAssets || [];
      state.essentialExpenseBreakdown = essentialExpenseBreakdown || state.essentialExpenseBreakdown;
      state.targetMonths = targetMonths || 6;
      state.monthlyHistory = monthlyHistory || [];
      state.monthlyContribution = monthlyContribution || 0;

      // Use pre-calculated amount if provided, otherwise calculate
      if (currentAmount !== undefined) {
        state.currentAmount = currentAmount;
      } else {
        state.currentAmount = state.liquidAssets.reduce((sum, asset) => sum + (asset.balance || 0), 0);
      }

      // Use pre-calculated expenses if provided, otherwise calculate
      if (monthlyEssentialExpenses !== undefined) {
        state.monthlyEssentialExpenses = monthlyEssentialExpenses;
      } else {
        const breakdown = state.essentialExpenseBreakdown;
        state.monthlyEssentialExpenses =
          (breakdown.rent || 0) +
          (breakdown.utilities || 0) +
          (breakdown.groceries || 0) +
          (breakdown.insurance || 0) +
          (breakdown.emis || 0) +
          (breakdown.medical || 0) +
          (breakdown.transport || 0) +
          (breakdown.other || 0);
      }

      // Calculate survival months
      if (state.monthlyEssentialExpenses > 0) {
        state.survivalMonths = parseFloat((state.currentAmount / state.monthlyEssentialExpenses).toFixed(1));
      } else {
        state.survivalMonths = 0;
      }

      // Calculate shortfall
      const targetAmount = state.monthlyEssentialExpenses * state.targetMonths;
      state.shortfall = Math.max(0, targetAmount - state.currentAmount);

      // Determine status
      const { survivalMonths } = state;
      if (survivalMonths < 1) {
        state.status = 'CRITICAL';
        state.statusMessage = 'Emergency fund critically low. You cannot survive even 1 month without income.';
      } else if (survivalMonths < 3) {
        state.status = 'WARNING';
        state.statusMessage = `You can survive ${survivalMonths} month${survivalMonths > 1 ? 's' : ''} without income. Aim for at least 3 months.`;
      } else if (survivalMonths < 6) {
        state.status = 'ADEQUATE';
        state.statusMessage = `You have ${survivalMonths} months of runway. Building towards 6 months is recommended.`;
      } else {
        state.status = 'STRONG';
        state.statusMessage = `Excellent! You have ${survivalMonths} months of emergency coverage. You're financially secure.`;
      }

      // Calculate monthly contribution needed to reach target in 12 months
      if (state.shortfall > 0) {
        state.monthlyContributionNeeded = Math.ceil(state.shortfall / 12);
        const contributionRate = state.monthlyContribution || state.monthlyContributionNeeded;
        const monthsToTarget = contributionRate > 0 ? Math.ceil(state.shortfall / contributionRate) : 0;
        state.monthsToTarget = monthsToTarget;
        if (monthsToTarget > 0) {
          const projectedDate = new Date();
          projectedDate.setMonth(projectedDate.getMonth() + monthsToTarget);
          state.projectedFullFundDate = projectedDate.toISOString();
        }
      } else {
        state.monthlyContributionNeeded = 0;
        state.monthsToTarget = 0;
        state.projectedFullFundDate = null;
      }

      state.isLoading = false;
      state.error = null;
    },

    addAlert: (state, action) => {
      state.alerts.unshift({
        id: Date.now().toString(),
        ...action.payload,
        triggeredAt: new Date().toISOString(),
        isRead: false,
      });
    },

    markAlertAsRead: (state, action) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.isRead = true;
      }
    },

    dismissAlert: (state, action) => {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
    },

    updateEssentialExpense: (state, action) => {
      const { category, amount } = action.payload;
      if (state.essentialExpenseBreakdown.hasOwnProperty(category)) {
        state.essentialExpenseBreakdown[category] = amount;

        // Recalculate totals
        const breakdown = state.essentialExpenseBreakdown;
        state.monthlyEssentialExpenses =
          breakdown.rent +
          breakdown.utilities +
          breakdown.groceries +
          breakdown.insurance +
          breakdown.emis +
          breakdown.medical +
          breakdown.transport +
          breakdown.other;

        // Recalculate survival months
        if (state.monthlyEssentialExpenses > 0) {
          state.survivalMonths = Math.floor(state.currentAmount / state.monthlyEssentialExpenses);
        }
      }
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setEmergencyFundData,
  addAlert,
  markAlertAsRead,
  dismissAlert,
  updateEssentialExpense,
  setError,
  clearError,
} = emergencyFundSlice.actions;

export default emergencyFundSlice.reducer;
