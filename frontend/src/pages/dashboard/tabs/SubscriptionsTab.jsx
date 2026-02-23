import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RecurringPaymentSection } from '../../../components/cards';
import Card from '../../../components/common/Card';
import SubscriptionTreemap from '../../../components/cards/SubscriptionTreemap';

const SubscriptionsTab = () => {
  const { t } = useTranslation();
  const { activeSubscriptions, recurringPayments } = useSelector(
    (state) => state.subscriptions
  );

  const monthlyCount = activeSubscriptions.filter((s) => s.frequency === 'MONTHLY').length;
  const yearlyCount = activeSubscriptions.filter(
    (s) => s.frequency === 'YEARLY' || s.frequency === 'ANNUAL'
  ).length;

  return (
    <div className="space-y-5">
      {/* Stats card — matches reference */}
      <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-5 flex justify-between items-center text-center border border-white/30 shadow-sm">
        <div className="flex-1 border-r border-gray-100">
          <div className="text-4xl font-extrabold text-emerald-500">
            {activeSubscriptions.length}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">
            {t('subscriptions.active')}
          </div>
        </div>
        <div className="flex-1 border-r border-gray-100">
          <div className="text-4xl font-extrabold text-indigo-600">
            {monthlyCount}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">
            {t('subscriptions.monthly')}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-4xl font-extrabold text-gray-400">
            {yearlyCount}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">
            {t('subscriptions.yearly')}
          </div>
        </div>
      </div>

      {/* Size map */}
      {activeSubscriptions.length > 0 ? (
        <SubscriptionTreemap subscriptions={activeSubscriptions} />
      ) : (
        <Card>
          <div className="py-8 text-center text-gray-500">
            {t('subscriptions.noActive')}
          </div>
        </Card>
      )}

      {/* Recurring Payments */}
      <RecurringPaymentSection payments={recurringPayments} title={t('subscriptions.recurringPayments')} />
    </div>
  );
};

export default SubscriptionsTab;
