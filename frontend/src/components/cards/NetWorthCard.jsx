import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { NetWorthBarLineChart } from '../charts';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

const NetWorthCard = ({
  currentNetWorth = 0,
  changeAmount = 0,
  changePercentage = 0,
  totalAssets = 0,
  totalLiabilities = 0,
  trendData = [],
}) => {
  const { t } = useTranslation();
  const isPositiveChange = changeAmount >= 0;

  return (
    <Card className="overflow-hidden">
      {/* Header Section */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">{t('overview.netWorth')}</p>
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-gray-900">
            {formatCurrency(currentNetWorth)}
          </h2>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
              ${isPositiveChange
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
              }
            `}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositiveChange ? '+' : ''}
              {changePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Assets & Liabilities Pills */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-sm text-gray-600">{t('assets.assets')}</span>
          <span className="text-sm font-semibold text-emerald-700">
            {formatCompactCurrency(totalAssets)}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm text-gray-600">{t('assets.liabilities')}</span>
          <span className="text-sm font-semibold text-red-700">
            {formatCompactCurrency(totalLiabilities)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <NetWorthBarLineChart trendData={trendData} height={180} />

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        <div className="w-2 h-2 bg-gray-900 rounded-full" />
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
      </div>
    </Card>
  );
};

export default NetWorthCard;
