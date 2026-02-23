import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  SpendingSummaryCard,
  RecurringPaymentSection,
} from '../../../components/cards';
import { getMockData } from '../../../services/mockData';

const SpendingTab = () => {
  const { t } = useTranslation();
  const { recurringPayments } = useSelector((state) => state.subscriptions);
  const mockData = getMockData();

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // TODO: Navigate to category details or show modal
  };

  const handleUntaggedClick = () => {
    console.log('Untagged clicked');
    // TODO: Navigate to untagged transactions
  };

  return (
    <div className="space-y-6">
      {/* Spending Summary with Chart */}
      <SpendingSummaryCard
        categories={mockData.spending.categories}
        totalSpent={mockData.spending.totalSpent}
        untaggedPercentage={mockData.spending.untaggedPercentage}
        onCategoryClick={handleCategoryClick}
        onUntaggedClick={handleUntaggedClick}
      />

      {/* Recurring Payments */}
      <RecurringPaymentSection
        payments={recurringPayments}
        title={t('spending.upcomingPayments')}
      />
    </div>
  );
};

export default SpendingTab;
