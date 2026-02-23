import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { formatCurrency, formatCompactCurrency, maskAccountNumber } from '../../utils/formatters';
import { ACCOUNT_TYPES } from '../../utils/constants';

const AccountItem = ({ account, type = 'asset' }) => {
  const accountTypeInfo = ACCOUNT_TYPES[account.accountType] || {
    label: account.accountType,
  };
  const isAsset = type === 'asset';
  // Support both mock data shape (bankName) and real API shape (institution/accountName)
  const displayName = account.bankName || account.institution || account.accountName || 'Account';
  const displayNumber = account.accountNumber || account.maskedAccountNumber || '';

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isAsset ? 'bg-emerald-100' : 'bg-red-100'
          }`}
        >
          <span className={`text-lg font-bold ${isAsset ? 'text-emerald-600' : 'text-red-600'}`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">
            {accountTypeInfo.label}{displayNumber ? ` • ${maskAccountNumber(displayNumber)}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isAsset ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(account.balance)}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export const AssetsSummaryCard = ({ accounts = [], totalAssets = 0 }) => {
  const { t } = useTranslation();
  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('assets.totalAssets')}</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{accounts.length} {t('onboarding.accounts.asset')}</span>
      </div>

      {/* Account List */}
      <div className="space-y-1">
        {accounts.map((account) => (
          <AccountItem key={account.accountId || account._id || account.accountName} account={account} type="asset" />
        ))}
      </div>

      {/* Add Account */}
      <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
        + {t('onboarding.accounts.addAccountCta').replace('+ ', '')}
      </button>
    </Card>
  );
};

export const LiabilitiesSummaryCard = ({ accounts = [], totalLiabilities = 0 }) => {
  const { t } = useTranslation();
  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('assets.totalLiabilities')}</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{accounts.length} {t('onboarding.accounts.asset')}</span>
      </div>

      {/* Account List */}
      <div className="space-y-1">
        {accounts.map((account) => (
          <AccountItem key={account.accountId || account._id || account.accountName} account={account} type="liability" />
        ))}
      </div>

      {/* Add Account */}
      <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors">
        + {t('onboarding.accounts.addAccountCta').replace('+ ', '')}
      </button>
    </Card>
  );
};

export const NetWorthSummaryCard = ({ totalAssets = 0, totalLiabilities = 0 }) => {
  const { t } = useTranslation();
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
      <p className="text-sm text-gray-400 mb-1">{t('overview.netWorth')}</p>
      <p className="text-3xl font-bold mb-4">{formatCurrency(netWorth)}</p>

      <div className="flex gap-4">
        <div className="flex-1 p-3 bg-white/10 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">{t('assets.assets')}</p>
          <p className="text-lg font-semibold text-emerald-400">
            {formatCompactCurrency(totalAssets)}
          </p>
        </div>
        <div className="flex-1 p-3 bg-white/10 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">{t('assets.liabilities')}</p>
          <p className="text-lg font-semibold text-red-400">
            {formatCompactCurrency(totalLiabilities)}
          </p>
        </div>
      </div>
    </div>
  );
};
