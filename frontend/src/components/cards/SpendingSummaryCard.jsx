import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { CircularSpendingChart } from '../charts';
import { formatCurrency, formatPercentage, getCurrentMonthName } from '../../utils/formatters';
import { CHART_COLORS, EXPENSE_CATEGORIES } from '../../utils/constants';

const SpendingSummaryCard = ({
  categories = [],
  totalSpent = 0,
  untaggedPercentage = 0,
  onCategoryClick,
  onUntaggedClick,
}) => {
  const { t } = useTranslation();
  const monthName = getCurrentMonthName();

  // Get icon component name based on category
  const getCategoryIcon = (categoryName) => {
    const category = EXPENSE_CATEGORIES.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category?.icon || 'HelpCircle';
  };

  // Sort categories by amount and limit to 5
  const displayCategories = [...categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <Card>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{monthName} Spending</h3>
      </div>

      {/* Chart Container */}
      <div className="flex justify-center mb-6">
        <CircularSpendingChart
          categories={categories}
          totalSpent={totalSpent}
          size={200}
        />
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {displayCategories.map((category, index) => (
          <div key={category.categoryId} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS.spending[index] }}
            />
            <span className="text-xs text-gray-600">{category.category}</span>
          </div>
        ))}
      </div>

      {/* Untagged Alert */}
      {untaggedPercentage > 0 && (
        <button
          onClick={onUntaggedClick}
          className="w-full mb-4 p-3 bg-amber-50 rounded-xl flex items-center gap-3 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{formatPercentage(untaggedPercentage, 0)}</span> of spends are untagged
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </button>
      )}

      {/* Category List */}
      <div className="space-y-3">
        {displayCategories.map((category, index) => (
          <button
            key={category.categoryId}
            onClick={() => onCategoryClick?.(category)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${CHART_COLORS.spending[index]}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.spending[index] }}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{category.category}</p>
                <p className="text-xs text-gray-500">{category.count} transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(category.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {formatPercentage(category.percentage)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* All Spends Link */}
      <button className="w-full mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
        {t('common.seeAll')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </Card>
  );
};

export default SpendingSummaryCard;
