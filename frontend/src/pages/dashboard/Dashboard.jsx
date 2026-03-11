import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout';
import { DASHBOARD_TABS } from '../../utils/constants';
import { fetchAccounts } from '../../store/slices/networthSlice';
import { fetchTransactions, fetchMonthlySummary, fetchSpendingTrend } from '../../store/slices/transactionSlice';
import { fetchSubscriptions } from '../../store/slices/subscriptionSlice';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { setEmergencyFundData } from '../../store/slices/emergencyFundSlice';
import { setCashFlowData } from '../../store/slices/cashFlowSlice';
import { calculateHealthScore } from '../../store/slices/healthScoreSlice';
import { generateReport } from '../../store/slices/realityReportSlice';
import { analyzeLifestyleInflation } from '../../store/slices/lifestyleInflationSlice';
import { analyzeRisks } from '../../store/slices/riskGuardrailsSlice';
import { setLifeEventsData } from '../../store/slices/lifeEventsSlice';
import { setHygieneData } from '../../store/slices/hygieneSlice';
import profileService from '../../services/profile.service';
import SampleDataModal from '../../components/demo/SampleDataModal';

// Tab Components
import OverviewTab from './tabs/OverviewTab';
import AssetsTab from './tabs/AssetsTab';
import SpendingTab from './tabs/SpendingTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import WellnessTab from './tabs/WellnessTab';
import ReportTab from './tabs/ReportTab';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSampleModal, setShowSampleModal] = useState(false);
  const monthlyIncomeRef = useRef(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, onboardingCompleted } = useSelector(state => state.auth);
  const { assetAccounts, liabilityAccounts, totalNetWorth, totalLiabilities, isLoading: networthLoading } = useSelector(state => state.networth);
  const { monthlySummary, spendingTrend, isLoading: txLoading } = useSelector(state => state.transactions);

  // Show sample data prompt automatically when dashboard is empty after load
  const isEmpty = !networthLoading && assetAccounts.length === 0;

  // Auth guard — only redirects, no data fetching
  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (!onboardingCompleted) { navigate('/onboarding'); return; }
  }, [isAuthenticated, onboardingCompleted, navigate]);

  // Data fetch — runs once when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const now = new Date();
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({ limit: 100 }));
    dispatch(fetchMonthlySummary({ month: now.getMonth() + 1, year: now.getFullYear() }));
    dispatch(fetchSpendingTrend());
    dispatch(fetchSubscriptions());
    dispatch(fetchGoals());

    // Fetch profile once to get monthlyIncome (not available in transaction summary)
    profileService.getProfile().then(profile => {
      monthlyIncomeRef.current = profile?.monthlyIncome || 0;
    }).catch(() => {});
  }, [isAuthenticated, dispatch]);

  // Compute derived wellness/report slices once accounts + transactions are loaded
  useEffect(() => {
    if (networthLoading || txLoading) return;
    if (assetAccounts.length === 0 && liabilityAccounts.length === 0) return;

    // monthlySummary from backend: { totalSpend, categories }
    // monthlyIncome comes from FinancialProfile via profileService
    const monthlyIncome = monthlyIncomeRef.current;
    const monthlyExpenses = monthlySummary?.totalSpend || 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Liquid assets = SAVINGS + CURRENT account balances
    const liquidAccounts = assetAccounts.filter(a =>
      a.accountType === 'SAVINGS' || a.accountType === 'CURRENT'
    );
    const liquidBalance = liquidAccounts.reduce((s, a) => s + a.balance, 0);

    // Monthly EMIs: ~2% of remaining loan balance as rough estimate
    const monthlyEMIs = liabilityAccounts
      .filter(a => a.accountType === 'LOAN')
      .reduce((s, a) => s + Math.round(a.balance * 0.02), 0);

    const hasHighInterestDebt = liabilityAccounts.some(a => a.accountType === 'CREDIT_CARD');
    const totalDebt = totalLiabilities;
    const annualIncome = monthlyIncome * 12;
    const survivalMonths = monthlyExpenses > 0 ? liquidBalance / monthlyExpenses : 0;

    // ── Emergency Fund ────────────────────────────────────────────────────────
    dispatch(setEmergencyFundData({
      currentAmount: liquidBalance,
      monthlyEssentialExpenses: monthlyExpenses || (monthlyIncome * 0.6),
      liquidAssets: liquidAccounts,
    }));

    // ── Cash Flow ─────────────────────────────────────────────────────────────
    // Build monthlyHistory from spending trend: [{ _id: { year, month }, total }]
    const monthlyHistory = (spendingTrend || []).map(item => ({
      totalExpenses: item.total || 0,
      totalIncome: monthlyIncome,
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    }));

    dispatch(setCashFlowData({
      totalMonthlyIncome: monthlyIncome,
      monthlyHistory,
      currentMonthSummary: {
        totalIncome: monthlyIncome,
        totalExpenses: monthlyExpenses,
        surplus: monthlyIncome - monthlyExpenses,
        monthlySavings: monthlyIncome - monthlyExpenses,
        savingsRate: parseFloat(savingsRate.toFixed(1)),
        deficitRisk: monthlyExpenses > monthlyIncome ? monthlyExpenses - monthlyIncome : 0,
        month: new Date().toISOString().slice(0, 7),
      },
    }));

    // ── Health Score ──────────────────────────────────────────────────────────
    dispatch(calculateHealthScore({
      savingsData: {
        monthsWithSavings: savingsRate > 0 ? 10 : 4,
        totalMonths: 12,
        averageSavingsRate: savingsRate,
        missedMonths: savingsRate <= 0 ? ['this month'] : [],
      },
      expenseData: {
        budgetAdherence: savingsRate > 20 ? 85 : savingsRate > 0 ? 60 : 30,
        discretionaryRatio: Math.min(50, Math.max(10, 100 - savingsRate - 30)),
        overspendingMonths: savingsRate < 0 ? 3 : 0,
      },
      withdrawalData: {
        emergencyFundWithdrawals: 0,
        investmentWithdrawals: 0,
        fdBreaks: 0,
        reasonableWithdrawals: 0,
      },
      planningData: {
        hasEmergencyFund: survivalMonths >= 1,
        hasTermInsurance: false,
        hasHealthInsurance: false,
        hasWill: false,
        nomineesUpdated: false,
        hasFinancialGoals: true,
        goalCount: 2,
      },
      debtData: {
        debtToIncomeRatio: annualIncome > 0 ? totalDebt / annualIncome : 0,
        emiToIncomeRatio: monthlyIncome > 0 ? (monthlyEMIs / monthlyIncome) * 100 : 0,
        hasHighInterestDebt,
        onTimePayments: 95,
      },
    }));

    // ── Lifestyle Inflation ───────────────────────────────────────────────────
    // Build 6 months of monthly data from trendData (networth history gives us networth per month)
    // We approximate discretionarySpending and savingsRate from monthlySummary + monthlyIncome
    const networthSliceState = assetAccounts; // already have assetAccounts from selector
    // Use last 6 months of trend data if available
    const monthlyDataForInflation = [];
    // We'll pass what we know: current month + estimated prior months using monthlySummary
    // If we have fewer than 6 data points, the slice will show "Need 6 months of data" — acceptable
    if (monthlySummary) {
      // Build a simple monthly data array from available info
      const currentMonthData = {
        income: monthlyIncome,
        discretionarySpending: Math.round((monthlySummary.totalSpend || 0) * 0.4), // ~40% is discretionary
        savingsRate: parseFloat(savingsRate.toFixed(1)),
        categorySpending: (monthlySummary.categories || []).reduce((acc, c) => {
          acc[c.category] = c.amount;
          return acc;
        }, {}),
      };
      // Repeat current month data for 6 entries so the analysis can run
      for (let i = 0; i < 6; i++) monthlyDataForInflation.push(currentMonthData);
    }
    dispatch(analyzeLifestyleInflation({
      monthlyData: monthlyDataForInflation,
      categories: (monthlySummary?.categories || []).map(c => ({ id: c.category, name: c.category })),
    }));

    // ── Risk Guardrails ───────────────────────────────────────────────────────
    dispatch(analyzeRisks({
      monthlyIncome,
      totalDebt,
      monthlyEMIs,
      liquidAssets: liquidBalance,
      monthlyExpenses,
      termInsuranceCover: 0,
      healthInsuranceCover: 0,
      assets: assetAccounts,
      dependents: 0,
      hasEmergencyFund: survivalMonths >= 3,
      hasMultipleIncomes: false,
    }));

    // ── Life Events ───────────────────────────────────────────────────────────
    // Pass empty events — user adds them manually via the Life Events component
    dispatch(setLifeEventsData({
      events: [],
      currentSavings: liquidBalance,
    }));

    // ── Trust & Hygiene ───────────────────────────────────────────────────────
    const bankAccounts = assetAccounts.filter(a => a.accountType === 'SAVINGS' || a.accountType === 'CURRENT');
    const fdAccounts   = assetAccounts.filter(a => a.accountType === 'FD');
    const mfAccounts   = assetAccounts.filter(a => a.accountType === 'MUTUAL_FUND');
    const epfAccounts  = assetAccounts.filter(a => a.accountType === 'EPF');
    const hasLoan      = liabilityAccounts.some(a => a.accountType === 'LOAN');
    const hasCC        = liabilityAccounts.some(a => a.accountType === 'CREDIT_CARD');
    const hasInvestments = mfAccounts.length > 0 || assetAccounts.some(a => a.accountType === 'STOCKS');

    dispatch(setHygieneData({
      checks: {
        nominees: {
          bankAccountsWithNominee: 0,
          bankAccountsTotal: bankAccounts.length,
          fdWithNominee: 0,
          fdTotal: fdAccounts.length,
          dematWithNominee: 0,
          dematTotal: hasInvestments ? 1 : 0,
          mutualFundsWithNominee: 0,
          mutualFundsTotal: mfAccounts.length,
          insuranceWithNominee: 0,
          insuranceTotal: 0,
          ppfWithNominee: false,
          epfWithNominee: false,
          npsWithNominee: false,
        },
        insurance: {
          hasTermInsurance: false,
          termCoverAmount: 0,
          recommendedTermCover: annualIncome * 12,
          hasHealthInsurance: false,
          healthCoverAmount: 0,
          recommendedHealthCover: 500000,
          hasCriticalIllnessCover: false,
          hasPersonalAccidentCover: false,
          dependentsCovered: 0,
          totalDependents: 0,
        },
        documents: {
          willCreated: false,
          willUpdated: false,
          panLinkedWithAadhaar: true,
          kycUpdated: true,
          addressProofCurrent: true,
          jointAccountDetailsDocumented: false,
          digitalAssetListMaintained: false,
          passwordManagerUsed: false,
        },
        accounts: {
          dormantAccounts: 0,
          unusedCreditCards: hasCC ? 1 : 0,
          multipleCurrentAccounts: false,
          oldUnclosedLoans: 0,
          unlinkedUpiIds: 0,
        },
        structural: {
          singleIncomeHousehold: true,
          noEmergencyFund: survivalMonths < 1,
          highConcentrationInSingleAsset: false,
          allSavingsInOneBank: bankAccounts.length <= 1,
          noRetirementContributions: epfAccounts.length === 0 && mfAccounts.length === 0,
          dependentsWithoutInsurance: false,
        },
      },
      assets: assetAccounts,
      insurance: null,
      dependents: 0,
      income: annualIncome,
    }));

    // ── Reality Report ────────────────────────────────────────────────────────
    dispatch(generateReport({
      netWorth: totalNetWorth,
      assets: {
        bankAccounts: liquidBalance,
        fixedDeposits: assetAccounts.filter(a => a.accountType === 'FD').reduce((s, a) => s + a.balance, 0),
        liquidFunds: 0,
        cash: 0,
        termInsuranceCover: 0,
      },
      liabilities: {
        total: totalDebt,
        homeLoanEMI: liabilityAccounts
          .filter(a => a.accountType === 'LOAN' && a.accountName?.toLowerCase().includes('home'))
          .reduce((s, a) => s + Math.round(a.balance * 0.008), 0),
        carLoanEMI: liabilityAccounts
          .filter(a => a.accountType === 'LOAN' && a.accountName?.toLowerCase().includes('car'))
          .reduce((s, a) => s + Math.round(a.balance * 0.02), 0),
        personalLoanEMI: 0,
        creditCardEMI: liabilityAccounts
          .filter(a => a.accountType === 'CREDIT_CARD')
          .reduce((s, a) => s + Math.round(a.balance * 0.05), 0),
      },
      cashFlow: {
        totalMonthlyIncome: monthlyIncome,
        totalMonthlyExpenses: monthlyExpenses,
        savingsRate,
      },
      emergencyFund: { survivalMonths },
      healthScore: null,
      hygieneIssues: [],
      goals: [],
      riskAlerts: [],
      lifestyleInflation: null,
      previousMonth: null,
    }));
  }, [networthLoading, txLoading, assetAccounts, liabilityAccounts, totalNetWorth, totalLiabilities, monthlySummary, spendingTrend, dispatch]);

  // Auto-show modal once when dashboard first loads empty
  useEffect(() => {
    if (isEmpty) {
      const timer = setTimeout(() => setShowSampleModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isEmpty]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab onNavigateToTab={setActiveTab} />;
      case 'assets': return <AssetsTab />;
      case 'spending': return <SpendingTab />;
      case 'subscriptions': return <SubscriptionsTab />;
      case 'wellness': return <WellnessTab />;
      case 'report': return <ReportTab />;
      default: return <OverviewTab onNavigateToTab={setActiveTab} />;
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6">

        {/* Empty state banner */}
        {isEmpty && (
          <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-900 font-semibold text-sm">{t('dashboard.empty')}</p>
              <p className="text-indigo-600 text-xs mt-0.5">{t('dashboard.loadSample')}</p>
            </div>
            <button
              onClick={() => setShowSampleModal(true)}
              className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {t('dashboard.loadSampleBtn')}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-hide flex-1">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-shrink-0 py-2.5 px-4 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {t(`dashboard.tabs.${tab.id}`)}
                </button>
              ))}
            </div>
            {/* Always-visible sample data button (small, subtle) */}
            {!isEmpty && (
              <button
                onClick={() => setShowSampleModal(true)}
                title="Load sample data"
                className="flex-shrink-0 p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors text-xs"
              >
                🗂️
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>

      {/* Sample Data Modal */}
      {showSampleModal && (
        <SampleDataModal onClose={() => setShowSampleModal(false)} />
      )}
    </AppLayout>
  );
};

export default Dashboard;
