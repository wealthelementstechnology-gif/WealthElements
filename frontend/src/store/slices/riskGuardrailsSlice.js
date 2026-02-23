import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Overall risk profile
  overallRiskScore: 0, // 0-100, lower is better
  riskLevel: 'LOW', // LOW, MODERATE, HIGH, CRITICAL

  // Active alerts
  activeAlerts: [],
  dismissedAlerts: [],

  // Key metrics
  metrics: {
    debtToIncomeRatio: 0,
    emiToIncomeRatio: 0,
    liquidityRatio: 0, // Liquid assets / 6 months expenses
    insuranceCoverageRatio: 0, // Term cover / 10x income
    concentrationRisk: 0, // % in single asset
    dependentCoverage: 0, // Health cover adequacy
  },

  // Summary
  summary: '',

  isLoading: false,
  error: null,
};

const riskGuardrailsSlice = createSlice({
  name: 'riskGuardrails',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    analyzeRisks: (state, action) => {
      const {
        monthlyIncome,
        totalDebt,
        monthlyEMIs,
        liquidAssets,
        monthlyExpenses,
        termInsuranceCover,
        healthInsuranceCover,
        assets,
        dependents,
        hasEmergencyFund,
      } = action.payload;

      // Calculate metrics
      const annualIncome = monthlyIncome * 12;

      state.metrics.debtToIncomeRatio = annualIncome > 0
        ? parseFloat((totalDebt / annualIncome).toFixed(2))
        : 0;

      state.metrics.emiToIncomeRatio = monthlyIncome > 0
        ? parseFloat(((monthlyEMIs / monthlyIncome) * 100).toFixed(1))
        : 0;

      const sixMonthExpenses = monthlyExpenses * 6;
      state.metrics.liquidityRatio = sixMonthExpenses > 0
        ? parseFloat((liquidAssets / sixMonthExpenses).toFixed(2))
        : 0;

      const recommendedTermCover = annualIncome * 10;
      state.metrics.insuranceCoverageRatio = recommendedTermCover > 0
        ? parseFloat((termInsuranceCover / recommendedTermCover).toFixed(2))
        : 0;

      // Calculate concentration risk (largest single asset as % of total)
      const totalAssets = assets?.reduce((sum, a) => sum + a.balance, 0) || 0;
      const largestAsset = assets?.reduce((max, a) => Math.max(max, a.balance), 0) || 0;
      state.metrics.concentrationRisk = totalAssets > 0
        ? parseFloat(((largestAsset / totalAssets) * 100).toFixed(1))
        : 0;

      // Check health cover adequacy (₹5L per person recommended)
      const recommendedHealthCover = (dependents + 1) * 500000;
      state.metrics.dependentCoverage = recommendedHealthCover > 0
        ? parseFloat((healthInsuranceCover / recommendedHealthCover).toFixed(2))
        : 0;

      // Generate alerts
      const alerts = [];

      // High Debt Ratio Alert
      if (state.metrics.debtToIncomeRatio > 3) {
        alerts.push({
          id: 'HIGH_DEBT_RATIO',
          type: 'HIGH_DEBT_RATIO',
          severity: 'HIGH',
          title: 'High Debt Burden',
          description: `Your total debt is ${state.metrics.debtToIncomeRatio}x your annual income. This is considered risky.`,
          impact: 'If income drops, you may struggle to meet loan payments. Lenders may also reject new loan applications.',
          recommendation: 'Focus on paying down debt before taking new loans. Target debt-to-income below 2x.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // EMI Overload Alert
      if (state.metrics.emiToIncomeRatio > 50) {
        alerts.push({
          id: 'OVERLEVERAGED',
          type: 'OVERLEVERAGED',
          severity: 'HIGH',
          title: 'EMI Burden Too High',
          description: `${state.metrics.emiToIncomeRatio}% of your income goes to EMIs. Healthy limit is 40%.`,
          impact: 'Little money left for savings, emergencies, or lifestyle. One missed payment can snowball.',
          recommendation: 'Avoid new loans. Consider prepaying high-interest loans to reduce EMI burden.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      } else if (state.metrics.emiToIncomeRatio > 40) {
        alerts.push({
          id: 'EMI_WARNING',
          type: 'OVERLEVERAGED',
          severity: 'MEDIUM',
          title: 'EMI Burden Approaching Limit',
          description: `${state.metrics.emiToIncomeRatio}% of income goes to EMIs. Getting close to the 40% safe limit.`,
          impact: 'Less flexibility for unexpected expenses or new financial goals.',
          recommendation: 'Avoid taking new EMI-based loans until existing ones reduce.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // No Emergency Fund Alert
      if (!hasEmergencyFund || state.metrics.liquidityRatio < 0.5) {
        alerts.push({
          id: 'NO_EMERGENCY_FUND',
          type: 'NO_EMERGENCY_FUND',
          severity: state.metrics.liquidityRatio < 0.2 ? 'HIGH' : 'MEDIUM',
          title: 'Inadequate Emergency Fund',
          description: `You have only ${(state.metrics.liquidityRatio * 6).toFixed(1)} months of expenses in liquid savings.`,
          impact: 'Any job loss, medical emergency, or unexpected expense could force you into debt.',
          recommendation: 'Build liquid savings equal to 6 months of expenses. Start with even ₹50,000.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // No Term Insurance Alert
      if (state.metrics.insuranceCoverageRatio < 0.5 && dependents > 0) {
        alerts.push({
          id: 'NO_TERM_INSURANCE',
          type: 'NO_TERM_INSURANCE',
          severity: 'HIGH',
          title: 'Insufficient Life Cover',
          description: `Your term insurance is only ${(state.metrics.insuranceCoverageRatio * 100).toFixed(0)}% of recommended 10x annual income.`,
          impact: 'If something happens to you, your family may struggle financially. Loans may burden them.',
          recommendation: `Get term insurance for at least ₹${((recommendedTermCover - termInsuranceCover) / 100000).toFixed(0)} lakhs. It costs less than you think.`,
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // Insufficient Health Cover Alert
      if (state.metrics.dependentCoverage < 0.8) {
        alerts.push({
          id: 'INSUFFICIENT_HEALTH_COVER',
          type: 'INSUFFICIENT_HEALTH_COVER',
          severity: 'MEDIUM',
          title: 'Health Insurance Gap',
          description: `Your health cover is only ${(state.metrics.dependentCoverage * 100).toFixed(0)}% of recommended amount for your family size.`,
          impact: 'One serious illness could wipe out savings. Hospital bills in India can easily cross ₹10 lakhs.',
          recommendation: `Increase health cover to at least ₹${(recommendedHealthCover / 100000).toFixed(0)} lakhs for ${dependents + 1} people.`,
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // Concentration Risk Alert
      if (state.metrics.concentrationRisk > 60) {
        alerts.push({
          id: 'CONCENTRATION_RISK',
          type: 'CONCENTRATION_RISK',
          severity: 'MEDIUM',
          title: 'Assets Too Concentrated',
          description: `${state.metrics.concentrationRisk}% of your wealth is in a single asset or account.`,
          impact: 'If that one investment fails or that bank has issues, most of your wealth is at risk.',
          recommendation: 'Diversify across different asset types - savings, FDs, mutual funds, PPF.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // Single Income Dependency (if no other income sources detected)
      // This would need income source data - simplified version
      if (monthlyIncome > 0 && !action.payload.hasMultipleIncomes) {
        alerts.push({
          id: 'SINGLE_INCOME_DEPENDENCY',
          type: 'SINGLE_INCOME_DEPENDENCY',
          severity: 'LOW',
          title: 'Single Income Dependency',
          description: 'Your household depends on one income source.',
          impact: 'Job loss means complete income stop. Building alternative income takes time.',
          recommendation: 'Consider developing a side skill, passive income, or spouse returning to work if applicable.',
          isDismissed: false,
          detectedAt: new Date().toISOString(),
        });
      }

      // Filter out previously dismissed alerts
      state.activeAlerts = alerts.filter(
        (a) => !state.dismissedAlerts.includes(a.id)
      );

      // Calculate overall risk score
      let riskScore = 0;
      state.activeAlerts.forEach((alert) => {
        if (alert.severity === 'HIGH') riskScore += 30;
        else if (alert.severity === 'MEDIUM') riskScore += 15;
        else riskScore += 5;
      });
      riskScore = Math.min(100, riskScore);
      state.overallRiskScore = riskScore;

      // Determine risk level
      if (riskScore >= 60) {
        state.riskLevel = 'CRITICAL';
      } else if (riskScore >= 40) {
        state.riskLevel = 'HIGH';
      } else if (riskScore >= 20) {
        state.riskLevel = 'MODERATE';
      } else {
        state.riskLevel = 'LOW';
      }

      // Generate summary
      const highAlerts = state.activeAlerts.filter((a) => a.severity === 'HIGH').length;
      const mediumAlerts = state.activeAlerts.filter((a) => a.severity === 'MEDIUM').length;

      if (state.activeAlerts.length === 0) {
        state.summary = 'No major financial risks detected. Your financial foundation is solid.';
      } else if (highAlerts > 0) {
        state.summary = `${highAlerts} critical risk${highAlerts > 1 ? 's' : ''} detected that need immediate attention. ${state.activeAlerts[0].title} is the most urgent.`;
      } else {
        state.summary = `${mediumAlerts} moderate risk${mediumAlerts > 1 ? 's' : ''} to address. None are urgent but fixing them will strengthen your finances.`;
      }

      state.isLoading = false;
      state.error = null;
    },

    dismissAlert: (state, action) => {
      const alertId = action.payload;
      state.dismissedAlerts.push(alertId);
      state.activeAlerts = state.activeAlerts.filter((a) => a.id !== alertId);

      // Recalculate risk score
      let riskScore = 0;
      state.activeAlerts.forEach((alert) => {
        if (alert.severity === 'HIGH') riskScore += 30;
        else if (alert.severity === 'MEDIUM') riskScore += 15;
        else riskScore += 5;
      });
      state.overallRiskScore = Math.min(100, riskScore);
    },

    restoreAlert: (state, action) => {
      const alertId = action.payload;
      state.dismissedAlerts = state.dismissedAlerts.filter((id) => id !== alertId);
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
  analyzeRisks,
  dismissAlert,
  restoreAlert,
  setError,
  clearError,
} = riskGuardrailsSlice.actions;

export default riskGuardrailsSlice.reducer;
