import { useSelector } from 'react-redux';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
} from 'lucide-react';

export default function HealthScore() {
  const { overallScore, overallStatus, components, top3Actions, summary } = useSelector(
    (state) => state.healthScore
  );

  // Use correct property names from slice
  const status = overallStatus;
  const topImprovements = top3Actions;

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'EXCELLENT':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          gradient: 'from-emerald-500 to-teal-600',
          message: 'Your financial health is excellent! Keep up the great work.',
        };
      case 'GOOD':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          gradient: 'from-green-500 to-emerald-600',
          message: 'Good financial health. A few improvements can make it great.',
        };
      case 'FAIR':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          gradient: 'from-yellow-500 to-amber-600',
          message: 'Fair financial health. Focus on the improvements below.',
        };
      case 'POOR':
      default:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          gradient: 'from-red-500 to-orange-600',
          message: 'Your financial health needs attention. Start with one improvement today.',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Get component status color
  const getComponentColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComponentBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate score ring
  const circumference = 2 * Math.PI * 45;
  const scoreOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Financial Health Score</h2>
        <p className="text-sm text-gray-500 mt-1">Your overall behavioral financial wellness</p>
      </div>

      {/* Main Score Card */}
      <div className={`bg-gradient-to-r ${statusConfig.gradient} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Score Circle */}
            <div className="relative">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{overallScore}</span>
                <span className="text-xs opacity-80">of 100</span>
              </div>
            </div>

            <div>
              <p className="text-white/80 text-sm mb-1">Overall Status</p>
              <p className="text-2xl font-semibold">{status}</p>
              <p className="text-white/70 text-sm mt-2 max-w-xs">{statusConfig.message}</p>
            </div>
          </div>

          <Heart className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Score Components</h3>
        <div className="space-y-4">
          {components &&
            Object.entries(components).map(([key, component]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{component.name}</span>
                    <span className="text-xs text-gray-500">({component.weight}% weight)</span>
                  </div>
                  <span className={`font-semibold ${getComponentColor(component.score)}`}>
                    {component.score}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${getComponentBg(component.score)} rounded-full transition-all`}
                    style={{ width: `${component.score}%` }}
                  />
                </div>

                {/* Explanation */}
                <p className="text-sm text-gray-600">{component.explanation}</p>

                {/* Improvements if any */}
                {component.improvements && component.improvements.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">To improve:</p>
                    <ul className="space-y-1">
                      {component.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Top 3 Improvements */}
      {topImprovements && topImprovements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Top 3 Ways to Improve Your Score
          </h3>
          <div className="space-y-3">
            {topImprovements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <p className="font-medium text-gray-800">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Interpretation */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          Understanding Your Score
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ScoreRange range="90-100" label="Excellent" color="bg-emerald-500" />
          <ScoreRange range="70-89" label="Good" color="bg-green-500" />
          <ScoreRange range="50-69" label="Fair" color="bg-yellow-500" />
          <ScoreRange range="0-49" label="Poor" color="bg-red-500" />
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Your score reflects your financial behaviors, not your wealth. Someone earning ₹30K/month with
            strong habits can score higher than someone earning ₹3L/month with poor habits. Focus on
            consistency, discipline, and planning.
          </p>
        </div>
      </div>

      {/* What Each Component Measures */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">What We Measure</h3>
        <div className="space-y-4 text-sm">
          <ComponentExplainer
            name="Consistency"
            weight="25%"
            description="How regularly you track finances, contribute to goals, and maintain your financial habits"
          />
          <ComponentExplainer
            name="Expense Discipline"
            weight="25%"
            description="Your ability to stick to budgets, control discretionary spending, and avoid lifestyle inflation"
          />
          <ComponentExplainer
            name="Withdrawal Behavior"
            weight="20%"
            description="How often you break investments, take loans, or dip into savings for non-emergencies"
          />
          <ComponentExplainer
            name="Planning Hygiene"
            weight="15%"
            description="Having nominees, insurance, emergency funds, and documented financial plans in place"
          />
          <ComponentExplainer
            name="Debt Health"
            weight="15%"
            description="Your debt-to-income ratio, EMI burden, and credit utilization patterns"
          />
        </div>
      </div>
    </div>
  );
}

// Score Range Component
function ScoreRange({ range, label, color }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div>
        <p className="text-sm font-medium text-gray-800">{range}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Component Explainer
function ComponentExplainer({ name, weight, description }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-12 text-center">
        <span className="text-xs font-medium text-gray-500">{weight}</span>
      </div>
      <div>
        <p className="font-medium text-gray-800">{name}</p>
        <p className="text-gray-600 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
