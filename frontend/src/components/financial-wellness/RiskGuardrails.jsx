import { useSelector } from 'react-redux';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Wallet,
  Home,
  Heart,
  Users,
  PiggyBank,
  CreditCard,
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

export default function RiskGuardrails() {
  const { riskLevel, overallRiskScore, metrics, activeAlerts, summary } = useSelector(
    (state) => state.riskGuardrails
  );

  // Use correct property names from slice
  const overallRiskLevel = riskLevel;
  const alerts = activeAlerts;

  // Get risk level config
  const getRiskConfig = () => {
    switch (overallRiskLevel) {
      case 'LOW':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          gradient: 'from-emerald-500 to-teal-600',
          icon: Shield,
          label: 'Low Risk',
          message: 'Your financial risks are well managed.',
        };
      case 'MODERATE':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          gradient: 'from-yellow-500 to-amber-600',
          icon: ShieldAlert,
          label: 'Moderate Risk',
          message: 'Some areas need attention to reduce risk.',
        };
      case 'HIGH':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          gradient: 'from-orange-500 to-red-500',
          icon: AlertTriangle,
          label: 'High Risk',
          message: 'Multiple risk factors detected. Take action.',
        };
      case 'CRITICAL':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          gradient: 'from-red-500 to-red-700',
          icon: AlertCircle,
          label: 'Critical Risk',
          message: 'Urgent attention required. Address issues immediately.',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          gradient: 'from-gray-500 to-gray-600',
          icon: Shield,
          label: 'Unknown',
          message: 'Unable to assess risk level.',
        };
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;

  // Get metric status
  const getMetricStatus = (value, thresholds) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.moderate) return 'moderate';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Risk Guardrails</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor your exposure to financial risks</p>
      </div>

      {/* Main Risk Status */}
      <div className={`bg-gradient-to-r ${riskConfig.gradient} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <RiskIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Overall Risk Level</p>
              <p className="text-3xl font-bold">{riskConfig.label}</p>
              <p className="text-white/70 text-sm mt-1">{riskConfig.message}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">Active Alerts</p>
            <p className="text-4xl font-bold">{alerts?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={CreditCard}
          label="Debt-to-Income"
          value={`${((metrics?.debtToIncomeRatio || 0) * 100).toFixed(0)}%`}
          status={getMetricStatus((metrics?.debtToIncomeRatio || 0) * 100, { good: 30, moderate: 50 })}
          benchmark="Healthy: < 30%"
        />
        <MetricCard
          icon={Home}
          label="EMI-to-Income"
          value={`${(metrics?.emiToIncomeRatio || 0).toFixed(0)}%`}
          status={getMetricStatus(metrics?.emiToIncomeRatio || 0, { good: 40, moderate: 50 })}
          benchmark="Healthy: < 40%"
        />
        <MetricCard
          icon={PiggyBank}
          label="Liquidity Ratio"
          value={`${(metrics?.liquidityRatio || 0).toFixed(1)}x`}
          status={(metrics?.liquidityRatio || 0) >= 3 ? 'good' : (metrics?.liquidityRatio || 0) >= 1 ? 'moderate' : 'poor'}
          benchmark="Healthy: > 3x monthly expenses"
        />
        <MetricCard
          icon={Heart}
          label="Insurance Coverage"
          value={`${((metrics?.insuranceCoverageRatio || 0) * 100).toFixed(0)}%`}
          status={(metrics?.insuranceCoverageRatio || 0) >= 1 ? 'good' : (metrics?.insuranceCoverageRatio || 0) >= 0.5 ? 'moderate' : 'poor'}
          benchmark="Healthy: 100% of recommended"
        />
        <MetricCard
          icon={TrendingUp}
          label="Concentration Risk"
          value={`${(metrics?.concentrationRisk || 0).toFixed(0)}%`}
          status={getMetricStatus(metrics?.concentrationRisk || 0, { good: 30, moderate: 50 })}
          benchmark="Healthy: < 30% in any single asset"
        />
        <MetricCard
          icon={Users}
          label="Dependent Coverage"
          value={`${((metrics?.dependentCoverage || 0) * 100).toFixed(0)}%`}
          status={(metrics?.dependentCoverage || 0) >= 1 ? 'good' : (metrics?.dependentCoverage || 0) >= 0.5 ? 'moderate' : 'poor'}
          benchmark="Healthy: 100% health cover"
        />
      </div>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Risk Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50 border border-red-200'
                    : alert.severity === 'HIGH'
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'text-red-500'
                          : alert.severity === 'HIGH'
                            ? 'text-orange-500'
                            : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      {alert.recommendation && (
                        <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          {alert.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : alert.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts Message */}
      {(!alerts || alerts.length === 0) && (
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">No Active Alerts</p>
              <p className="text-sm text-gray-600">Your risk levels are within acceptable ranges. Keep monitoring.</p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Risk Reduction Suggestions
          </h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">{suggestion.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{suggestion.description}</p>
                  {suggestion.impact && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Impact: {suggestion.impact}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Education */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          Understanding Your Risk Metrics
        </h3>
        <div className="space-y-4 text-sm">
          <RiskExplainer
            metric="Debt-to-Income Ratio"
            description="Total debt compared to annual income. High ratios mean you're leveraged and vulnerable to income disruption."
            safe="< 30%"
            warning="30-50%"
            danger="> 50%"
          />
          <RiskExplainer
            metric="EMI-to-Income Ratio"
            description="Monthly EMI payments as a percentage of monthly income. Banks typically won't lend if this exceeds 50%."
            safe="< 40%"
            warning="40-50%"
            danger="> 50%"
          />
          <RiskExplainer
            metric="Liquidity Ratio"
            description="Liquid assets (cash, savings, liquid funds) divided by monthly expenses. This is your immediate safety net."
            safe="> 6 months"
            warning="3-6 months"
            danger="< 3 months"
          />
          <RiskExplainer
            metric="Insurance Coverage"
            description="Term insurance cover compared to annual income. Protects dependents if something happens to you."
            safe="> 10x income"
            warning="5-10x income"
            danger="< 5x income"
          />
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon: Icon, label, value, status, benchmark }) {
  const statusColors = {
    good: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className={`rounded-xl p-4 border ${statusColors[status]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 opacity-60" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{benchmark}</p>
    </div>
  );
}

// Risk Explainer Component
function RiskExplainer({ metric, description, safe, warning, danger }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="font-medium text-gray-800 mb-1">{metric}</p>
      <p className="text-gray-600 text-xs mb-2">{description}</p>
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Safe: {safe}</span>
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Caution: {warning}</span>
        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Risk: {danger}</span>
      </div>
    </div>
  );
}
