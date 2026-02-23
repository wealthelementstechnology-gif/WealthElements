import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Overall score
  overallScore: 0,
  overallStatus: 'POOR', // POOR, FAIR, GOOD, EXCELLENT

  // Individual components (each 0-100)
  components: {
    consistency: {
      name: 'Saving Consistency',
      score: 0,
      weight: 25,
      status: 'POOR',
      explanation: '',
      improvements: [],
    },
    expenseDiscipline: {
      name: 'Expense Discipline',
      score: 0,
      weight: 25,
      status: 'POOR',
      explanation: '',
      improvements: [],
    },
    withdrawalBehavior: {
      name: 'Withdrawal Behavior',
      score: 0,
      weight: 20,
      status: 'POOR',
      explanation: '',
      improvements: [],
    },
    planningHygiene: {
      name: 'Planning Hygiene',
      score: 0,
      weight: 15,
      status: 'POOR',
      explanation: '',
      improvements: [],
    },
    debtHealth: {
      name: 'Debt Health',
      score: 0,
      weight: 15,
      status: 'POOR',
      explanation: '',
      improvements: [],
    },
  },

  // Summary and actions
  summary: '',
  top3Actions: [],

  // Trend
  trend: {
    previousScore: 0,
    change: 0,
    direction: 'STABLE', // UP, DOWN, STABLE
  },

  // Historical scores (last 12 months)
  scoreHistory: [],

  isLoading: false,
  error: null,
};

