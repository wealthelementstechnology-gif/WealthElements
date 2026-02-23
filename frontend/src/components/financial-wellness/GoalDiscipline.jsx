import { useSelector } from 'react-redux';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  BarChart3,
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

export default function GoalDiscipline() {
  const { goals, goalProgress, leakages, disciplineScore } = useSelector((state) => state.goals);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ON_TRACK':
        return 'text-green-600';
      case 'AHEAD':
        return 'text-emerald-600';
      case 'BEHIND':
        return 'text-yellow-600';
      case 'AT_RISK':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'ON_TRACK':
        return 'bg-green-100';
      case 'AHEAD':
        return 'bg-emerald-100';
      case 'BEHIND':
        return 'bg-yellow-100';
      case 'AT_RISK':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Goal Discipline</h2>
        <p className="text-sm text-gray-500 mt-1">Track your progress and identify leakages</p>
      </div>

      {/* Discipline Score Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Discipline Score</p>
            <p className="text-4xl font-bold">{disciplineScore?.score || 0}</p>
            <p className="text-indigo-200 text-sm mt-1">out of 100</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-200" />
              <span className="text-sm text-indigo-100">
                {disciplineScore?.goalsOnTrack || 0} of {disciplineScore?.totalGoals || 0} goals on track
              </span>
            </div>
            <p className="text-sm text-indigo-200">
              {(disciplineScore?.consistencyRate || 0).toFixed(0)}% consistency rate
            </p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{disciplineScore?.goalsOnTrack || 0}</p>
              <p className="text-xs text-indigo-200">On Track</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{formatCurrency(disciplineScore?.totalLeakage || 0)}</p>
              <p className="text-xs text-indigo-200">Total Leakage</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{(disciplineScore?.consistencyRate || 0).toFixed(0)}%</p>
              <p className="text-xs text-indigo-200">Consistency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Your Financial Goals
        </h3>

        {goals && goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = goalProgress[goal.id] || {};
              return (
                <div key={goal.id} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>Target: {goal.targetYear || goal.targetDate}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBg(progress.status)} ${getStatusColor(progress.status)}`}
                    >
                      {progress.status?.replace('_', ' ') || 'PENDING'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {formatCurrency(goal.currentAmount || 0)} of {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className={getStatusColor(progress.status)}>
                        {(progress.progressPercent || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress.status === 'AHEAD' || progress.status === 'ON_TRACK'
                            ? 'bg-green-500'
                            : progress.status === 'BEHIND'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress.progressPercent || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status message and details */}
                  <div className="flex items-start gap-2">
                    {progress.isOnTrack ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className="text-gray-700">{progress.statusMessage}</p>
                      {progress.requiredMonthlyToComplete > 0 && (
                        <p className="text-gray-500 mt-1">
                          Need {formatCurrency(progress.requiredMonthlyToComplete)}/month to complete on time
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No financial goals set yet</p>
            <p className="text-sm mt-1">Add goals to track your progress</p>
          </div>
        )}
      </div>

      {/* Leakages */}
      {leakages && leakages.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Goal Leakages Detected
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Money that could have gone towards your goals but didn&apos;t
          </p>
          <div className="space-y-3">
            {leakages.map((leakage, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <Wallet className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{leakage.goalName}</p>
                      <p className="text-sm text-gray-600">{leakage.description}</p>
                    </div>
                    <span className="text-red-600 font-semibold">{formatCurrency(leakage.amount)}</span>
                  </div>
                  {leakage.suggestion && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {leakage.suggestion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">Total Leakage This Month</span>
              <span className="font-bold text-red-600">
                {formatCurrency(leakages.reduce((sum, l) => sum + l.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {disciplineScore?.recommendations && disciplineScore.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Improve Your Discipline Score
          </h3>
          <ul className="space-y-2">
            {disciplineScore.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Goal Setting Tips */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          Smart Goal Setting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Be Specific</p>
            <p className="text-gray-600">
              &quot;Save ₹5L for car down payment by Dec 2025&quot; is better than &quot;Save for a car&quot;
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Automate</p>
            <p className="text-gray-600">
              Set up SIPs or recurring transfers on salary day - what you don&apos;t see, you don&apos;t spend
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Review Monthly</p>
            <p className="text-gray-600">Check progress every month and adjust if life circumstances change</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Celebrate Wins</p>
            <p className="text-gray-600">Small rewards for milestones keep motivation high</p>
          </div>
        </div>
      </div>
    </div>
  );
}
