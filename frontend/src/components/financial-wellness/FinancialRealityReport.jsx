import { useSelector } from 'react-redux';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Target,
  Shield,
  Heart,
  Download,
  Share2,
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
  return `₹${Math.abs(amount).toFixed(0)}`;
};

// Get trend icon
const getTrendIcon = (trend) => {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
};

export default function FinancialRealityReport() {
  const {
    generatedAt,
    periodCovered,
    snapshot,
    keyMetrics,
    risks,
    wins,
    actionPlan,
    trends,
    summaryMessage,
    overallAssessment,
  } = useSelector((state) => state.realityReport);

  // Get assessment config
  const getAssessmentConfig = () => {
    switch (overallAssessment) {
      case 'STRONG':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          gradient: 'from-emerald-500 to-teal-600',
          label: 'Strong',
        };
      case 'STABLE':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          gradient: 'from-blue-500 to-indigo-600',
          label: 'Stable',
        };
      case 'NEEDS_ATTENTION':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          gradient: 'from-yellow-500 to-amber-600',
          label: 'Needs Attention',
        };
      case 'CRITICAL':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          gradient: 'from-red-500 to-orange-600',
          label: 'Critical',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          gradient: 'from-gray-500 to-gray-600',
          label: 'Unknown',
        };
    }
  };

  const assessmentConfig = getAssessmentConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Financial Reality Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {periodCovered || 'Current Period'} • Generated{' '}
            {generatedAt ? new Date(generatedAt).toLocaleDateString('en-IN') : 'Today'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className={`bg-gradient-to-r ${assessmentConfig.gradient} rounded-xl p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Overall Assessment</p>
            <p className="text-3xl font-bold mt-1">{assessmentConfig.label}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Health Score</p>
            <p className="text-3xl font-bold mt-1">{snapshot?.healthScore || 0}</p>
          </div>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">{summaryMessage}</p>
      </div>

      {/* Financial Snapshot */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Financial Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SnapshotMetric
            label="Net Worth"
            value={formatCurrency(snapshot?.netWorth || 0)}
            change={snapshot?.netWorthChangePercent}
            trend={trends?.netWorth}
          />
          <SnapshotMetric
            label="Monthly Income"
            value={formatCurrency(snapshot?.monthlyIncome || 0)}
            trend="stable"
          />
          <SnapshotMetric
            label="Monthly Expenses"
            value={formatCurrency(snapshot?.monthlyExpenses || 0)}
            trend={trends?.spending === 'increasing' ? 'declining' : trends?.spending === 'decreasing' ? 'improving' : 'stable'}
          />
          <SnapshotMetric
            label="Savings Rate"
            value={`${(snapshot?.savingsRate || 0).toFixed(0)}%`}
            trend={trends?.savings}
            isPercent
          />
        </div>

        {/* Key Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Survival Months</p>
              <p className="font-semibold text-gray-900">{(snapshot?.survivalMonths || 0).toFixed(1)} months</p>
            </div>
            <div>
              <p className="text-gray-500">Liquid Assets</p>
              <p className="font-semibold text-gray-900">{formatCurrency(keyMetrics?.liquidAssets || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Debt</p>
              <p className="font-semibold text-gray-900">{formatCurrency(keyMetrics?.totalDebt || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">EMI-to-Income</p>
              <p className="font-semibold text-gray-900">{(keyMetrics?.emiToIncomeRatio || 0).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Risks and Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's at Risk */}
        <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            What&apos;s at Risk
          </h3>
          {risks && risks.length > 0 ? (
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    risk.severity === 'critical'
                      ? 'bg-red-50 border border-red-200'
                      : risk.severity === 'high'
                        ? 'bg-orange-50 border border-orange-200'
                        : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        risk.severity === 'critical'
                          ? 'text-red-500'
                          : risk.severity === 'high'
                            ? 'text-orange-500'
                            : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{risk.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{risk.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No critical risks identified</p>
            </div>
          )}
        </div>

        {/* What's Working */}
        <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            What&apos;s Working
          </h3>
          {wins && wins.length > 0 ? (
            <div className="space-y-3">
              {wins.map((win, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{win.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{win.description}</p>
                      {win.encouragement && (
                        <p className="text-xs text-green-600 mt-1 italic">{win.encouragement}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Heart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Keep building good habits!</p>
            </div>
          )}
        </div>
      </div>

      {/* 30-Day Action Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          30-Day Action Plan
        </h3>

        <div className="space-y-6">
          {/* Immediate */}
          {actionPlan?.immediate && actionPlan.immediate.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Do This Week
              </h4>
              <div className="space-y-2">
                {actionPlan.immediate.map((item, index) => (
                  <ActionItem key={index} item={item} priority="immediate" />
                ))}
              </div>
            </div>
          )}

          {/* This Month */}
          {actionPlan?.thisMonth && actionPlan.thisMonth.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Complete This Month
              </h4>
              <div className="space-y-2">
                {actionPlan.thisMonth.map((item, index) => (
                  <ActionItem key={index} item={item} priority="month" />
                ))}
              </div>
            </div>
          )}

          {/* Ongoing Habits */}
          {actionPlan?.ongoing && actionPlan.ongoing.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Ongoing Habits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {actionPlan.ongoing.map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-900">{item.habit}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Trends vs Last Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TrendIndicator label="Net Worth" trend={trends?.netWorth} />
          <TrendIndicator label="Spending" trend={trends?.spending} invert />
          <TrendIndicator label="Savings" trend={trends?.savings} />
          <TrendIndicator label="Health Score" trend={trends?.healthScore} />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>
          This report is based on data available as of {generatedAt ? new Date(generatedAt).toLocaleDateString('en-IN') : 'today'}.
        </p>
        <p className="mt-1">
          Review monthly for best results. Small consistent improvements compound over time.
        </p>
      </div>
    </div>
  );
}

// Snapshot Metric Component
function SnapshotMetric({ label, value, change, trend, isPercent }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500">{label}</p>
        {getTrendIcon(trend)}
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-0.5 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}

// Action Item Component
function ActionItem({ item, priority }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
      <ArrowRight
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
          priority === 'immediate' ? 'text-red-500' : 'text-amber-500'
        }`}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{item.task}</p>
        {item.reason && <p className="text-xs text-gray-500 mt-0.5">Why: {item.reason}</p>}
      </div>
    </div>
  );
}

// Trend Indicator Component
function TrendIndicator({ label, trend, invert }) {
  let displayTrend = trend;
  if (invert) {
    if (trend === 'improving') displayTrend = 'declining';
    else if (trend === 'declining') displayTrend = 'improving';
  }

  const config = {
    improving: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', label: 'Improving' },
    declining: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', label: 'Declining' },
    stable: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Stable' },
  };

  const { icon: Icon, color, bg, label: trendLabel } = config[displayTrend] || config.stable;

  return (
    <div className={`p-3 rounded-lg ${bg}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{trendLabel}</span>
      </div>
    </div>
  );
}
