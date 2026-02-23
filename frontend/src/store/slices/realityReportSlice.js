import { createSlice } from '@reduxjs/toolkit';

// Report sections
const SECTIONS = {
  SNAPSHOT: 'snapshot',
  RISKS: 'risks',
  WINS: 'wins',
  ACTION_PLAN: 'action_plan',
};

const initialState = {
  // Report metadata
  generatedAt: null,
  periodCovered: '', // e.g., "December 2024"

  // Financial Snapshot
  snapshot: {
    netWorth: 0,
    netWorthChange: 0, // vs last month
    netWorthChangePercent: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    survivalMonths: 0,
    healthScore: 0,
  },

  // Key Metrics Summary
  keyMetrics: {
    liquidAssets: 0,
    totalDebt: 0,
    debtToIncomeRatio: 0,
    monthlyEMIs: 0,
    emiToIncomeRatio: 0,
    insuranceCoverage: 0,
    retirementProgress: 0, // percentage towards goal
  },

  // What's at Risk - Critical issues that need attention
  risks: [],

  // What's Working - Positive behaviors to continue
  wins: [],

  // 30-Day Action Plan
  actionPlan: {
    immediate: [], // Do this week
    thisMonth: [], // Complete within 30 days
    ongoing: [], // Habits to maintain
  },

  // Trend indicators
  trends: {
    netWorth: 'stable', // improving, stable, declining
    spending: 'stable',
    savings: 'stable',
    healthScore: 'stable',
  },

  // Summary message
  summaryMessage: '',
  overallAssessment: 'NEEDS_ATTENTION', // STRONG, STABLE, NEEDS_ATTENTION, CRITICAL

  isLoading: false,
  error: null,
};

