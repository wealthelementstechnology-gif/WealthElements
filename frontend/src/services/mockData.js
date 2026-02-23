import { v4 as uuidv4 } from 'uuid';

// Mock Asset Accounts
export const mockAssetAccounts = [
  {
    accountId: 'acc_001',
    userId: 'user_001',
    accountType: 'SAVINGS',
    accountNumber: '50100123456789',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    balance: 485000,
    assetOrLiability: 'ASSET',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    accountId: 'acc_002',
    userId: 'user_001',
    accountType: 'SAVINGS',
    accountNumber: '00651234567',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0000065',
    balance: 125000,
    assetOrLiability: 'ASSET',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    accountId: 'acc_003',
    userId: 'user_001',
    accountType: 'FD',
    accountNumber: 'FD123456789',
    bankName: 'SBI',
    balance: 500000,
    assetOrLiability: 'ASSET',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    accountId: 'acc_004',
    userId: 'user_001',
    accountType: 'MUTUAL_FUND',
    accountNumber: 'MF987654321',
    bankName: 'Zerodha',
    balance: 350000,
    assetOrLiability: 'ASSET',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2024-04-05T11:20:00Z',
  },
];

// Mock Liability Accounts
export const mockLiabilityAccounts = [
  {
    accountId: 'acc_005',
    userId: 'user_001',
    accountType: 'LOAN',
    accountNumber: 'HL123456789',
    bankName: 'HDFC Bank',
    balance: 250000,
    assetOrLiability: 'LIABILITY',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2023-06-15T10:00:00Z',
  },
  {
    accountId: 'acc_006',
    userId: 'user_001',
    accountType: 'CREDIT_CARD',
    accountNumber: '4567890123456789',
    bankName: 'Axis Bank',
    balance: 45000,
    assetOrLiability: 'LIABILITY',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    createdAt: '2024-01-01T08:30:00Z',
  },
];

// Generate trend data for last 12 months
const generateTrendData = () => {
  const data = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Simulate gradual growth with some variation
    const baseAssets = 1200000 + (11 - i) * 30000 + Math.random() * 20000;
    const baseLiabilities = 350000 - (11 - i) * 5000 + Math.random() * 10000;

    data.push({
      month,
      assets: Math.round(baseAssets),
      liabilities: Math.round(Math.max(baseLiabilities, 250000)),
      netWorth: Math.round(baseAssets - Math.max(baseLiabilities, 250000)),
    });
  }

  return data;
};

export const mockTrendData = generateTrendData();