const healthScoreSlice = createSlice({
  name: 'healthScore',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    calculateHealthScore: (state, action) => {
      const {
        savingsData,
        expenseData,
        withdrawalData,
        planningData,
        debtData,
        previousScore,
      } = action.payload;

      // Calculate Consistency Score
      state.components.consistency = calculateConsistencyScore(savingsData);

      // Calculate Expense Discipline Score
      state.components.expenseDiscipline = calculateExpenseDisciplineScore(expenseData);

      // Calculate Withdrawal Behavior Score
      state.components.withdrawalBehavior = calculateWithdrawalScore(withdrawalData);

      // Calculate Planning Hygiene Score
      state.components.planningHygiene = calculatePlanningScore(planningData);

      // Calculate Debt Health Score
      state.components.debtHealth = calculateDebtHealthScore(debtData);

      // Calculate overall score (weighted average)
      let totalWeight = 0;
      let weightedSum = 0;

      Object.values(state.components).forEach((component) => {
        weightedSum += component.score * component.weight;
        totalWeight += component.weight;
      });

      state.overallScore = Math.round(weightedSum / totalWeight);

      // Determine overall status
      if (state.overallScore >= 80) {
        state.overallStatus = 'EXCELLENT';
      } else if (state.overallScore >= 60) {
        state.overallStatus = 'GOOD';
      } else if (state.overallScore >= 40) {
        state.overallStatus = 'FAIR';
      } else {
        state.overallStatus = 'POOR';
      }

      // Calculate trend
      state.trend = {
        previousScore: previousScore || state.overallScore,
        change: state.overallScore - (previousScore || state.overallScore),
        direction:
          state.overallScore > (previousScore || 0)
            ? 'UP'
            : state.overallScore < (previousScore || 0)
              ? 'DOWN'
              : 'STABLE',
      };

      // Generate summary
      state.summary = generateSummary(state);

      // Get top 3 actions
      state.top3Actions = getTop3Actions(state.components);

      state.isLoading = false;
      state.error = null;
    },

    addScoreToHistory: (state, action) => {
      state.scoreHistory.push({
        month: action.payload.month || new Date().toISOString().slice(0, 7),
        score: state.overallScore,
        components: { ...state.components },
      });

      // Keep only last 12 months
      if (state.scoreHistory.length > 12) {
        state.scoreHistory.shift();
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

// Helper: Calculate Saving Consistency Score
function calculateConsistencyScore(data) {
  const {
    monthsWithSavings = 0,
    totalMonths = 12,
    averageSavingsRate = 0,
    missedMonths = [],
  } = data || {};

  const consistencyRatio = totalMonths > 0 ? monthsWithSavings / totalMonths : 0;
  const savingsRateBonus = Math.min(20, averageSavingsRate * 2);

  const score = Math.min(100, Math.round(consistencyRatio * 80 + savingsRateBonus));
  const status = getStatus(score);

  let explanation = '';
  if (score >= 80) {
    explanation = `You saved money in ${monthsWithSavings} out of ${totalMonths} months. Excellent consistency!`;
  } else if (score >= 60) {
    explanation = `You saved in ${monthsWithSavings} months. Good, but some months were missed.`;
  } else if (score >= 40) {
    explanation = `Savings were irregular. Only ${monthsWithSavings} of ${totalMonths} months had positive savings.`;
  } else {
    explanation = `Savings consistency needs work. Focus on saving at least something every month.`;
  }

  const improvements = [];
  if (missedMonths.length > 0) {
    improvements.push(`Set up auto-transfer on salary day to avoid missing months.`);
  }
  if (averageSavingsRate < 20) {
    improvements.push(`Aim to save at least 20% of income each month.`);
  }
  if (score < 60) {
    improvements.push(`Start with a small fixed amount, even ₹1,000/month builds the habit.`);
  }

  return {
    name: 'Saving Consistency',
    score,
    weight: 25,
    status,
    explanation,
    improvements,
  };
}

// Helper: Calculate Expense Discipline Score
function calculateExpenseDisciplineScore(data) {
  const {
    budgetAdherence = 0, // % of months within budget
    discretionaryRatio = 0, // % of income spent on discretionary
    overspendingMonths = 0,
  } = data || {};

  const adherenceScore = budgetAdherence * 50;
  const discretionaryScore = Math.max(0, 50 - discretionaryRatio * 1.5);

  const score = Math.min(100, Math.round(adherenceScore / 100 + discretionaryScore));
  const status = getStatus(score);

  let explanation = '';
  if (score >= 80) {
    explanation = `Great expense control! You stayed within budget ${budgetAdherence}% of the time.`;
  } else if (score >= 60) {
    explanation = `Reasonable discipline. Discretionary spending at ${discretionaryRatio}% of income.`;
  } else if (score >= 40) {
    explanation = `Spending often exceeds plans. Overspent in ${overspendingMonths} months.`;
  } else {
    explanation = `Expense discipline needs serious attention. Spending is outpacing income.`;
  }

  const improvements = [];
  if (discretionaryRatio > 30) {
    improvements.push(`Cut discretionary spending from ${discretionaryRatio}% to under 30%.`);
  }
  if (budgetAdherence < 80) {
    improvements.push(`Review and adjust unrealistic budget categories.`);
  }
  if (overspendingMonths > 3) {
    improvements.push(`Use the 24-hour rule before any purchase over ₹2,000.`);
  }

  return {
    name: 'Expense Discipline',
    score,
    weight: 25,
    status,
    explanation,
    improvements,
  };
}

// Helper: Calculate Withdrawal Behavior Score
function calculateWithdrawalScore(data) {
  const {
    emergencyFundWithdrawals = 0,
    investmentWithdrawals = 0,
    fdBreaks = 0,
    reasonableWithdrawals = 0, // Planned, for goals
  } = data || {};

  const badWithdrawals = emergencyFundWithdrawals + investmentWithdrawals + fdBreaks;
  const totalWithdrawals = badWithdrawals + reasonableWithdrawals;

  let score = 100;
  score -= emergencyFundWithdrawals * 20;
  score -= investmentWithdrawals * 15;
  score -= fdBreaks * 10;
  score = Math.max(0, Math.min(100, score));

  const status = getStatus(score);

  let explanation = '';
  if (score >= 80) {
    explanation = `You rarely dip into savings. Your wealth stays invested.`;
  } else if (score >= 60) {
    explanation = `Some unplanned withdrawals detected. Try to avoid breaking FDs/investments.`;
  } else if (score >= 40) {
    explanation = `Frequent withdrawals are hurting wealth growth. ${badWithdrawals} unplanned withdrawals this year.`;
  } else {
    explanation = `Savings are being used like a current account. This prevents wealth building.`;
  }

  const improvements = [];
  if (emergencyFundWithdrawals > 0) {
    improvements.push(`Build a separate "sinking fund" for irregular expenses.`);
  }
  if (fdBreaks > 0) {
    improvements.push(`Use liquid funds instead of FDs for money you might need.`);
  }
  if (badWithdrawals > 3) {
    improvements.push(`Create mental barriers - name accounts by purpose.`);
  }

  return {
    name: 'Withdrawal Behavior',
    score,
    weight: 20,
    status,
    explanation,
    improvements,
  };
}

// Helper: Calculate Planning Hygiene Score
function calculatePlanningScore(data) {
  const {
    hasEmergencyFund = false,
    hasTermInsurance = false,
    hasHealthInsurance = false,
    hasWill = false,
    nomineesUpdated = false,
    hasFinancialGoals = false,
    goalCount = 0,
  } = data || {};

  let score = 0;
  if (hasEmergencyFund) score += 20;
  if (hasTermInsurance) score += 20;
  if (hasHealthInsurance) score += 15;
  if (hasWill) score += 15;
  if (nomineesUpdated) score += 15;
  if (hasFinancialGoals && goalCount >= 2) score += 15;

  const status = getStatus(score);

  const missing = [];
  if (!hasEmergencyFund) missing.push('emergency fund');
  if (!hasTermInsurance) missing.push('term insurance');
  if (!hasHealthInsurance) missing.push('health insurance');
  if (!nomineesUpdated) missing.push('updated nominees');
  if (!hasFinancialGoals) missing.push('financial goals');

  let explanation = '';
  if (score >= 80) {
    explanation = `Your financial foundation is solid. All key elements in place.`;
  } else if (score >= 60) {
    explanation = `Good progress on planning. Missing: ${missing.slice(0, 2).join(', ')}.`;
  } else if (score >= 40) {
    explanation = `Several planning gaps. Missing: ${missing.join(', ')}.`;
  } else {
    explanation = `Financial planning foundation is weak. Start with emergency fund and insurance.`;
  }

  const improvements = [];
  if (!hasEmergencyFund) {
    improvements.push(`Start building an emergency fund - even ₹50,000 helps.`);
  }
  if (!hasTermInsurance) {
    improvements.push(`Get term insurance (10-15x annual income) immediately.`);
  }
  if (!hasHealthInsurance) {
    improvements.push(`Get health insurance with ₹10L+ cover for family.`);
  }
  if (!nomineesUpdated) {
    improvements.push(`Update nominees in all accounts and policies.`);
  }

  return {
    name: 'Planning Hygiene',
    score,
    weight: 15,
    status,
    explanation,
    improvements,
  };
}

// Helper: Calculate Debt Health Score
function calculateDebtHealthScore(data) {
  const {
    debtToIncomeRatio = 0, // Total debt / Annual income
    emiToIncomeRatio = 0, // Monthly EMIs / Monthly income
    hasHighInterestDebt = false, // Credit cards, personal loans
    onTimePayments = 100, // % of EMIs paid on time
  } = data || {};

  let score = 100;

  // Deduct for high DTI
  if (debtToIncomeRatio > 3) score -= 30;
  else if (debtToIncomeRatio > 2) score -= 20;
  else if (debtToIncomeRatio > 1) score -= 10;

  // Deduct for high EMI burden
  if (emiToIncomeRatio > 50) score -= 30;
  else if (emiToIncomeRatio > 40) score -= 20;
  else if (emiToIncomeRatio > 30) score -= 10;

  // Deduct for high interest debt
  if (hasHighInterestDebt) score -= 15;

  // Deduct for missed payments
  score -= (100 - onTimePayments) * 0.5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const status = getStatus(score);

  let explanation = '';
  if (score >= 80) {
    explanation = `Healthy debt levels. EMIs are ${emiToIncomeRatio}% of income - well managed.`;
  } else if (score >= 60) {
    explanation = `Manageable debt but watch the EMI burden at ${emiToIncomeRatio}% of income.`;
  } else if (score >= 40) {
    explanation = `Debt is stressing your finances. EMIs take ${emiToIncomeRatio}% of income.`;
  } else {
    explanation = `Debt levels are unsustainable. Immediate action needed.`;
  }

  const improvements = [];
  if (hasHighInterestDebt) {
    improvements.push(`Pay off credit card debt first - it costs 36-42% per year!`);
  }
  if (emiToIncomeRatio > 40) {
    improvements.push(`Try to keep total EMIs under 40% of income.`);
  }
  if (onTimePayments < 100) {
    improvements.push(`Set up auto-debit for all EMIs to avoid missed payments.`);
  }
  if (debtToIncomeRatio > 2) {
    improvements.push(`Focus on reducing debt before taking new loans.`);
  }

  return {
    name: 'Debt Health',
    score,
    weight: 15,
    status,
    explanation,
    improvements,
  };
}

// Helper: Get status from score
function getStatus(score) {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

// Helper: Generate summary
function generateSummary(state) {
  const { overallScore, overallStatus, components } = state;

  const weakest = Object.values(components).sort((a, b) => a.score - b.score)[0];
  const strongest = Object.values(components).sort((a, b) => b.score - a.score)[0];

  if (overallStatus === 'EXCELLENT') {
    return `Your financial health is excellent at ${overallScore}/100. ${strongest.name} is your strongest area. Keep up the great work and consider optimizing ${weakest.name} further.`;
  } else if (overallStatus === 'GOOD') {
    return `Your financial health is good at ${overallScore}/100. Focus on improving ${weakest.name} (${weakest.score}/100) to reach excellent status.`;
  } else if (overallStatus === 'FAIR') {
    return `Your financial health needs attention at ${overallScore}/100. ${weakest.name} is the weakest area at ${weakest.score}/100. Small improvements here will boost your overall score.`;
  } else {
    return `Your financial health needs immediate attention at ${overallScore}/100. Start with ${weakest.name} - it's critical to address this first.`;
  }
}

// Helper: Get top 3 actions
function getTop3Actions(components) {
  const allImprovements = [];

  Object.values(components)
    .sort((a, b) => a.score - b.score) // Prioritize weakest
    .forEach((component) => {
      component.improvements.forEach((improvement) => {
        if (allImprovements.length < 3) {
          allImprovements.push(improvement);
        }
      });
    });

  return allImprovements.slice(0, 3);
}

export const {
  setLoading,
  calculateHealthScore,
  addScoreToHistory,
  setError,
  clearError,
} = healthScoreSlice.actions;

export default healthScoreSlice.reducer;
