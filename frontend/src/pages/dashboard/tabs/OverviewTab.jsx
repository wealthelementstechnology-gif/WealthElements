import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import {
  NetWorthCard,
  BankBalanceCard,
  RecurringPaymentSection,
  QuickStatsRow,
} from '../../../components/cards';
import SubscriptionTreemap from '../../../components/cards/SubscriptionTreemap';
import { getMockData } from '../../../services/mockData';

const OverviewTab = ({ onNavigateToTab }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanding, setExpanding] = useState(false);
  const barRef = useRef(null);
  const { totalNetWorth, totalAssets, totalLiabilities, assetAccounts, trendData } =
    useSelector((state) => state.networth);
  const { activeSubscriptions, recurringPayments } = useSelector(
    (state) => state.subscriptions
  );
  const { monthlySummary } = useSelector((state) => state.transactions);

  const mockData = getMockData();

  // Calculate change from trend data
  const currentTrend = trendData[trendData.length - 1];
  const previousTrend = trendData[trendData.length - 2];
  const changeAmount = currentTrend
    ? currentTrend.netWorth - (previousTrend?.netWorth || 0)
    : 0;
  const changePercentage = previousTrend
    ? (changeAmount / previousTrend.netWorth) * 100
    : 0;

  // Bank accounts (only savings/current for bank balance card)
  const bankAccounts = assetAccounts.filter(
    (acc) => acc.accountType === 'SAVINGS' || acc.accountType === 'CURRENT'
  );
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Quick stats
  const quickStats = [
    {
      type: 'assets',
      value: totalAssets,
      label: t('overview.totalAssets'),
      trend: 5.2,
    },
    {
      type: 'spending',
      value: mockData.spending.totalSpent,
      label: t('overview.thisMonth'),
    },
  ];

  const handleStatClick = (type) => {
    if (type === 'assets') {
      onNavigateToTab('assets');
    } else if (type === 'spending') {
      onNavigateToTab('spending');
    }
  };

  const handleAIClick = () => {
    if (expanding) return;
    setExpanding(true);
    // Navigate after the expand animation completes (400ms)
    setTimeout(() => navigate('/ai-chat'), 380);
  };

  return (
    <div className="space-y-6">

      {/* Full-screen morph overlay */}
      {expanding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ animation: 'aiExpand 0.4s cubic-bezier(0.4,0,0.2,1) forwards' }}
        >
          <style>{`
            @keyframes aiExpand {
              0%   { background: transparent; }
              100% { background: #4f46e5; }
            }
          `}</style>
          <div
            style={{
              animation: 'aiIconPop 0.35s cubic-bezier(0.4,0,0.2,1) 0.05s forwards',
              opacity: 0,
            }}
          >
            <style>{`
              @keyframes aiIconPop {
                0%   { opacity: 0; transform: scale(0.5); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
      )}

      {/* AI Prompt Bar */}
      <button
        ref={barRef}
        onClick={handleAIClick}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group text-left"
        style={expanding ? { opacity: 0, transition: 'opacity 0.15s' } : {}}
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-700 transition-colors">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <p className="flex-1 text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
          Ask WealthElements AI anything about your money...
        </p>
        <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
          <span className="text-indigo-500 text-xs font-bold">→</span>
        </div>
      </button>

      {/* Net Worth Card */}
      <NetWorthCard
        currentNetWorth={totalNetWorth}
        changeAmount={changeAmount}
        changePercentage={changePercentage}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        trendData={trendData}
      />

      {/* Quick Stats */}
      <QuickStatsRow stats={quickStats} onStatClick={handleStatClick} />

      {/* Bank Balance */}
      <BankBalanceCard
        totalBalance={totalBankBalance}
        accounts={bankAccounts}
        spendingChange={{ percentage: 12, days: 7 }}
      />

      {/* Recurring Payments */}
      <RecurringPaymentSection payments={recurringPayments} />

      {/* Subscriptions Preview */}
      {activeSubscriptions.length > 0 && (
        <div>
          <p className="text-base font-semibold text-gray-900 mb-3">
            {t('overview.activeSubscriptions')}
          </p>
          <SubscriptionTreemap
            subscriptions={activeSubscriptions}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
