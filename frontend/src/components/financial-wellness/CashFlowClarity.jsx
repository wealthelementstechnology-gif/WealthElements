import { useSelector } from 'react-redux';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Info,
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

// Format percentage
const formatPercent = (value) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export default function CashFlowClarity() {
  const {
    totalMonthlyIncome,
    currentMonthSummary,
    previousMonthSummary,
    comparison,
    explanations,
  } = useSelector((state) => state.cashFlow);

  const savingsRate = currentMonthSummary?.savingsRate || 0;
  const monthlySavings = currentMonthSummary?.monthlySavings || 0;

  // Determine savings rate status
  const getSavingsStatus = () => {
    if (savingsRate >= 30) return { status: 'excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (savingsRate >= 20) return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' };
    if (savingsRate >= 10) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (savingsRate >= 0) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'negative', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const savingsStatus = getSavingsStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Cash Flow Clarity</h2>
        <p className="text-sm text-gray-500 mt-1">Understand where your money goes each month</p>
      </div>

      {/* Main Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Monthly Income</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyIncome)}</p>
          {comparison?.incomeChange !== 0 && (
            <p className={`text-sm mt-1 ${comparison.incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(comparison.incomeChangePercent)} vs last month
            </p>
          )}
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentMonthSummary?.totalExpenses || 0)}
          </p>
          {comparison?.expenseChange !== 0 && (
            <p className={`text-sm mt-1 ${comparison.expenseChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(comparison.expenseChangePercent)} vs last month
            </p>
          )}
        </div>

        {/* Savings */}
        <div className={`rounded-xl p-5 border ${savingsStatus.bg} border-gray-100 shadow-sm`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 ${savingsRate >= 0 ? 'bg-emerald-100' : 'bg-red-100'} rounded-lg`}>
              {savingsRate >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-600">Monthly Savings</span>
          </div>
          <p className={`text-2xl font-bold ${savingsStatus.color}`}>{formatCurrency(Math.abs(monthlySavings))}</p>
          <p className={`text-sm mt-1 ${savingsStatus.color}`}>
            {savingsRate.toFixed(1)}% savings rate
          </p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
        <div className="space-y-4">
          {/* Fixed Expenses */}
          <ExpenseCategory
            title="Fixed Expenses"
            subtitle="Rent, EMIs, Insurance premiums"
            amount={currentMonthSummary?.fixedExpenses || 0}
            percent={currentMonthSummary?.fixedPercent || 0}
            color="bg-blue-500"
            ideal="Should be < 50%"
          />

          {/* Variable Expenses */}
          <ExpenseCategory
            title="Variable Expenses"
            subtitle="Groceries, Utilities, Transport"
            amount={currentMonthSummary?.variableExpenses || 0}
            percent={currentMonthSummary?.variablePercent || 0}
            color="bg-amber-500"
            ideal="Should be 20-30%"
          />

          {/* Discretionary Expenses */}
          <ExpenseCategory
            title="Discretionary Expenses"
            subtitle="Entertainment, Dining out, Shopping"
            amount={currentMonthSummary?.discretionaryExpenses || 0}
            percent={currentMonthSummary?.discretionaryPercent || 0}
            color="bg-purple-500"
            ideal="Limit to < 20%"
          />
        </div>
      </div>

      {/* Month-over-Month Explanations */}
      {explanations && explanations.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            What Changed This Month
          </h3>
          <div className="space-y-3">
            {explanations.map((explanation, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  explanation.type === 'positive'
                    ? 'bg-green-50'
                    : explanation.type === 'negative'
                      ? 'bg-red-50'
                      : 'bg-gray-50'
                }`}
              >
                {explanation.type === 'positive' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : explanation.type === 'negative' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-800">{explanation.message}</p>
                  {explanation.amount && (
                    <p
                      className={`text-xs mt-1 ${
                        explanation.type === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {explanation.type === 'positive' ? 'Saved' : 'Spent'} {formatCurrency(Math.abs(explanation.amount))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Rate Guidance */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
        <h3 className="font-semibold text-gray-900 mb-3">Your Savings Rate: {savingsRate.toFixed(1)}%</h3>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
              savingsRate >= 30
                ? 'bg-emerald-500'
                : savingsRate >= 20
                  ? 'bg-green-500'
                  : savingsRate >= 10
                    ? 'bg-yellow-500'
                    : savingsRate >= 0
                      ? 'bg-orange-500'
                      : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
          />
          {/* Markers */}
          <div className="absolute left-[20%] top-0 w-0.5 h-full bg-gray-400" title="Minimum 20%" />
          <div className="absolute left-[30%] top-0 w-0.5 h-full bg-gray-400" title="Good 30%" />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>0%</span>
          <span>20% (Min)</span>
          <span>30% (Good)</span>
          <span>50%+</span>
        </div>
        <p className="text-sm text-gray-700">
          {savingsRate >= 30 && "Excellent! You're saving more than 30% of your income. This accelerates wealth building."}
          {savingsRate >= 20 && savingsRate < 30 && "Good job! You're meeting the minimum recommended savings rate. Try to reach 30%."}
          {savingsRate >= 10 && savingsRate < 20 && "Your savings rate is below the recommended 20%. Look for ways to reduce discretionary spending."}
          {savingsRate >= 0 && savingsRate < 10 && "Your savings rate is quite low. Focus on cutting non-essential expenses to save at least 20%."}
          {savingsRate < 0 && "You're spending more than you earn. This is unsustainable - review your expenses immediately."}
        </p>
      </div>
    </div>
  );
}

// Expense Category Component
function ExpenseCategory({ title, subtitle, amount, percent, color, ideal }) {
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
          <p className="text-xs text-gray-500">{percent.toFixed(1)}% of income</p>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{ideal}</p>
    </div>
  );
}
