import { useSelector } from 'react-redux';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, Info } from 'lucide-react';

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

export default function EmergencyReadiness() {
  const {
    currentAmount,
    monthlyEssentialExpenses,
    survivalMonths,
    targetMonths,
    shortfall,
    status,
    statusMessage,
    essentialExpenseBreakdown,
    monthlyContribution,
    monthsToTarget,
    alerts,
  } = useSelector((state) => state.emergencyFund);

  // Get status colors and icons
  const getStatusConfig = () => {
    switch (status) {
      case 'STRONG':
        return {
          icon: ShieldCheck,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          progressColor: 'bg-emerald-500',
        };
      case 'ADEQUATE':
        return {
          icon: Shield,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          progressColor: 'bg-green-500',
        };
      case 'WARNING':
        return {
          icon: ShieldAlert,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          progressColor: 'bg-yellow-500',
        };
      case 'CRITICAL':
      default:
        return {
          icon: ShieldAlert,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const progressPercent = Math.min(100, (survivalMonths / targetMonths) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Emergency Readiness</h2>
        <p className="text-sm text-gray-500 mt-1">How long can you survive without income?</p>
      </div>

      {/* Main Status Card */}
      <div className={`rounded-xl p-6 ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${statusConfig.bgColor} rounded-xl`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${statusConfig.color}`}>
                {survivalMonths.toFixed(1)} months
              </p>
              <p className="text-sm text-gray-600">of expenses covered</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Emergency Fund</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(currentAmount)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to {targetMonths}-month target</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="relative h-3 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${statusConfig.progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
            {/* Markers */}
            <div className="absolute left-[50%] top-0 w-0.5 h-full bg-gray-300" title="3 months" />
            <div className="absolute left-[100%] -translate-x-0.5 top-0 w-0.5 h-full bg-gray-400" title="6 months" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>3 months</span>
            <span>{targetMonths} months</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 p-3 bg-white/60 rounded-lg">
          <p className="text-sm text-gray-700">{statusMessage}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Monthly Essentials</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(monthlyEssentialExpenses)}</p>
          <p className="text-xs text-gray-400 mt-1">Minimum to survive</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Shortfall</p>
          <p className={`text-xl font-semibold ${shortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {shortfall > 0 ? formatCurrency(shortfall) : 'None'}
          </p>
          <p className="text-xs text-gray-400 mt-1">To reach {targetMonths}-month target</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Monthly Contribution</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(monthlyContribution || 0)}</p>
          {monthsToTarget > 0 && shortfall > 0 && (
            <p className="text-xs text-gray-400 mt-1">{Math.ceil(monthsToTarget)} months to target</p>
          )}
        </div>
      </div>

      {/* Essential Expenses Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Essential Expenses Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(essentialExpenseBreakdown || {}).map(([key, value]) => {
            if (value <= 0) return null;
            const labels = {
              rent: 'Rent/Housing',
              utilities: 'Utilities',
              groceries: 'Groceries',
              insurance: 'Insurance Premiums',
              emis: 'EMIs',
              medical: 'Medical',
              transport: 'Transport',
              other: 'Other Essentials',
            };
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{labels[key] || key}</span>
                <span className="font-medium text-gray-900">{formatCurrency(value)}</span>
              </div>
            );
          })}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">Total Essential</span>
              <span className="font-semibold text-gray-900">{formatCurrency(monthlyEssentialExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Why 6 Months?
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Average job search in India takes 3-4 months</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Medical emergencies can require extended recovery time</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Unexpected expenses often cluster together</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>6 months gives peace of mind to make thoughtful decisions</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-white/60 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Keep your emergency fund in a high-yield savings account or liquid mutual fund.
            It should be easily accessible within 24 hours but not so easy that you spend it casually.
          </p>
        </div>
      </div>
    </div>
  );
}
