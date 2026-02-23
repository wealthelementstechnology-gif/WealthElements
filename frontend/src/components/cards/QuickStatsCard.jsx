import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { formatCompactCurrency } from '../../utils/formatters';

const QuickStatsCard = ({ type, value, label, onClick, trend }) => {
  const configs = {
    assets: {
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    spending: {
      icon: CreditCard,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
    balance: {
      icon: Wallet,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    liabilities: {
      icon: TrendingDown,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
    },
  };

  const config = configs[type] || configs.balance;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[140px] p-4 rounded-xl ${config.bgColor} hover:opacity-90 transition-opacity text-left`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <p className={`text-lg font-bold ${config.valueColor}`}>
        {formatCompactCurrency(value)}
      </p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </button>
  );
};

export const QuickStatsRow = ({ stats, onStatClick }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {stats.map((stat) => (
        <QuickStatsCard
          key={stat.type}
          type={stat.type}
          value={stat.value}
          label={stat.label}
          trend={stat.trend}
          onClick={() => onStatClick?.(stat.type)}
        />
      ))}
    </div>
  );
};

export default QuickStatsCard;
