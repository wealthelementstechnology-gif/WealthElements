import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Bell, Eye, EyeOff, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ACCOUNT_TYPE_STYLE = {
  MUTUAL_FUND: { icon: TrendingUp, iconBg: 'bg-blue-100',    iconColor: 'text-blue-600' },
  STOCKS:      { icon: TrendingUp, iconBg: 'bg-purple-100',  iconColor: 'text-purple-600' },
  EPF:         { icon: Activity,   iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  FD:          { icon: Activity,   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600' },
  REAL_ESTATE: { icon: Activity,   iconBg: 'bg-rose-100',    iconColor: 'text-rose-600' },
};

const INVESTMENT_TYPES = new Set(['MUTUAL_FUND', 'STOCKS', 'EPF', 'FD', 'REAL_ESTATE']);

const INVESTMENT_KEYWORDS = ['sip', 'groww', 'zerodha', 'mutual fund', 'nifty', 'brokerage', 'stock', 'epf', 'nps'];

const DashboardTab = () => {
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);

  const profile = useSelector((state) => state.auth.profile);
  const userName = profile?.name?.split(' ')[0] || 'there';

  const { assetAccounts } = useSelector((state) => state.networth);
  const { transactions } = useSelector((state) => state.transactions);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const investmentAccounts = useMemo(
    () => assetAccounts.filter((a) => INVESTMENT_TYPES.has(a.accountType)),
    [assetAccounts]
  );

  const portfolioTotal = useMemo(
    () => investmentAccounts.reduce((s, a) => s + a.balance, 0),
    [investmentAccounts]
  );

  const totalAssetValue = useMemo(
    () => assetAccounts.reduce((s, a) => s + a.balance, 0),
    [assetAccounts]
  );

  const investmentOverview = useMemo(() => {
    const grouped = {};
    investmentAccounts.forEach((a) => {
      if (!grouped[a.accountType]) grouped[a.accountType] = 0;
      grouped[a.accountType] += a.balance;
    });
    return Object.entries(grouped).map(([type, value]) => ({
      id: type,
      name: t(`mutualFunds.dashboard.accountTypes.${type}`, { defaultValue: type }),
      ...(ACCOUNT_TYPE_STYLE[type] || { icon: Activity, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' }),
      currentValue: value,
    }));
  }, [investmentAccounts, t]);

  const recentTxns = useMemo(() => {
    return (transactions || [])
      .filter((tx) =>
        tx.category === 'Investment' ||
        INVESTMENT_KEYWORDS.some((kw) => tx.description?.toLowerCase().includes(kw))
      )
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mutualFunds.dashboard.greeting', { name: userName })}</h1>
          <p className="text-gray-500 text-sm">{today}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Portfolio Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm">{t('mutualFunds.dashboard.portfolioValue')}</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-white/70" />
              ) : (
                <EyeOff className="w-4 h-4 text-white/70" />
              )}
            </button>
          </div>
          {portfolioTotal > 0 && (
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-medium">{t('mutualFunds.dashboard.invested')}</span>
            </div>
          )}
        </div>

        <div className="mb-1">
          <span className="text-4xl font-bold">
            {showBalance ? formatCurrency(portfolioTotal) : '₹••••••'}
          </span>
        </div>
        <p className="text-white/50 text-xs mb-6">
          {t('mutualFunds.dashboard.investmentAccounts', { n: investmentAccounts.length, count: investmentAccounts.length })}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">{t('mutualFunds.dashboard.totalAssets')}</p>
            <p className="text-lg font-semibold">
              {showBalance ? formatCurrency(totalAssetValue) : '₹••••••'}
            </p>
          </div>
          <button className="bg-white text-indigo-900 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors">
            {t('mutualFunds.dashboard.viewAnalysis')}
          </button>
        </div>
      </div>

      {/* Investment Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('mutualFunds.dashboard.investmentOverview')}</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
            {t('mutualFunds.dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {investmentOverview.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {investmentOverview.map((inv) => {
              const Icon = inv.icon;
              return (
                <div
                  key={inv.id}
                  className="min-w-[160px] bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex-shrink-0"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 ${inv.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${inv.iconColor}`} />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{inv.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t('mutualFunds.dashboard.currentValue')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(inv.currentValue)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">{t('mutualFunds.dashboard.noInvestmentAccounts')}</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.dashboard.recentTransactions')}</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {recentTxns.length > 0 ? recentTxns.map((txn) => (
            <div key={txn._id || txn.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {txn.cleanDescription || txn.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(txn.date)} · {txn.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                </p>
              </div>
            </div>
          )) : (
            <div className="p-6 text-center text-sm text-gray-400">
              {t('mutualFunds.dashboard.noTransactions')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
