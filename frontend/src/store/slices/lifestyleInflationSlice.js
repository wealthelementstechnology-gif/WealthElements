import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Detection result
  isDetected: false,
  severity: 'HEALTHY', // HEALTHY, MILD_CREEP, CONCERNING, CRITICAL

  // Growth metrics (6-month comparison)
  incomeGrowthPercent: 0,
  spendingGrowthPercent: 0,
  savingsRateChange: 0,

  // Category-wise creep detection
  creepingCategories: [],

  // Summary and recommendations
  summary: '',
  recommendations: [],

  // Historical data for tracking
  monthlyData: [],

  // Comparison period
  comparisonPeriod: 6, // months

  isLoading: false,
  error: null,
};

const lifestyleInflationSlice = createSlice({
  name: 'lifestyleInflation',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    analyzeLifestyleInflation: (state, action) => {
      const { monthlyData, categories } = action.payload;

      state.monthlyData = monthlyData || [];

      if (state.monthlyData.length < 6) {
        state.isDetected = false;
        state.summary = 'Need at least 6 months of data to detect lifestyle inflation.';
        state.isLoading = false;
        return;
      }

      // Split into old period (first 3 months) and recent period (last 3 months)
      const oldPeriod = state.monthlyData.slice(0, 3);
      const recentPeriod = state.monthlyData.slice(-3);

      // Calculate average income
      const oldAvgIncome = average(oldPeriod.map((m) => m.income));
      const recentAvgIncome = average(recentPeriod.map((m) => m.income));
      state.incomeGrowthPercent = percentChange(oldAvgIncome, recentAvgIncome);

      // Calculate average discretionary spending
      const oldAvgSpending = average(oldPeriod.map((m) => m.discretionarySpending));
      const recentAvgSpending = average(recentPeriod.map((m) => m.discretionarySpending));
      state.spendingGrowthPercent = percentChange(oldAvgSpending, recentAvgSpending);

      // Calculate savings rate change
      const oldSavingsRate = average(oldPeriod.map((m) => m.savingsRate));
      const recentSavingsRate = average(recentPeriod.map((m) => m.savingsRate));
      state.savingsRateChange = recentSavingsRate - oldSavingsRate;

      // Analyze category-wise creep
      state.creepingCategories = analyzeCategories(categories, oldPeriod, recentPeriod, state.incomeGrowthPercent);

      // Determine if lifestyle inflation is detected
      // Inflation detected if spending growth > income growth AND savings rate dropped
      const spendingOutpacingIncome = state.spendingGrowthPercent > state.incomeGrowthPercent + 5;
      const savingsRateFalling = state.savingsRateChange < -2;
      const hasCreepingCategories = state.creepingCategories.filter((c) => !c.isJustified).length > 0;

      state.isDetected = spendingOutpacingIncome || (savingsRateFalling && hasCreepingCategories);

      // Determine severity
      if (!state.isDetected) {
        state.severity = 'HEALTHY';
      } else if (state.spendingGrowthPercent - state.incomeGrowthPercent > 30 || state.savingsRateChange < -10) {
        state.severity = 'CRITICAL';
      } else if (state.spendingGrowthPercent - state.incomeGrowthPercent > 15 || state.savingsRateChange < -5) {
        state.severity = 'CONCERNING';
      } else {
        state.severity = 'MILD_CREEP';
      }

      // Generate summary
      state.summary = generateSummary(state);

      // Generate recommendations
      state.recommendations = generateRecommendations(state);

      state.isLoading = false;
      state.error = null;
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

// Helper: Calculate average
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Helper: Calculate percent change
function percentChange(oldVal, newVal) {
  if (oldVal === 0) return newVal > 0 ? 100 : 0;
  return parseFloat((((newVal - oldVal) / oldVal) * 100).toFixed(1));
}

// Helper: Analyze category-wise spending creep
function analyzeCategories(categories, oldPeriod, recentPeriod, incomeGrowthPercent) {
  if (!categories || categories.length === 0) return [];

  const creepingCategories = [];

  categories.forEach((category) => {
    const oldAvg = average(
      oldPeriod.map((m) => m.categorySpending?.[category.id] || 0)
    );
    const recentAvg = average(
      recentPeriod.map((m) => m.categorySpending?.[category.id] || 0)
    );

    const increasePercent = percentChange(oldAvg, recentAvg);
    const increaseAmount = recentAvg - oldAvg;

    // Only flag if increase is significant (> 20% or > ₹2000)
    if (increasePercent > 20 || increaseAmount > 2000) {
      // Check if justified by income growth
      const isJustified = incomeGrowthPercent >= increasePercent - 5;

      let explanation = '';
      if (isJustified) {
        explanation = `${category.name} spending increased by ${increasePercent}%, but this is proportional to your ${incomeGrowthPercent}% income growth.`;
      } else if (increasePercent > 50) {
        explanation = `${category.name} spending jumped ${increasePercent}% (₹${Math.round(increaseAmount).toLocaleString('en-IN')}/month more) while income only grew ${incomeGrowthPercent}%. This is significant lifestyle creep.`;
      } else {
        explanation = `${category.name} spending crept up ${increasePercent}% without corresponding income growth. Small increases add up over time.`;
      }

      creepingCategories.push({
        category: category.name,
        sixMonthsAgoAvg: Math.round(oldAvg),
        currentAvg: Math.round(recentAvg),
        increasePercent,
        increaseAmount: Math.round(increaseAmount),
        isJustified,
        explanation,
      });
    }
  });

  // Sort by increase amount (highest first)
  return creepingCategories.sort((a, b) => b.increaseAmount - a.increaseAmount);
}

// Helper: Generate plain English summary
function generateSummary(state) {
  const {
    isDetected,
    severity,
    incomeGrowthPercent,
    spendingGrowthPercent,
    savingsRateChange,
    creepingCategories,
  } = state;

  if (!isDetected) {
    if (incomeGrowthPercent > 10 && savingsRateChange >= 0) {
      return `Great news! Your income grew ${incomeGrowthPercent}% and you maintained or improved your savings rate. You're resisting lifestyle inflation.`;
    }
    return `Your spending is in line with your income. No lifestyle inflation detected.`;
  }

  const topCreeper = creepingCategories.find((c) => !c.isJustified);

  switch (severity) {
    case 'CRITICAL':
      return `Warning: Serious lifestyle inflation detected. Your spending grew ${spendingGrowthPercent}% while income only grew ${incomeGrowthPercent}%. Your savings rate dropped ${Math.abs(savingsRateChange).toFixed(1)} percentage points. ${topCreeper ? `${topCreeper.category} is the biggest culprit.` : ''} This trend will erode your wealth.`;

    case 'CONCERNING':
      return `Lifestyle inflation is creeping in. Spending is growing faster than income (${spendingGrowthPercent}% vs ${incomeGrowthPercent}%), and your savings rate fell by ${Math.abs(savingsRateChange).toFixed(1)} points. ${topCreeper ? `Watch your ${topCreeper.category} spending.` : ''} Time to course-correct.`;

    case 'MILD_CREEP':
      return `Mild spending creep detected. While not alarming, your spending growth (${spendingGrowthPercent}%) is slightly outpacing income (${incomeGrowthPercent}%). ${topCreeper ? `${topCreeper.category} increased the most.` : ''} Small adjustments now prevent bigger problems later.`;

    default:
      return `Spending patterns are being monitored.`;
  }
}

// Helper: Generate recommendations
function generateRecommendations(state) {
  const { isDetected, severity, creepingCategories, savingsRateChange } = state;
  const recommendations = [];

  if (!isDetected) {
    recommendations.push('Keep doing what you\'re doing. Consider investing the maintained savings.');
    return recommendations;
  }

  // Severity-based recommendations
  if (severity === 'CRITICAL') {
    recommendations.push('Freeze all non-essential spending for 30 days.');
    recommendations.push('Review and cancel subscriptions you rarely use.');
  }

  // Category-specific recommendations
  const unjustifiedCreepers = creepingCategories.filter((c) => !c.isJustified);

  unjustifiedCreepers.slice(0, 2).forEach((creeper) => {
    if (creeper.category.toLowerCase().includes('dining') || creeper.category.toLowerCase().includes('food')) {
      recommendations.push(`Reduce dining out - you\'re spending ₹${creeper.increaseAmount.toLocaleString('en-IN')}/month more on food. Try cooking at home twice more per week.`);
    } else if (creeper.category.toLowerCase().includes('shopping')) {
      recommendations.push(`Shopping increased by ₹${creeper.increaseAmount.toLocaleString('en-IN')}/month. Implement a 48-hour rule before purchases over ₹3,000.`);
    } else if (creeper.category.toLowerCase().includes('travel') || creeper.category.toLowerCase().includes('transport')) {
      recommendations.push(`Travel/transport costs jumped ${creeper.increasePercent}%. Consider if all trips are necessary or if cheaper alternatives exist.`);
    } else {
      recommendations.push(`${creeper.category} spending is up ₹${creeper.increaseAmount.toLocaleString('en-IN')}/month. Review and set a monthly cap.`);
    }
  });

  // Savings rate recommendation
  if (savingsRateChange < -5) {
    recommendations.push(`Your savings rate dropped ${Math.abs(savingsRateChange).toFixed(1)} points. Auto-transfer savings on salary day BEFORE spending.`);
  }

  // General wisdom
  if (recommendations.length < 3) {
    recommendations.push('Remember: Raises are for building wealth, not funding lifestyle upgrades.');
  }

  return recommendations.slice(0, 5);
}

export const {
  setLoading,
  analyzeLifestyleInflation,
  setError,
  clearError,
} = lifestyleInflationSlice.actions;

export default lifestyleInflationSlice.reducer;
