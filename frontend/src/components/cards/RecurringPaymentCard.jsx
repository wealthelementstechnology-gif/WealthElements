import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { formatCurrency, formatDueDateBadge, getDueDateStatus } from '../../utils/formatters';

const RecurringPaymentItem = ({ payment }) => {
  const status = getDueDateStatus(payment.dueDate);

  const statusStyles = {
    overdue: 'bg-red-100 text-red-700',
    today: 'bg-amber-100 text-amber-700',
    soon: 'bg-orange-100 text-orange-700',
    normal: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-w-[160px] p-4 bg-gray-50 rounded-xl flex-shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: payment.logoColor || '#6B7280' }}
        >
          {payment.name.charAt(0)}
        </div>
        <span className="text-sm font-medium text-gray-900 truncate">
          {payment.name}
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900 mb-2">
        {formatCurrency(payment.amount)}
      </p>
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {formatDueDateBadge(payment.dueDate)}
      </span>
    </div>
  );
};

const RecurringPaymentSection = ({ payments = [], title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('overview.recurringPayments');

  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{displayTitle}</h3>
        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          {t('overview.seeAll')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
        {payments.map((payment) => (
          <RecurringPaymentItem key={payment.id} payment={payment} />
        ))}
      </div>
    </Card>
  );
};

export default RecurringPaymentSection;
