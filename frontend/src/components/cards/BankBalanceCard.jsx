import { useState } from 'react';
import { Eye, EyeOff, TrendingDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';
import { ACCOUNT_TYPES } from '../../utils/constants';

const BankBalanceCard = ({
  totalBalance = 0,
  accounts = [],
  spendingChange,
}) => {
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);

  const formatDisplayBalance = (amount) => {
    if (!showBalance) return '₹ ••••••';
    return formatCurrency(amount);
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('overview.bankBalance')}</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatDisplayBalance(totalBalance)}
          </h3>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showBalance ? (
            <Eye className="w-5 h-5 text-gray-500" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.slice(0, 4).map((account) => {
          const accountTypeInfo = ACCOUNT_TYPES[account.accountType] || {
            label: account.accountType,
          };
          // Support both mock data shape (bankName) and real API shape (institution/accountName)
          const displayName = account.bankName || account.institution || account.accountName || 'Account';
          const displayNumber = account.accountNumber || account.maskedAccountNumber || '';
          const accountKey = account.accountId || account._id || displayName;

          return (
            <div
              key={accountKey}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-lg font-bold text-gray-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {accountTypeInfo.label}{displayNumber ? ` • ${maskAccountNumber(displayNumber)}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatDisplayBalance(account.balance)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spending Insight Banner */}
      {spendingChange && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-emerald-800">
              {t('overview.spendingDown', { n: spendingChange.percentage, days: spendingChange.days })}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600" />
        </div>
      )}
    </Card>
  );
};

export default BankBalanceCard;