// Mock Subscriptions
export const mockSubscriptions = [
  {
    subscriptionId: 'sub_001',
    userId: 'user_001',
    merchantName: 'Netflix',
    amount: 649,
    frequency: 'MONTHLY',
    lastChargedAt: '2025-12-15T00:00:00Z',
    nextChargeAt: '2026-01-15T00:00:00Z',
    detectedAt: '2024-06-01T00:00:00Z',
    isConfirmed: true,
    isActive: true,
    category: 'Entertainment',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    subscriptionId: 'sub_002',
    userId: 'user_001',
    merchantName: 'Spotify Premium',
    amount: 119,
    frequency: 'MONTHLY',
    lastChargedAt: '2025-12-20T00:00:00Z',
    nextChargeAt: '2026-01-20T00:00:00Z',
    detectedAt: '2024-03-15T00:00:00Z',
    isConfirmed: true,
    isActive: true,
    category: 'Entertainment',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    subscriptionId: 'sub_003',
    userId: 'user_001',
    merchantName: 'Amazon Prime',
    amount: 1499,
    frequency: 'YEARLY',
    lastChargedAt: '2025-08-01T00:00:00Z',
    nextChargeAt: '2026-08-01T00:00:00Z',
    detectedAt: '2024-08-01T00:00:00Z',
    isConfirmed: true,
    isActive: true,
    category: 'Shopping',
    createdAt: '2024-08-01T00:00:00Z',
  },
  {
    subscriptionId: 'sub_004',
    userId: 'user_001',
    merchantName: 'YouTube Premium',
    amount: 129,
    frequency: 'MONTHLY',
    lastChargedAt: '2025-12-05T00:00:00Z',
    nextChargeAt: '2026-01-05T00:00:00Z',
    detectedAt: '2024-05-10T00:00:00Z',
    isConfirmed: true,
    isActive: true,
    category: 'Entertainment',
    createdAt: '2024-05-10T00:00:00Z',
  },
  {
    subscriptionId: 'sub_005',
    userId: 'user_001',
    merchantName: 'ChatGPT',
    amount: 1680,
    frequency: 'MONTHLY',
    lastChargedAt: '2025-12-10T00:00:00Z',
    nextChargeAt: '2026-01-10T00:00:00Z',
    detectedAt: '2024-09-01T00:00:00Z',
    isConfirmed: true,
    isActive: true,
    category: 'Productivity',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// Mock Recurring Payments
export const mockRecurringPayments = [
  {
    id: 'rp_001',
    name: 'House Rent',
    amount: 25000,
    dueDate: '2026-01-01T00:00:00Z',
    logoColor: '#3B82F6',
  },
  {
    id: 'rp_002',
    name: 'Electricity Bill',
    amount: 2500,
    dueDate: '2026-01-25T00:00:00Z',
    logoColor: '#F59E0B',
  },
  {
    id: 'rp_003',
    name: 'Internet',
    amount: 999,
    dueDate: '2026-01-28T00:00:00Z',
    logoColor: '#10B981',
  },
  {
    id: 'rp_004',
    name: 'Mobile Recharge',
    amount: 599,
    dueDate: '2026-01-15T00:00:00Z',
    logoColor: '#EF4444',
  },
  {
    id: 'rp_005',
    name: 'Car EMI',
    amount: 15000,
    dueDate: '2026-01-05T00:00:00Z',
    logoColor: '#6366F1',
  },
];

// Mock Spending Categories
export const mockSpendingCategories = [
  {
    categoryId: 'cat_001',
    category: 'Grocery & Toiletries',
    amount: 12500,
    count: 15,
    percentage: 25,
  },
  {
    categoryId: 'cat_002',
    category: 'Dining, Movies, Sports',
    amount: 8500,
    count: 12,
    percentage: 17,
  },
  {
    categoryId: 'cat_003',
    category: 'Shopping, Gifts',
    amount: 15000,
    count: 8,
    percentage: 30,
  },
  {
    categoryId: 'cat_004',
    category: 'Travel, Annual holidays',
    amount: 7500,
    count: 5,
    percentage: 15,
  },
  {
    categoryId: 'cat_005',
    category: 'Utilities',
    amount: 6500,
    count: 10,
    percentage: 13,
  },
];

// Mock Monthly Summary
export const mockMonthlySummary = {
  totalIncome: 150000,
  totalExpenses: 50000,
  netSavings: 100000,
  byCategory: mockSpendingCategories,
};

// Mock Financial Wellness Data
export const getMockFinancialWellnessData = () => {
  return {
    // Cash Flow Data
    cashFlow: {
      incomeSources: [
        { id: 'inc_001', name: 'Salary', amount: 150000, type: 'fixed', frequency: 'monthly' },
        { id: 'inc_002', name: 'Freelance', amount: 25000, type: 'variable', frequency: 'monthly' },
      ],
      totalMonthlyIncome: 175000,
      fixedExpenses: [
        { id: 'fix_001', category: 'Rent', amount: 35000 },
        { id: 'fix_002', category: 'EMI', amount: 15000 },
        { id: 'fix_003', category: 'Insurance', amount: 5000 },
      ],
      variableExpenses: [
        { id: 'var_001', category: 'Groceries', amount: 12000 },
        { id: 'var_002', category: 'Utilities', amount: 4000 },
        { id: 'var_003', category: 'Transport', amount: 6000 },
      ],
      discretionaryExpenses: [
        { id: 'disc_001', category: 'Dining Out', amount: 8000 },
        { id: 'disc_002', category: 'Shopping', amount: 12000 },
        { id: 'disc_003', category: 'Entertainment', amount: 5000 },
      ],
      currentMonthSummary: {
        totalIncome: 175000,
        totalExpenses: 102000,
        fixedExpenses: 55000,
        variableExpenses: 22000,
        discretionaryExpenses: 25000,
        monthlySavings: 73000,
        savingsRate: 41.7,
        fixedPercent: 31.4,
        variablePercent: 12.6,
        discretionaryPercent: 14.3,
      },
      previousMonthSummary: {
        totalIncome: 165000,
        totalExpenses: 95000,
        monthlySavings: 70000,
        savingsRate: 42.4,
      },
      comparison: {
        incomeChange: 10000,
        incomeChangePercent: 6.1,
        expenseChange: 7000,
        expenseChangePercent: 7.4,
      },
      explanations: [
        {
          type: 'positive',
          message: 'Income increased by ₹10,000 due to freelance project completion',
          amount: 10000,
        },
        {
          type: 'negative',
          message: 'Shopping expenses increased by ₹4,000 (festive season)',
          amount: 4000,
        },
        {
          type: 'neutral',
          message: 'Fixed expenses remained stable - good consistency!',
        },
      ],
    },

    // Emergency Fund Data
    emergencyFund: {
      currentAmount: 420000,
      monthlyEssentialExpenses: 77000,
      essentialExpenseBreakdown: {
        rent: 35000,
        utilities: 4000,
        groceries: 12000,
        insurance: 5000,
        emis: 15000,
        medical: 2000,
        transport: 4000,
        other: 0,
      },
      monthlyContribution: 20000,
    },

    // Goals Data
    goals: {
      goals: [
        {
          id: 'goal_001',
          name: 'Emergency Fund',
          targetAmount: 500000,
          currentAmount: 420000,
          targetDate: '2025-06-30',
          monthlyContribution: 20000,
          category: 'SAFETY',
          priority: 1,
        },
        {
          id: 'goal_002',
          name: 'Car Down Payment',
          targetAmount: 500000,
          currentAmount: 180000,
          targetDate: '2026-12-31',
          monthlyContribution: 15000,
          category: 'LIFESTYLE',
          priority: 2,
        },
        {
          id: 'goal_003',
          name: 'Vacation Fund',
          targetAmount: 150000,
          currentAmount: 45000,
          targetDate: '2025-12-31',
          monthlyContribution: 10000,
          category: 'LIFESTYLE',
          priority: 3,
        },
        {
          id: 'goal_004',
          name: 'Home Down Payment',
          targetAmount: 3000000,
          currentAmount: 850000,
          targetDate: '2028-12-31',
          monthlyContribution: 35000,
          category: 'ESSENTIAL',
          priority: 1,
        },
      ],
      leakages: [
        {
          goalId: 'goal_002',
          goalName: 'Car Down Payment',
          amount: 5000,
          description: 'Missed contribution in December due to holiday spending',
          month: 'December 2025',
          suggestion: 'Automate this contribution via SIP to avoid missing it',
        },
      ],
    },

    // Health Score Data - matches healthScoreSlice expected format
    healthScore: {
      savingsData: {
        monthsWithSavings: 10,
        totalMonths: 12,
        averageSavingsRate: 38,
        missedMonths: ['2025-08', '2025-11'],
      },
      expenseData: {
        budgetAdherence: 85, // % of months within budget
        discretionaryRatio: 25, // % of income spent on discretionary
        overspendingMonths: 2,
      },
      withdrawalData: {
        emergencyFundWithdrawals: 1,
        investmentWithdrawals: 0,
        fdBreaks: 0,
        reasonableWithdrawals: 2,
      },
      planningData: {
        hasEmergencyFund: true,
        hasTermInsurance: true,
        hasHealthInsurance: true,
        hasWill: false,
        nomineesUpdated: true,
        hasFinancialGoals: true,
        goalCount: 4,
      },
      debtData: {
        debtToIncomeRatio: 0.14, // Total debt / Annual income (295000 / 2100000)
        emiToIncomeRatio: 8.6, // Monthly EMIs / Monthly income (15000 / 175000 * 100)
        hasHighInterestDebt: false,
        onTimePayments: 100,
      },
      previousScore: 70,
    },

    // Lifestyle Inflation Data
    lifestyleInflation: {
      monthlyData: [
        { month: '2025-07', income: 155000, discretionarySpending: 18000, savingsRate: 40 },
        { month: '2025-08', income: 158000, discretionarySpending: 19000, savingsRate: 39 },
        { month: '2025-09', income: 160000, discretionarySpending: 20000, savingsRate: 38 },
        { month: '2025-10', income: 170000, discretionarySpending: 22000, savingsRate: 39 },
        { month: '2025-11', income: 172000, discretionarySpending: 24000, savingsRate: 38 },
        { month: '2025-12', income: 175000, discretionarySpending: 25000, savingsRate: 41 },
      ],
      categories: [
        {
          name: 'Dining Out',
          monthlyData: [5000, 5500, 6000, 7000, 7500, 8000],
        },
        {
          name: 'Shopping',
          monthlyData: [8000, 8500, 9000, 10000, 11000, 12000],
        },
        {
          name: 'Entertainment',
          monthlyData: [3000, 3200, 3500, 4000, 4500, 5000],
        },
      ],
    },

    // Risk Guardrails Data
    riskGuardrails: {
      monthlyIncome: 175000,
      totalDebt: 295000,
      monthlyEMIs: 15000,
      liquidAssets: 610000,
      monthlyExpenses: 102000,
      termInsuranceCover: 15000000,
      healthInsuranceCover: 1000000,
      assets: [
        { name: 'HDFC Savings', balance: 485000, type: 'savings' },
        { name: 'ICICI Savings', balance: 125000, type: 'savings' },
        { name: 'SBI FD', balance: 500000, type: 'fd' },
        { name: 'Mutual Funds', balance: 350000, type: 'mutual_fund' },
      ],
      dependents: 2,
      hasEmergencyFund: true,
    },

    // Life Events Data
    lifeEvents: {
      events: [
        {
          id: 'event_001',
          type: 'HOME_PURCHASE',
          targetYear: 2028,
          variant: 'tier1_2bhk',
          currentSavings: 850000,
        },
        {
          id: 'event_002',
          type: 'CHILD_EDUCATION',
          targetYear: 2035,
          variant: 'college_engineering',
          currentSavings: 100000,
        },
        {
          id: 'event_003',
          type: 'RETIREMENT',
          targetYear: 2050,
          monthlyExpense: 80000,
          currentSavings: 500000,
        },
      ],
      currentSavings: 500000,
    },

    // Hygiene Checks Data
    hygiene: {
      checks: {
        nominees: {
          bankAccountsWithNominee: 1,
          bankAccountsTotal: 2,
          fdWithNominee: 1,
          fdTotal: 1,
          dematWithNominee: 1,
          dematTotal: 1,
          mutualFundsWithNominee: 1,
          mutualFundsTotal: 1,
          insuranceWithNominee: 2,
          insuranceTotal: 2,
          ppfWithNominee: false,
          epfWithNominee: true,
          npsWithNominee: false,
        },
        insurance: {
          hasTermInsurance: true,
          termCoverAmount: 15000000,
          recommendedTermCover: 21000000,
          hasHealthInsurance: true,
          healthCoverAmount: 1000000,
          recommendedHealthCover: 1500000,
          hasCriticalIllnessCover: false,
          hasPersonalAccidentCover: true,
          dependentsCovered: 2,
          totalDependents: 2,
        },
        documents: {
          willCreated: false,
          willUpdated: false,
          panLinkedWithAadhaar: true,
          kycUpdated: true,
          addressProofCurrent: true,
          jointAccountDetailsDocumented: false,
          digitalAssetListMaintained: false,
          passwordManagerUsed: true,
        },
        accounts: {
          dormantAccounts: 1,
          unusedCreditCards: 2,
          multipleCurrentAccounts: false,
          oldUnclosedLoans: 0,
          unlinkedUpiIds: 0,
        },
        structural: {
          singleIncomeHousehold: false,
          noEmergencyFund: false,
          highConcentrationInSingleAsset: false,
          allSavingsInOneBank: false,
          noRetirementContributions: false,
          dependentsWithoutInsurance: false,
        },
      },
      assets: { total: 1460000 },
      insurance: { termCover: 15000000, healthCover: 1000000 },
      dependents: 2,
      income: 175000 * 12,
    },

    // Reality Report Data
    report: {
      netWorth: 1165000,
      assets: {
        bankAccounts: 610000,
        fixedDeposits: 500000,
        liquidFunds: 0,
        cash: 0,
        termInsuranceCover: 15000000,
      },
      liabilities: {
        total: 295000,
        homeLoanEMI: 0,
        carLoanEMI: 15000,
        personalLoanEMI: 0,
        creditCardEMI: 0,
      },
      cashFlow: {
        totalMonthlyIncome: 175000,
        totalMonthlyExpenses: 102000,
        savingsRate: 41.7,
      },
      emergencyFund: {
        survivalMonths: 5.5,
      },
      healthScore: {
        overallScore: 72,
        components: {
          consistency: { score: 85 },
          expenseDiscipline: { score: 78 },
          withdrawalBehavior: { score: 90 },
          planningHygiene: { score: 60 },
          debtHealth: { score: 85 },
        },
      },
      hygieneIssues: [],
      goals: [],
      riskAlerts: [],
      lifestyleInflation: {
        severity: 'MILD_CREEP',
        summary: 'Spending growing slightly faster in dining category',
      },
      previousMonth: {
        netWorth: 1120000,
        expenses: 95000,
        savingsRate: 42.4,
        healthScore: 70,
      },
    },
  };
};

// Helper function to get all mock data
export const getMockData = () => {
  const totalAssets = mockAssetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = mockLiabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const currentTrend = mockTrendData[mockTrendData.length - 1];
  const previousTrend = mockTrendData[mockTrendData.length - 2];

  const changeAmount = currentTrend.netWorth - previousTrend.netWorth;
  const changePercentage = (changeAmount / previousTrend.netWorth) * 100;

  return {
    networth: {
      totalNetWorth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      assetAccounts: mockAssetAccounts,
      liabilityAccounts: mockLiabilityAccounts,
      trendData: mockTrendData,
      changeAmount,
      changePercentage,
    },
    subscriptions: {
      active: mockSubscriptions.filter((s) => s.isActive),
      detected: [],
      inactive: mockSubscriptions.filter((s) => !s.isActive),
    },
    recurringPayments: mockRecurringPayments,
    spending: {
      categories: mockSpendingCategories,
      totalSpent: mockSpendingCategories.reduce((sum, c) => sum + c.amount, 0),
      untaggedPercentage: 8,
    },
    monthlySummary: mockMonthlySummary,
  };
};

export default getMockData;
