import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Income tracking
  incomeSources: [],
  totalMonthlyIncome: 0,

  // Expense classification
  fixedExpenses: [],
  variableExpenses: [],
  discretionaryExpenses: [],

  // Summaries
  currentMonthSummary: null,
  previousMonthSummary: null,
  comparison: null,
  explanations: [],

  // Historical data (last 12 months)
  monthlyHistory: [],

  isLoading: false,
  error: null,
};

const cashFlowSlice = createSlice({
  name: 'cashFlow',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setCashFlowData: (state, action) => {
      const {
        incomeSources,
        fixedExpenses,
        variableExpenses,
        discretionaryExpenses,
        monthlyHistory,
        totalMonthlyIncome,
        currentMonthSummary,
        previousMonthSummary,
        comparison,
        explanations,
      } = action.payload;

      state.incomeSources = incomeSources || [];
      state.fixedExpenses = fixedExpenses || [];
      state.variableExpenses = variableExpenses || [];
      state.discretionaryExpenses = discretionaryExpenses || [];
      state.monthlyHistory = monthlyHistory || [];

      // Use pre-calculated data if provided, otherwise calculate
      if (totalMonthlyIncome !== undefined) {
        state.totalMonthlyIncome = totalMonthlyIncome;
      } else {
        state.totalMonthlyIncome = state.incomeSources.reduce(
          (sum, src) => sum + (src.monthlyEquivalent || src.amount || 0),
          0
        );
      }

      // Use pre-calculated summary if provided
      if (currentMonthSummary) {
        state.currentMonthSummary = currentMonthSummary;
      } else {
        // Calculate current month summary
        const totalFixed = state.fixedExpenses.reduce((sum, e) => sum + (e.monthlyEquivalent || e.amount || 0), 0);
        const totalVariable = state.variableExpenses.reduce((sum, e) => sum + (e.monthlyEquivalent || e.amount || 0), 0);
        const totalDiscretionary = state.discretionaryExpenses.reduce(
          (sum, e) => sum + (e.monthlyEquivalent || e.amount || 0),
          0
        );
        const totalExpenses = totalFixed + totalVariable + totalDiscretionary;
        const surplus = state.totalMonthlyIncome - totalExpenses;

        state.currentMonthSummary = {
          totalIncome: state.totalMonthlyIncome,
          fixedExpenses: totalFixed,
          variableExpenses: totalVariable,
          discretionaryExpenses: totalDiscretionary,
          totalExpenses,
          surplus,
          monthlySavings: surplus,
          deficitRisk: surplus < 0 ? Math.abs(surplus) : 0,
          savingsRate: state.totalMonthlyIncome > 0
            ? parseFloat(((surplus / state.totalMonthlyIncome) * 100).toFixed(1))
            : 0,
          month: new Date().toISOString().slice(0, 7),
        };
      }

      // Use pre-calculated previous month if provided
      if (previousMonthSummary) {
        state.previousMonthSummary = previousMonthSummary;
      } else if (state.monthlyHistory.length > 1) {
        state.previousMonthSummary = state.monthlyHistory[state.monthlyHistory.length - 2];
      }

      // Use pre-calculated comparison if provided
      if (comparison) {
        state.comparison = comparison;
      } else if (state.previousMonthSummary) {
        const current = state.currentMonthSummary;
        const previous = state.previousMonthSummary;

        state.comparison = {
          current,
          previous,
          incomeChange: current.totalIncome - previous.totalIncome,
          incomeChangePercent: previous.totalIncome > 0
            ? ((current.totalIncome - previous.totalIncome) / previous.totalIncome * 100)
            : 0,
          expenseChange: current.totalExpenses - previous.totalExpenses,
          expenseChangePercent: previous.totalExpenses > 0
            ? ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses * 100)
            : 0,
        };
      }

      // Use pre-calculated explanations if provided
      if (explanations) {
        state.explanations = explanations;
      } else if (state.comparison) {
        state.explanations = generateExplanations(state.comparison);
      }

      state.isLoading = false;
      state.error = null;
    },

    addIncomeSource: (state, action) => {
      state.incomeSources.push(action.payload);
      state.totalMonthlyIncome += action.payload.monthlyEquivalent || action.payload.amount;
    },

    updateIncomeSource: (state, action) => {
      const index = state.incomeSources.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        const oldAmount = state.incomeSources[index].monthlyEquivalent;
        state.incomeSources[index] = action.payload;
        state.totalMonthlyIncome += (action.payload.monthlyEquivalent - oldAmount);
      }
    },

    removeIncomeSource: (state, action) => {
      const source = state.incomeSources.find((s) => s.id === action.payload);
      if (source) {
        state.totalMonthlyIncome -= source.monthlyEquivalent || source.amount;
        state.incomeSources = state.incomeSources.filter((s) => s.id !== action.payload);
      }
    },

    addExpense: (state, action) => {
      const { expense, category } = action.payload;
      if (category === 'FIXED') {
        state.fixedExpenses.push(expense);
      } else if (category === 'VARIABLE') {
        state.variableExpenses.push(expense);
      } else {
        state.discretionaryExpenses.push(expense);
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

// Helper function to generate plain English explanations
function generateExplanations(comparison) {
  const explanations = [];
  const changes = comparison.changes || comparison;
  if (!changes) return explanations;

  if (changes.incomeChange > 0) {
    explanations.push(
      `Your income increased by ₹${formatAmount(changes.incomeChange)} this month. Great progress!`
    );
  } else if (changes.incomeChange < 0) {
    explanations.push(
      `Your income dropped by ₹${formatAmount(Math.abs(changes.incomeChange))}. This may affect your savings target.`
    );
  }

  if (changes.fixedExpenseChange > 5000) {
    explanations.push(
      `Fixed expenses increased by ₹${formatAmount(changes.fixedExpenseChange)}. Check if any new EMIs or subscriptions were added.`
    );
  }

  if (changes.discretionaryChange > 10000) {
    explanations.push(
      `Discretionary spending is up by ₹${formatAmount(changes.discretionaryChange)}. Consider if all purchases were necessary.`
    );
  } else if (changes.discretionaryChange < -5000) {
    explanations.push(
      `Great job! You cut discretionary spending by ₹${formatAmount(Math.abs(changes.discretionaryChange))}.`
    );
  }

  if (changes.surplusChange > 0) {
    explanations.push(
      `Your monthly surplus improved by ₹${formatAmount(changes.surplusChange)}. You're building wealth faster.`
    );
  } else if (changes.surplusChange < -10000) {
    explanations.push(
      `Warning: Your surplus dropped by ₹${formatAmount(Math.abs(changes.surplusChange))}. Review your spending.`
    );
  }

  return explanations;
}

function formatAmount(amount) {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString('en-IN');
}

export const {
  setLoading,
  setCashFlowData,
  addIncomeSource,
  updateIncomeSource,
  removeIncomeSource,
  addExpense,
  setError,
  clearError,
} = cashFlowSlice.actions;

export default cashFlowSlice.reducer;
