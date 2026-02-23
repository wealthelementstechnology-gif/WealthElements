import { createSlice } from '@reduxjs/toolkit';

// Hygiene check categories
const HYGIENE_CATEGORIES = {
  NOMINEES: 'nominees',
  INSURANCE_COVERAGE: 'insurance_coverage',
  DOCUMENT_STATUS: 'document_status',
  ACCOUNT_HYGIENE: 'account_hygiene',
  STRUCTURAL_ISSUES: 'structural_issues',
};

// Severity levels
const SEVERITY = {
  CRITICAL: 'CRITICAL', // Immediate action needed
  HIGH: 'HIGH', // Should fix within a month
  MEDIUM: 'MEDIUM', // Should address within 3 months
  LOW: 'LOW', // Good to fix when convenient
};

const initialState = {
  // Overall hygiene score (0-100)
  overallScore: 0,
  status: 'POOR', // POOR, FAIR, GOOD, EXCELLENT

  // Issues by category
  issues: [],

  // Category-wise scores
  categoryScores: {
    nominees: { score: 0, maxScore: 25, issues: [] },
    insurance_coverage: { score: 0, maxScore: 25, issues: [] },
    document_status: { score: 0, maxScore: 20, issues: [] },
    account_hygiene: { score: 0, maxScore: 15, issues: [] },
    structural_issues: { score: 0, maxScore: 15, issues: [] },
  },

  // Specific checks
  checks: {
    // Nominee checks
    nominees: {
      bankAccountsWithNominee: 0,
      bankAccountsTotal: 0,
      fdWithNominee: 0,
      fdTotal: 0,
      dematWithNominee: 0,
      dematTotal: 0,
      mutualFundsWithNominee: 0,
      mutualFundsTotal: 0,
      insuranceWithNominee: 0,
      insuranceTotal: 0,
      ppfWithNominee: false,
      epfWithNominee: false,
      npsWithNominee: false,
    },

    // Insurance coverage checks
    insurance: {
      hasTermInsurance: false,
      termCoverAmount: 0,
      recommendedTermCover: 0, // 10-15x annual income
      hasHealthInsurance: false,
      healthCoverAmount: 0,
      recommendedHealthCover: 0, // Based on city and family size
      hasCriticalIllnessCover: false,
      hasPersonalAccidentCover: false,
      dependentsCovered: 0,
      totalDependents: 0,
    },

    // Document status
    documents: {
      willCreated: false,
      willUpdated: false, // Within last 2 years
      panLinkedWithAadhaar: true,
      kycUpdated: true, // All accounts
      addressProofCurrent: true,
      jointAccountDetailsDocumented: false,
      digitalAssetListMaintained: false,
      passwordManagerUsed: false,
    },

    // Account hygiene
    accounts: {
      dormantAccounts: 0, // Accounts with no activity in 1 year
      unusedCreditCards: 0,
      multipleCurrentAccounts: false,
      oldUnclosedLoans: 0,
      unlinkedUpiIds: 0,
    },

    // Structural issues
    structural: {
      singleIncomeHousehold: false,
      noEmergencyFund: false,
      highConcentrationInSingleAsset: false,
      allSavingsInOneBank: false,
      noRetirementContributions: false,
      dependentsWithoutInsurance: false,
    },
  },

  // Prioritized action items
  actionItems: [],

  isLoading: false,
  error: null,
  lastChecked: null,
};

