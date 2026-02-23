import { useSelector } from 'react-redux';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  Heart,
  Users,
  Wallet,
  Building,
  Clock,
} from 'lucide-react';

export default function HygieneChecks() {
  const { overallScore, status, issues, categoryScores, actionItems, lastChecked } = useSelector(
    (state) => state.hygiene
  );

  // Get status config
  const getStatusConfig = () => {
    switch (status) {
      case 'EXCELLENT':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          gradient: 'from-emerald-500 to-teal-600',
          icon: ShieldCheck,
          label: 'Excellent',
          message: 'Your financial hygiene is excellent. Keep maintaining these standards.',
        };
      case 'GOOD':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          gradient: 'from-green-500 to-emerald-600',
          icon: Shield,
          label: 'Good',
          message: 'Good financial hygiene. A few improvements will make it excellent.',
        };
      case 'FAIR':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          gradient: 'from-yellow-500 to-amber-600',
          icon: ShieldAlert,
          label: 'Fair',
          message: 'Some hygiene issues need attention. Address them to protect your family.',
        };
      case 'POOR':
      default:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          gradient: 'from-red-500 to-orange-600',
          icon: AlertCircle,
          label: 'Poor',
          message: 'Critical hygiene issues detected. These can harm your family if not fixed.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      nominees: Users,
      insurance_coverage: Heart,
      document_status: FileText,
      account_hygiene: Wallet,
      structural_issues: Building,
    };
    return icons[category] || Shield;
  };

  // Get severity config
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' };
      case 'HIGH':
        return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' };
      case 'MEDIUM':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' };
      case 'LOW':
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Trust & Hygiene Checks</h2>
        <p className="text-sm text-gray-500 mt-1">Structural issues that silently harm your financial health</p>
      </div>

      {/* Main Score Card */}
      <div className={`bg-gradient-to-r ${statusConfig.gradient} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <StatusIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Hygiene Score</p>
              <p className="text-4xl font-bold">{overallScore}</p>
              <p className="text-white/70 text-sm mt-1">out of 100</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm mb-1">Status</p>
            <p className="text-2xl font-semibold">{statusConfig.label}</p>
            <p className="text-white/60 text-xs mt-2">
              {issues?.length || 0} issue{issues?.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <p className="mt-4 text-white/80 text-sm">{statusConfig.message}</p>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {categoryScores &&
          Object.entries(categoryScores).map(([key, category]) => {
            const Icon = getCategoryIcon(key);
            const scorePercent = category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;
            const isGood = scorePercent >= 80;

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border ${isGood ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isGood ? 'text-emerald-600' : 'text-amber-600'}`} />
                <p className="text-xs font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                <p className={`text-lg font-bold ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {category.score}/{category.maxScore}
                </p>
              </div>
            );
          })}
      </div>

      {/* Priority Action Items */}
      {actionItems && actionItems.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Priority Action Items
          </h3>
          <div className="space-y-3">
            {actionItems.map((item, index) => {
              const severityConfig = getSeverityConfig(item.severity);
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium flex-shrink-0">
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig.badge}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.action}</p>
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeframe}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Issues */}
      {issues && issues.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            All Issues ({issues.length})
          </h3>
          <div className="space-y-3">
            {issues.map((issue, index) => {
              const severityConfig = getSeverityConfig(issue.severity);
              const CategoryIcon = getCategoryIcon(issue.category);

              return (
                <div key={index} className={`p-4 rounded-lg border ${severityConfig.bg} ${severityConfig.border}`}>
                  <div className="flex items-start gap-3">
                    <CategoryIcon className={`w-5 h-5 ${severityConfig.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900">{issue.title}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig.badge}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      {issue.action && (
                        <div className="mt-2 p-2 bg-white/60 rounded">
                          <p className="text-sm text-blue-600 flex items-start gap-1">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {issue.action}
                          </p>
                        </div>
                      )}
                      {issue.impact && (
                        <p className="text-xs text-gray-500 mt-2">Impact: {issue.impact}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Issues State */}
      {(!issues || issues.length === 0) && (
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h3 className="font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-sm text-gray-600">
            No hygiene issues detected. Your financial house is in order.
          </p>
        </div>
      )}

      {/* Hygiene Checklist Reference */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Financial Hygiene Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChecklistSection
            title="Nominees"
            items={[
              'Bank accounts have nominees',
              'Demat account has nominee',
              'Mutual funds have nominees',
              'PPF/EPF/NPS have nominees',
              'Insurance policies have nominees',
            ]}
          />
          <ChecklistSection
            title="Insurance"
            items={[
              'Term insurance 10-12x annual income',
              'Health insurance for family',
              'Critical illness cover if high income',
              'Personal accident cover',
            ]}
          />
          <ChecklistSection
            title="Documents"
            items={[
              'Will created and updated',
              'PAN linked with Aadhaar',
              'KYC updated across accounts',
              'Digital asset list documented',
            ]}
          />
          <ChecklistSection
            title="Structure"
            items={[
              'Emergency fund of 6+ months',
              'Diversified investments',
              'Active retirement contributions',
              'No single point of failure',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// Checklist Section Component
function ChecklistSection({ title, items }) {
  return (
    <div className="p-3 bg-white/60 rounded-lg">
      <p className="font-medium text-gray-800 mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 rounded" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
