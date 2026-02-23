import { useSelector } from 'react-redux';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Plane,
  Smartphone,
} from 'lucide-react';

// Format currency in Indian style
const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

// Category icons
const getCategoryIcon = (category) => {
  const icons = {
    dining: Utensils,
    shopping: ShoppingBag,
    transport: Car,
    housing: Home,
    travel: Plane,
    electronics: Smartphone,
    default: ShoppingBag,
  };
  return icons[category] || icons.default;
};

export default function LifestyleInflation() {
  const {
    isDetected,
    severity,
    incomeGrowthPercent,
    spendingGrowthPercent,
    savingsRateChange,
    creepingCategories,
    summary,
    recommendations,
    monthlyTrend,
  } = useSelector((state) => state.lifestyleInflation);

  // Get severity config
  const getSeverityConfig = () => {
    switch (severity) {
      case 'HEALTHY':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: CheckCircle2,
          label: 'Healthy',
        };
      case 'MILD_CREEP':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: AlertTriangle,
          label: 'Mild Creep',
        };
      case 'CONCERNING':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          label: 'Concerning',
        };
      case 'CRITICAL':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          label: 'Critical',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Info,
          label: 'Unknown',
        };
    }
  };

  const severityConfig = getSeverityConfig();
  const SeverityIcon = severityConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Lifestyle Inflation Detector</h2>
        <p className="text-sm text-gray-500 mt-1">Is your spending creeping up faster than your income?</p>
      </div>

      {/* Main Status Card */}
      <div className={`rounded-xl p-6 ${severityConfig.bgColor} border ${severityConfig.borderColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${severityConfig.bgColor} rounded-xl`}>
              <SeverityIcon className={`w-8 h-8 ${severityConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${severityConfig.color}`}>{severityConfig.label}</p>
                {isDetected && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Detected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{summary || 'Analyzing your spending patterns...'}</p>
            </div>
          </div>
        </div>

        {/* Growth Comparison */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {incomeGrowthPercent >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xl font-bold ${incomeGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(incomeGrowthPercent).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Income Growth (6mo)</p>
          </div>

          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {spendingGrowthPercent <= 0 ? (
                <ArrowDownRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xl font-bold ${spendingGrowthPercent <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(spendingGrowthPercent).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Spending Growth (6mo)</p>
          </div>

          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {savingsRateChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xl font-bold ${savingsRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {savingsRateChange > 0 ? '+' : ''}{savingsRateChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Savings Rate Change</p>
          </div>
        </div>
      </div>

      {/* Creeping Categories */}
      {creepingCategories && creepingCategories.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            Categories Growing Fast
          </h3>
          <div className="space-y-4">
            {creepingCategories.map((cat, index) => {
              const Icon = getCategoryIcon(cat.category?.toLowerCase());
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.category}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(cat.sixMonthsAgoAvg)} → {formatCurrency(cat.currentAvg)}/mo
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-semibold">+{cat.increasePercent.toFixed(0)}%</span>
                      <p className="text-xs text-gray-500">{formatCurrency(cat.increaseAmount)}/mo increase</p>
                    </div>
                  </div>

                  {/* Justification check */}
                  <div
                    className={`flex items-start gap-2 p-2 rounded ${
                      cat.isJustified ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {cat.isJustified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${cat.isJustified ? 'text-green-700' : 'text-red-700'}`}>
                      {cat.explanation || (cat.isJustified ? 'This increase appears justified' : 'Consider if this increase is necessary')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* The Danger of Lifestyle Inflation */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Why This Matters
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Lifestyle inflation is the silent wealth killer. When your spending grows as fast as your income,
          you never get ahead. A ₹20,000 raise that leads to ₹20,000 more spending builds zero wealth.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800">The 50% Rule</p>
            <p className="text-gray-600 text-xs mt-1">
              Save at least 50% of every raise. If you get ₹10K more, commit ₹5K to savings before adjusting lifestyle.
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800">The 30-Day Test</p>
            <p className="text-gray-600 text-xs mt-1">
              Before any new recurring expense, wait 30 days. If you still want it after a month, it might be worth it.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending vs Income Visual */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Income vs Spending Growth</h3>
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-4">
          {/* Income bar */}
          <div
            className="absolute left-0 top-0 h-1/2 bg-green-500 rounded-tl-full rounded-bl-full"
            style={{ width: `${Math.min(100, Math.max(0, incomeGrowthPercent * 2 + 50))}%` }}
          />
          {/* Spending bar */}
          <div
            className="absolute left-0 bottom-0 h-1/2 bg-red-400 rounded-bl-full"
            style={{ width: `${Math.min(100, Math.max(0, spendingGrowthPercent * 2 + 50))}%` }}
          />
          {/* Center line */}
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-400" />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>-25%</span>
          <span>0%</span>
          <span>+25%</span>
        </div>
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-600">Income Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-sm text-gray-600">Spending Growth</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Healthy: Green bar longer than red bar (saving the difference)
        </p>
      </div>
    </div>
  );
}