const hygieneSlice = createSlice({
  name: 'hygiene',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setHygieneData: (state, action) => {
      const { checks, assets, insurance, dependents, income } = action.payload;

      // Update checks
      if (checks) {
        state.checks = { ...state.checks, ...checks };
      }

      // Analyze and generate issues
      const analysis = analyzeHygiene(state.checks, assets, insurance, dependents, income);

      state.issues = analysis.issues;
      state.categoryScores = analysis.categoryScores;
      state.overallScore = analysis.overallScore;
      state.status = analysis.status;
      state.actionItems = analysis.actionItems;
      state.lastChecked = new Date().toISOString();

      state.isLoading = false;
      state.error = null;
    },

    updateNomineeStatus: (state, action) => {
      const { type, hasNominee, total } = action.payload;
      if (state.checks.nominees[`${type}WithNominee`] !== undefined) {
        state.checks.nominees[`${type}WithNominee`] = hasNominee;
        if (total !== undefined) {
          state.checks.nominees[`${type}Total`] = total;
        }
      }
    },

    updateInsuranceStatus: (state, action) => {
      state.checks.insurance = { ...state.checks.insurance, ...action.payload };
    },

    updateDocumentStatus: (state, action) => {
      state.checks.documents = { ...state.checks.documents, ...action.payload };
    },

    updateAccountStatus: (state, action) => {
      state.checks.accounts = { ...state.checks.accounts, ...action.payload };
    },

    updateStructuralStatus: (state, action) => {
      state.checks.structural = { ...state.checks.structural, ...action.payload };
    },

    markIssueResolved: (state, action) => {
      const issueId = action.payload;
      state.issues = state.issues.filter((issue) => issue.id !== issueId);
      state.actionItems = state.actionItems.filter((item) => item.issueId !== issueId);
      // Recalculate score
      const totalIssueWeight = state.issues.reduce((sum, i) => sum + getSeverityWeight(i.severity), 0);
      state.overallScore = Math.max(0, 100 - totalIssueWeight);
      state.status = getStatusFromScore(state.overallScore);
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

// Analyze hygiene and generate issues
function analyzeHygiene(checks, assets, insurance, dependents, income) {
  const issues = [];
  const categoryScores = {
    nominees: { score: 25, maxScore: 25, issues: [] },
    insurance_coverage: { score: 25, maxScore: 25, issues: [] },
    document_status: { score: 20, maxScore: 20, issues: [] },
    account_hygiene: { score: 15, maxScore: 15, issues: [] },
    structural_issues: { score: 15, maxScore: 15, issues: [] },
  };

  // Check nominees
  const nomineeIssues = checkNominees(checks.nominees);
  nomineeIssues.forEach((issue) => {
    issues.push(issue);
    categoryScores.nominees.issues.push(issue);
    categoryScores.nominees.score -= getSeverityWeight(issue.severity);
  });

  // Check insurance coverage
  const insuranceIssues = checkInsuranceCoverage(checks.insurance, income, dependents);
  insuranceIssues.forEach((issue) => {
    issues.push(issue);
    categoryScores.insurance_coverage.issues.push(issue);
    categoryScores.insurance_coverage.score -= getSeverityWeight(issue.severity);
  });

  // Check documents
  const documentIssues = checkDocuments(checks.documents);
  documentIssues.forEach((issue) => {
    issues.push(issue);
    categoryScores.document_status.issues.push(issue);
    categoryScores.document_status.score -= getSeverityWeight(issue.severity);
  });

  // Check account hygiene
  const accountIssues = checkAccounts(checks.accounts);
  accountIssues.forEach((issue) => {
    issues.push(issue);
    categoryScores.account_hygiene.issues.push(issue);
    categoryScores.account_hygiene.score -= getSeverityWeight(issue.severity);
  });

  // Check structural issues
  const structuralIssues = checkStructural(checks.structural);
  structuralIssues.forEach((issue) => {
    issues.push(issue);
    categoryScores.structural_issues.issues.push(issue);
    categoryScores.structural_issues.score -= getSeverityWeight(issue.severity);
  });

  // Ensure scores don't go below 0
  Object.keys(categoryScores).forEach((key) => {
    categoryScores[key].score = Math.max(0, categoryScores[key].score);
  });

  // Calculate overall score
  const overallScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0);
  const status = getStatusFromScore(overallScore);

  // Generate prioritized action items
  const actionItems = generateActionItems(issues);

  return { issues, categoryScores, overallScore, status, actionItems };
}

// Check nominee status
function checkNominees(nominees) {
  const issues = [];

  // Bank accounts
  if (nominees.bankAccountsTotal > 0 && nominees.bankAccountsWithNominee < nominees.bankAccountsTotal) {
    const missing = nominees.bankAccountsTotal - nominees.bankAccountsWithNominee;
    issues.push({
      id: 'nominee_bank',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.CRITICAL,
      title: 'Bank accounts missing nominees',
      description: `${missing} of ${nominees.bankAccountsTotal} bank account(s) don't have nominees. Without nominees, funds can be frozen for months during claims.`,
      action: 'Visit your bank branch or use net banking to add nominees to all accounts.',
      impact: 'Delays in fund access for family during emergencies',
    });
  }

  // Fixed Deposits
  if (nominees.fdTotal > 0 && nominees.fdWithNominee < nominees.fdTotal) {
    issues.push({
      id: 'nominee_fd',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.HIGH,
      title: 'Fixed deposits missing nominees',
      description: `${nominees.fdTotal - nominees.fdWithNominee} FD(s) don't have nominees assigned.`,
      action: 'Update nominee details for all FDs through your bank.',
      impact: 'Legal complications during FD maturity claims',
    });
  }

  // Demat accounts
  if (nominees.dematTotal > 0 && nominees.dematWithNominee < nominees.dematTotal) {
    issues.push({
      id: 'nominee_demat',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.HIGH,
      title: 'Demat accounts missing nominees',
      description: 'Stocks and securities without nominees require legal heir certificates for transfer.',
      action: 'Log into your broker platform and update nominee details.',
      impact: 'Lengthy legal process for share transfers',
    });
  }

  // Mutual funds
  if (nominees.mutualFundsTotal > 0 && nominees.mutualFundsWithNominee < nominees.mutualFundsTotal) {
    issues.push({
      id: 'nominee_mf',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.HIGH,
      title: 'Mutual fund folios missing nominees',
      description: 'Some mutual fund investments don\'t have nominees registered.',
      action: 'Update nominees through AMC website or CAMS/Karvy.',
      impact: 'Delays in unit transmission to family',
    });
  }

  // Retirement accounts
  if (!nominees.ppfWithNominee) {
    issues.push({
      id: 'nominee_ppf',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.MEDIUM,
      title: 'PPF account missing nominee',
      description: 'Your PPF account doesn\'t have a nominee registered.',
      action: 'Submit Form E to your PPF branch to add nominee.',
      impact: 'Legal heir will need succession certificate',
    });
  }

  if (!nominees.epfWithNominee) {
    issues.push({
      id: 'nominee_epf',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.HIGH,
      title: 'EPF missing nominee/family declaration',
      description: 'EPF nomination and family declaration forms may not be updated.',
      action: 'Update Form 2 (nomination) on EPFO portal.',
      impact: 'Delays in PF settlement claims',
    });
  }

  if (!nominees.npsWithNominee) {
    issues.push({
      id: 'nominee_nps',
      category: HYGIENE_CATEGORIES.NOMINEES,
      severity: SEVERITY.MEDIUM,
      title: 'NPS account missing nominee',
      description: 'Your NPS account doesn\'t have a nominee registered.',
      action: 'Update nominee through NPS portal or Point of Presence.',
      impact: 'Complex claim process for family',
    });
  }

  return issues;
}

// Check insurance coverage
function checkInsuranceCoverage(insurance, annualIncome = 0, dependents = 0) {
  const issues = [];
  const recommendedTermCover = annualIncome * 12; // 12x annual income
  const recommendedHealthCover = dependents > 0 ? 1000000 + dependents * 500000 : 500000; // Base 10L + 5L per dependent

  // Term insurance
  if (!insurance.hasTermInsurance && dependents > 0) {
    issues.push({
      id: 'insurance_term_missing',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.CRITICAL,
      title: 'No term life insurance',
      description: 'You have dependents but no term insurance. This is the most critical gap in your financial safety net.',
      action: `Get term insurance for at least ₹${(recommendedTermCover / 10000000).toFixed(1)} Cr (12x annual income).`,
      impact: 'Family left without financial support',
    });
  } else if (insurance.hasTermInsurance && insurance.termCoverAmount < recommendedTermCover * 0.8) {
    issues.push({
      id: 'insurance_term_low',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.HIGH,
      title: 'Term insurance cover is insufficient',
      description: `Current cover: ₹${(insurance.termCoverAmount / 10000000).toFixed(1)} Cr. Recommended: ₹${(recommendedTermCover / 10000000).toFixed(1)} Cr (12x income).`,
      action: 'Consider increasing term cover or adding a new policy.',
      impact: 'Inadequate protection for family\'s long-term needs',
    });
  }

  // Health insurance
  if (!insurance.hasHealthInsurance) {
    issues.push({
      id: 'insurance_health_missing',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.CRITICAL,
      title: 'No personal health insurance',
      description: 'Relying only on employer insurance is risky. Job changes or layoffs leave you unprotected.',
      action: `Get a personal health policy for at least ₹${(recommendedHealthCover / 100000).toFixed(0)}L.`,
      impact: 'Medical emergencies can wipe out savings',
    });
  } else if (insurance.healthCoverAmount < recommendedHealthCover) {
    issues.push({
      id: 'insurance_health_low',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.HIGH,
      title: 'Health insurance cover may be insufficient',
      description: `Current cover: ₹${(insurance.healthCoverAmount / 100000).toFixed(0)}L. Medical costs in India are rising 10-15% yearly.`,
      action: 'Consider a super top-up policy to increase coverage cost-effectively.',
      impact: 'Out-of-pocket expenses during hospitalization',
    });
  }

  // Critical illness
  if (!insurance.hasCriticalIllnessCover && annualIncome > 1000000) {
    issues.push({
      id: 'insurance_critical_missing',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.MEDIUM,
      title: 'No critical illness coverage',
      description: 'Critical illness insurance provides lump sum on diagnosis, covering income loss during treatment.',
      action: 'Consider adding critical illness rider or standalone policy.',
      impact: 'Income disruption during serious illness',
    });
  }

  // Dependent coverage
  if (insurance.totalDependents > 0 && insurance.dependentsCovered < insurance.totalDependents) {
    issues.push({
      id: 'insurance_dependent_gap',
      category: HYGIENE_CATEGORIES.INSURANCE_COVERAGE,
      severity: SEVERITY.HIGH,
      title: 'Not all dependents have health coverage',
      description: `${insurance.totalDependents - insurance.dependentsCovered} dependent(s) not covered under health insurance.`,
      action: 'Add dependents to your policy or get them separate coverage.',
      impact: 'Uninsured medical expenses for family',
    });
  }

  return issues;
}

// Check document status
function checkDocuments(documents) {
  const issues = [];

  if (!documents.willCreated) {
    issues.push({
      id: 'doc_will_missing',
      category: HYGIENE_CATEGORIES.DOCUMENT_STATUS,
      severity: SEVERITY.HIGH,
      title: 'No will/estate document',
      description: 'Without a will, asset distribution follows succession laws which may not match your wishes.',
      action: 'Create a will with a lawyer. Online will services start at ₹2,000.',
      impact: 'Family disputes and legal complications',
    });
  } else if (!documents.willUpdated) {
    issues.push({
      id: 'doc_will_outdated',
      category: HYGIENE_CATEGORIES.DOCUMENT_STATUS,
      severity: SEVERITY.MEDIUM,
      title: 'Will may be outdated',
      description: 'Your will hasn\'t been reviewed in over 2 years. Life changes may require updates.',
      action: 'Review and update your will if there have been changes in family or assets.',
      impact: 'Will may not reflect current wishes',
    });
  }

  if (!documents.panLinkedWithAadhaar) {
    issues.push({
      id: 'doc_pan_aadhaar',
      category: HYGIENE_CATEGORIES.DOCUMENT_STATUS,
      severity: SEVERITY.CRITICAL,
      title: 'PAN not linked with Aadhaar',
      description: 'PAN becomes inoperative without Aadhaar linkage, affecting financial transactions.',
      action: 'Link on incometax.gov.in immediately.',
      impact: 'PAN may become inoperative, affecting all financial transactions',
    });
  }

  if (!documents.digitalAssetListMaintained) {
    issues.push({
      id: 'doc_digital_assets',
      category: HYGIENE_CATEGORIES.DOCUMENT_STATUS,
      severity: SEVERITY.MEDIUM,
      title: 'No digital asset documentation',
      description: 'Family won\'t know about online accounts, investments, or how to access them.',
      action: 'Create a secure document listing all accounts with access instructions.',
      impact: 'Digital assets may be lost or inaccessible',
    });
  }

  if (!documents.passwordManagerUsed) {
    issues.push({
      id: 'doc_password_manager',
      category: HYGIENE_CATEGORIES.DOCUMENT_STATUS,
      severity: SEVERITY.LOW,
      title: 'No password manager in use',
      description: 'Managing multiple financial accounts without a password manager increases security risks.',
      action: 'Use a password manager and share emergency access with trusted family.',
      impact: 'Account access issues and security vulnerabilities',
    });
  }

  return issues;
}

// Check account hygiene
function checkAccounts(accounts) {
  const issues = [];

  if (accounts.dormantAccounts > 0) {
    issues.push({
      id: 'account_dormant',
      category: HYGIENE_CATEGORIES.ACCOUNT_HYGIENE,
      severity: SEVERITY.MEDIUM,
      title: `${accounts.dormantAccounts} dormant account(s)`,
      description: 'Inactive accounts incur maintenance charges and complicate financial picture.',
      action: 'Close accounts you don\'t need. Keep one salary + one savings account.',
      impact: 'Unnecessary fees and tracking complexity',
    });
  }

  if (accounts.unusedCreditCards > 1) {
    issues.push({
      id: 'account_credit_cards',
      category: HYGIENE_CATEGORIES.ACCOUNT_HYGIENE,
      severity: SEVERITY.LOW,
      title: `${accounts.unusedCreditCards} unused credit cards`,
      description: 'Unused cards may have annual fees and affect credit utilization ratio.',
      action: 'Close cards you don\'t use, keeping 1-2 with best rewards.',
      impact: 'Annual fees and credit score impact',
    });
  }

  if (accounts.oldUnclosedLoans > 0) {
    issues.push({
      id: 'account_unclosed_loans',
      category: HYGIENE_CATEGORIES.ACCOUNT_HYGIENE,
      severity: SEVERITY.HIGH,
      title: `${accounts.oldUnclosedLoans} loan(s) not formally closed`,
      description: 'Paid loans showing as open affect credit score and future loan approvals.',
      action: 'Get NOC and ensure loan closure reflects in credit report.',
      impact: 'Credit score impact and loan approval issues',
    });
  }

  return issues;
}

// Check structural issues
function checkStructural(structural) {
  const issues = [];

  if (structural.singleIncomeHousehold && structural.dependentsWithoutInsurance) {
    issues.push({
      id: 'structural_single_income',
      category: HYGIENE_CATEGORIES.STRUCTURAL_ISSUES,
      severity: SEVERITY.CRITICAL,
      title: 'Single income with inadequate protection',
      description: 'Family is entirely dependent on one income without sufficient insurance backup.',
      action: 'Prioritize term insurance, build 12-month emergency fund, consider income diversification.',
      impact: 'Total financial disruption if income stops',
    });
  }

  if (structural.noEmergencyFund) {
    issues.push({
      id: 'structural_no_emergency',
      category: HYGIENE_CATEGORIES.STRUCTURAL_ISSUES,
      severity: SEVERITY.HIGH,
      title: 'No emergency fund',
      description: 'Without emergency savings, any unexpected expense forces you into debt.',
      action: 'Build 3-6 months of expenses in liquid savings as first priority.',
      impact: 'Forced to break investments or take loans in emergencies',
    });
  }

  if (structural.highConcentrationInSingleAsset) {
    issues.push({
      id: 'structural_concentration',
      category: HYGIENE_CATEGORIES.STRUCTURAL_ISSUES,
      severity: SEVERITY.MEDIUM,
      title: 'High concentration in single asset',
      description: 'Too much wealth in one investment type (often real estate or employer stock).',
      action: 'Diversify into other asset classes over time.',
      impact: 'Vulnerability to single asset/sector downturns',
    });
  }

  if (structural.allSavingsInOneBank) {
    issues.push({
      id: 'structural_single_bank',
      category: HYGIENE_CATEGORIES.STRUCTURAL_ISSUES,
      severity: SEVERITY.LOW,
      title: 'All savings in one bank',
      description: 'Deposit insurance covers only ₹5L per bank. Consider spreading if balance is higher.',
      action: 'Spread deposits across 2-3 banks if total exceeds ₹5L.',
      impact: 'Risk if bank faces issues (rare but possible)',
    });
  }

  if (structural.noRetirementContributions) {
    issues.push({
      id: 'structural_no_retirement',
      category: HYGIENE_CATEGORIES.STRUCTURAL_ISSUES,
      severity: SEVERITY.HIGH,
      title: 'No active retirement savings',
      description: 'Beyond EPF, you\'re not actively saving for retirement.',
      action: 'Start NPS or equity mutual fund SIP for retirement corpus.',
      impact: 'Inadequate retirement corpus',
    });
  }

  return issues;
}

// Get weight based on severity
function getSeverityWeight(severity) {
  switch (severity) {
    case SEVERITY.CRITICAL:
      return 10;
    case SEVERITY.HIGH:
      return 6;
    case SEVERITY.MEDIUM:
      return 3;
    case SEVERITY.LOW:
      return 1;
    default:
      return 2;
  }
}

// Get status from score
function getStatusFromScore(score) {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  return 'POOR';
}

// Generate prioritized action items
function generateActionItems(issues) {
  // Sort by severity
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return sorted.slice(0, 5).map((issue, index) => ({
    priority: index + 1,
    issueId: issue.id,
    title: issue.title,
    action: issue.action,
    severity: issue.severity,
    category: issue.category,
    timeframe:
      issue.severity === 'CRITICAL'
        ? 'This week'
        : issue.severity === 'HIGH'
          ? 'This month'
          : issue.severity === 'MEDIUM'
            ? 'Within 3 months'
            : 'When convenient',
  }));
}

export const {
  setLoading,
  setHygieneData,
  updateNomineeStatus,
  updateInsuranceStatus,
  updateDocumentStatus,
  updateAccountStatus,
  updateStructuralStatus,
  markIssueResolved,
  setError,
  clearError,
} = hygieneSlice.actions;

export default hygieneSlice.reducer;