const realityReportSlice = createSlice({
  name: 'realityReport',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    generateReport: (state, action) => {
      const {
        netWorth,
        assets,
        liabilities,
        cashFlow,
        emergencyFund,
        healthScore,
        hygieneIssues,
        goals,
        riskAlerts,
        lifestyleInflation,
        previousMonth,
      } = action.payload;

      const now = new Date();
      state.generatedAt = now.toISOString();
      state.periodCovered = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      // Calculate snapshot
      state.snapshot = calculateSnapshot(netWorth, cashFlow, emergencyFund, healthScore, previousMonth);

      // Calculate key metrics
      state.keyMetrics = calculateKeyMetrics(assets, liabilities, cashFlow);

      // Identify risks
      state.risks = identifyRisks(hygieneIssues, riskAlerts, emergencyFund, cashFlow, lifestyleInflation);

      // Identify wins
      state.wins = identifyWins(healthScore, goals, cashFlow, emergencyFund);

      // Generate action plan
      state.actionPlan = generateActionPlan(state.risks, hygieneIssues, goals);

      // Calculate trends
      state.trends = calculateTrends(netWorth, cashFlow, healthScore, previousMonth);

      // Generate summary
      const summary = generateSummary(state.snapshot, state.risks, state.wins);
      state.summaryMessage = summary.message;
      state.overallAssessment = summary.assessment;

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

// Calculate financial snapshot
function calculateSnapshot(netWorth, cashFlow, emergencyFund, healthScore, previousMonth) {
  const prevNetWorth = previousMonth?.netWorth || netWorth;
  const netWorthChange = netWorth - prevNetWorth;
  const netWorthChangePercent = prevNetWorth > 0 ? ((netWorthChange / prevNetWorth) * 100) : 0;

  const monthlyIncome = cashFlow?.totalMonthlyIncome || 0;
  const monthlyExpenses = cashFlow?.totalMonthlyExpenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100) : 0;

  return {
    netWorth,
    netWorthChange,
    netWorthChangePercent: parseFloat(netWorthChangePercent.toFixed(1)),
    monthlyIncome,
    monthlyExpenses,
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    survivalMonths: emergencyFund?.survivalMonths || 0,
    healthScore: healthScore?.overallScore || 0,
  };
}

// Calculate key metrics
function calculateKeyMetrics(assets, liabilities, cashFlow) {
  const liquidAssets =
    (assets?.bankAccounts || 0) +
    (assets?.fixedDeposits || 0) +
    (assets?.liquidFunds || 0) +
    (assets?.cash || 0);

  const totalDebt = liabilities?.total || 0;
  const monthlyIncome = cashFlow?.totalMonthlyIncome || 0;
  const annualIncome = monthlyIncome * 12;

  const debtToIncomeRatio = annualIncome > 0 ? (totalDebt / annualIncome) : 0;

  const monthlyEMIs =
    (liabilities?.homeLoanEMI || 0) +
    (liabilities?.carLoanEMI || 0) +
    (liabilities?.personalLoanEMI || 0) +
    (liabilities?.creditCardEMI || 0);

  const emiToIncomeRatio = monthlyIncome > 0 ? ((monthlyEMIs / monthlyIncome) * 100) : 0;

  return {
    liquidAssets,
    totalDebt,
    debtToIncomeRatio: parseFloat(debtToIncomeRatio.toFixed(2)),
    monthlyEMIs,
    emiToIncomeRatio: parseFloat(emiToIncomeRatio.toFixed(1)),
    insuranceCoverage: assets?.termInsuranceCover || 0,
    retirementProgress: 0, // Will be calculated based on goals
  };
}

// Identify risks
function identifyRisks(hygieneIssues, riskAlerts, emergencyFund, cashFlow, lifestyleInflation) {
  const risks = [];

  // Critical hygiene issues
  if (hygieneIssues && hygieneIssues.length > 0) {
    const criticalIssues = hygieneIssues.filter((i) => i.severity === 'CRITICAL');
    criticalIssues.forEach((issue) => {
      risks.push({
        type: 'hygiene',
        severity: 'critical',
        title: issue.title,
        description: issue.description,
        action: issue.action,
      });
    });
  }

  // Emergency fund issues
  if (emergencyFund) {
    if (emergencyFund.survivalMonths < 1) {
      risks.push({
        type: 'emergency',
        severity: 'critical',
        title: 'No emergency cushion',
        description: 'You have less than 1 month of expenses saved. Any unexpected event will force you into debt.',
        action: 'Start building emergency fund immediately - even ₹5,000/month helps.',
      });
    } else if (emergencyFund.survivalMonths < 3) {
      risks.push({
        type: 'emergency',
        severity: 'high',
        title: 'Emergency fund too low',
        description: `Only ${emergencyFund.survivalMonths.toFixed(1)} months of expenses saved. Target is 6 months.`,
        action: 'Prioritize emergency fund before other investments.',
      });
    }
  }

  // Cash flow issues
  if (cashFlow) {
    if (cashFlow.savingsRate < 0) {
      risks.push({
        type: 'cashflow',
        severity: 'critical',
        title: 'Spending more than earning',
        description: 'You\'re spending more than your income. This is unsustainable and will deplete savings.',
        action: 'Identify and cut non-essential expenses immediately.',
      });
    } else if (cashFlow.savingsRate < 10) {
      risks.push({
        type: 'cashflow',
        severity: 'high',
        title: 'Savings rate too low',
        description: `Saving only ${cashFlow.savingsRate?.toFixed(1)}% of income. Minimum should be 20%.`,
        action: 'Review discretionary spending and automate savings.',
      });
    }
  }

  // Lifestyle inflation
  if (lifestyleInflation && lifestyleInflation.severity !== 'HEALTHY') {
    risks.push({
      type: 'lifestyle',
      severity: lifestyleInflation.severity === 'CRITICAL' ? 'critical' : 'high',
      title: 'Lifestyle inflation detected',
      description: lifestyleInflation.summary || 'Spending is growing faster than income.',
      action: 'Review recent spending increases and cut back where possible.',
    });
  }

  // Risk alerts
  if (riskAlerts && riskAlerts.length > 0) {
    riskAlerts.slice(0, 3).forEach((alert) => {
      if (!risks.find((r) => r.title === alert.title)) {
        risks.push({
          type: 'risk',
          severity: alert.severity?.toLowerCase() || 'medium',
          title: alert.title,
          description: alert.description,
          action: alert.action,
        });
      }
    });
  }

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 5);
}

// Identify wins
function identifyWins(healthScore, goals, cashFlow, emergencyFund) {
  const wins = [];

  // Health score wins
  if (healthScore) {
    if (healthScore.components?.consistency?.score >= 80) {
      wins.push({
        type: 'behavior',
        title: 'Consistent financial behavior',
        description: 'You\'re regularly tracking and managing your finances. This discipline builds wealth over time.',
        encouragement: 'Keep this up - consistency beats perfection.',
      });
    }

    if (healthScore.components?.expenseDiscipline?.score >= 80) {
      wins.push({
        type: 'spending',
        title: 'Expense discipline is strong',
        description: 'You\'re keeping spending under control and avoiding unnecessary splurges.',
        encouragement: 'This self-control is your superpower.',
      });
    }
  }

  // Emergency fund wins
  if (emergencyFund && emergencyFund.survivalMonths >= 6) {
    wins.push({
      type: 'security',
      title: 'Solid emergency fund',
      description: `You have ${emergencyFund.survivalMonths.toFixed(1)} months of expenses saved. This provides real security.`,
      encouragement: 'You\'re protected against most financial shocks.',
    });
  }

  // Savings rate wins
  if (cashFlow && cashFlow.savingsRate >= 30) {
    wins.push({
      type: 'saving',
      title: 'Excellent savings rate',
      description: `Saving ${cashFlow.savingsRate?.toFixed(0)}% of income puts you ahead of most Indians.`,
      encouragement: 'This accelerates your path to financial freedom.',
    });
  } else if (cashFlow && cashFlow.savingsRate >= 20) {
    wins.push({
      type: 'saving',
      title: 'Good savings rate',
      description: `Saving ${cashFlow.savingsRate?.toFixed(0)}% of income is a solid foundation.`,
      encouragement: 'Try to increase by 1% each quarter.',
    });
  }

  // Goal progress wins
  if (goals && goals.length > 0) {
    const onTrackGoals = goals.filter((g) => g.progress?.isOnTrack);
    if (onTrackGoals.length > 0) {
      wins.push({
        type: 'goals',
        title: `${onTrackGoals.length} goal(s) on track`,
        description: `You\'re making steady progress towards ${onTrackGoals.map((g) => g.name).join(', ')}.`,
        encouragement: 'Consistent contributions compound over time.',
      });
    }
  }

  return wins.slice(0, 4);
}

// Generate action plan
function generateActionPlan(risks, hygieneIssues, goals) {
  const immediate = [];
  const thisMonth = [];
  const ongoing = [];

  // Add critical items to immediate
  risks
    .filter((r) => r.severity === 'critical')
    .slice(0, 2)
    .forEach((risk) => {
      immediate.push({
        task: risk.action,
        reason: risk.title,
        priority: 1,
      });
    });

  // Add high priority items to this month
  risks
    .filter((r) => r.severity === 'high')
    .slice(0, 2)
    .forEach((risk) => {
      thisMonth.push({
        task: risk.action,
        reason: risk.title,
        priority: 2,
      });
    });

  // Add hygiene fixes
  if (hygieneIssues && hygieneIssues.length > 0) {
    const topHygieneIssues = hygieneIssues
      .filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH')
      .slice(0, 2);

    topHygieneIssues.forEach((issue) => {
      if (!immediate.find((i) => i.task === issue.action) && !thisMonth.find((i) => i.task === issue.action)) {
        thisMonth.push({
          task: issue.action,
          reason: issue.title,
          priority: issue.severity === 'CRITICAL' ? 1 : 2,
        });
      }
    });
  }

  // Add ongoing habits
  ongoing.push({
    habit: 'Track all expenses daily',
    impact: 'Awareness is the first step to control.',
  });

  ongoing.push({
    habit: 'Review subscriptions monthly',
    impact: 'Small recurring charges add up silently.',
  });

  ongoing.push({
    habit: 'Check net worth weekly',
    impact: 'Regular monitoring motivates progress.',
  });

  // Ensure at least one item in each category
  if (immediate.length === 0) {
    immediate.push({
      task: 'Review and update your financial goals',
      reason: 'Clear goals drive better decisions',
      priority: 1,
    });
  }

  if (thisMonth.length === 0) {
    thisMonth.push({
      task: 'Set up automatic savings transfer',
      reason: 'Automate before you can forget',
      priority: 2,
    });
  }

  return {
    immediate: immediate.slice(0, 3),
    thisMonth: thisMonth.slice(0, 4),
    ongoing: ongoing.slice(0, 3),
  };
}

// Calculate trends
function calculateTrends(netWorth, cashFlow, healthScore, previousMonth) {
  const trends = {
    netWorth: 'stable',
    spending: 'stable',
    savings: 'stable',
    healthScore: 'stable',
  };

  if (previousMonth) {
    // Net worth trend
    const netWorthChange = netWorth - (previousMonth.netWorth || netWorth);
    if (netWorthChange > netWorth * 0.02) trends.netWorth = 'improving';
    else if (netWorthChange < -netWorth * 0.02) trends.netWorth = 'declining';

    // Spending trend
    if (cashFlow && previousMonth.expenses) {
      const expenseChange = cashFlow.totalMonthlyExpenses - previousMonth.expenses;
      if (expenseChange > previousMonth.expenses * 0.1) trends.spending = 'increasing';
      else if (expenseChange < -previousMonth.expenses * 0.1) trends.spending = 'decreasing';
    }

    // Savings trend
    if (cashFlow && previousMonth.savingsRate !== undefined) {
      const savingsChange = (cashFlow.savingsRate || 0) - previousMonth.savingsRate;
      if (savingsChange > 5) trends.savings = 'improving';
      else if (savingsChange < -5) trends.savings = 'declining';
    }

    // Health score trend
    if (healthScore && previousMonth.healthScore) {
      const scoreChange = healthScore.overallScore - previousMonth.healthScore;
      if (scoreChange > 5) trends.healthScore = 'improving';
      else if (scoreChange < -5) trends.healthScore = 'declining';
    }
  }

  return trends;
}

// Generate summary message
function generateSummary(snapshot, risks, wins) {
  let assessment = 'STABLE';
  let message = '';

  const criticalRisks = risks.filter((r) => r.severity === 'critical').length;
  const highRisks = risks.filter((r) => r.severity === 'high').length;

  if (criticalRisks >= 2 || (criticalRisks >= 1 && highRisks >= 2)) {
    assessment = 'CRITICAL';
    message = `Your finances need urgent attention. You have ${criticalRisks} critical issue(s) that could seriously impact your financial security. Focus on the action plan below - these aren't optional.`;
  } else if (criticalRisks >= 1 || highRisks >= 2) {
    assessment = 'NEEDS_ATTENTION';
    message = `Your finances are functional but have some gaps that need fixing. The good news: nothing is broken beyond repair. Address the top issues in the next 30 days.`;
  } else if (wins.length >= 3 && snapshot.savingsRate >= 20) {
    assessment = 'STRONG';
    message = `Your finances are in good shape. You're saving well, managing risks, and making progress. Keep the momentum - the compound effect is working in your favor.`;
  } else {
    assessment = 'STABLE';
    message = `Your finances are stable but there's room for improvement. You're not in crisis, but small changes now can make a big difference over time.`;
  }

  // Add personalized touch based on savings rate
  if (snapshot.savingsRate < 0) {
    message += ' Priority one: stop the bleeding. Spending less than you earn is non-negotiable.';
  } else if (snapshot.savingsRate < 10) {
    message += ' Increasing your savings rate should be your top focus.';
  }

  return { assessment, message };
}

export const { setLoading, generateReport, setError, clearError } = realityReportSlice.actions;

export default realityReportSlice.reducer;
