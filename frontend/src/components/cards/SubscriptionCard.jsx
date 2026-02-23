import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SUBSCRIPTION_BRANDS } from '../../utils/constants';

const SubscriptionItem = ({ subscription, perYear, perMonth }) => {
  // Support both mock shape (merchantName) and real API shape (brandName)
  const displayName = subscription.brandName || subscription.merchantName || 'Unknown';
  const brand = SUBSCRIPTION_BRANDS[displayName] || {
    color: '#6B7280',
    bgColor: '#6B728020',
  };

  const isYearly = subscription.frequency === 'ANNUAL' || subscription.frequency === 'YEARLY';

  return (
    <div
      className="min-w-[140px] p-4 rounded-xl flex-shrink-0"
      style={{ backgroundColor: brand.bgColor }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3"
        style={{ backgroundColor: brand.color }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
      <p className="text-sm font-medium text-gray-900 truncate mb-1">
        {displayName}
      </p>
      <p className="text-lg font-bold text-gray-900">
        {formatCurrency(subscription.amount)}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {isYearly ? perYear : perMonth}
      </p>
    </div>
  );
};

const SubscriptionSection = ({
  subscriptions = [],
  totalMonthly = 0,
  title = 'Subscriptions',
}) => {
  const { t } = useTranslation();
  const activeCount = subscriptions.filter((s) => s.isActive).length;

  // Calculate total monthly (convert yearly to monthly)
  const calculatedMonthly =
    totalMonthly ||
    subscriptions.reduce((sum, s) => {
      if (s.frequency === 'YEARLY') return sum + s.amount / 12;
      if (s.frequency === 'QUARTERLY') return sum + s.amount / 3;
      return sum + s.amount;
    }, 0);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{t('subscriptions.nActive', { n: activeCount })}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(calculatedMonthly)}
          </p>
          <p className="text-xs text-gray-500">{t('subscriptions.perMonth')}</p>
        </div>
      </div>

      {/* Horizontal Scroll */}
      {subscriptions.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          {subscriptions.map((subscription) => (
            <SubscriptionItem
              key={subscription.subscriptionId || subscription._id || subscription.brandName}
              subscription={subscription}
              perYear={t('subscriptions.perYear')}
              perMonth={t('subscriptions.perMonth')}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          {t('subscriptions.noActive')}
        </div>
      )}

      {/* See All Link */}
      <button className="w-full mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
        {t('subscriptions.manage')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </Card>
  );
};

export default SubscriptionSection;
