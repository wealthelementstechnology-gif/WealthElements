import { useSelector } from 'react-redux';
import {
  Heart,
  Baby,
  Home,
  Users,
  GraduationCap,
  Sunset,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
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

// Event icons
const getEventIcon = (type) => {
  const icons = {
    MARRIAGE: Heart,
    FIRST_CHILD: Baby,
    HOME_PURCHASE: Home,
    PARENTS_CARE: Users,
    CHILD_EDUCATION: GraduationCap,
    RETIREMENT: Sunset,
  };
  return icons[type] || Calendar;
};

// Event colors
const getEventColor = (type) => {
  const colors = {
    MARRIAGE: 'bg-pink-500',
    FIRST_CHILD: 'bg-blue-500',
    HOME_PURCHASE: 'bg-emerald-500',
    PARENTS_CARE: 'bg-purple-500',
    CHILD_EDUCATION: 'bg-amber-500',
    RETIREMENT: 'bg-orange-500',
  };
  return colors[type] || 'bg-gray-500';
};

export default function LifeEventReadiness() {
  const { plannedEvents, eventReadiness, tips } = useSelector((state) => state.lifeEvents);

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'AHEAD':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Ahead',
        };
      case 'ON_TRACK':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'On Track',
        };
      case 'BEHIND':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Behind',
        };
      case 'NOT_STARTED':
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Not Started',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Life Event Readiness</h2>
        <p className="text-sm text-gray-500 mt-1">Plan and prepare for major life milestones</p>
      </div>

      {/* Event Cards */}
      {plannedEvents && plannedEvents.length > 0 ? (
        <div className="space-y-4">
          {plannedEvents.map((event) => {
            const readiness = eventReadiness[event.id] || {};
            const eventTips = tips[event.id] || [];
            const statusConfig = getStatusConfig(readiness.status);
            const Icon = getEventIcon(event.type);
            const eventColor = getEventColor(event.type);

            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className={`${eventColor} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{readiness.eventName || event.type}</h3>
                        <p className="text-white/80 text-sm">Target: {event.targetYear}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color} text-sm font-medium`}>
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Saved: {formatCurrency(readiness.currentSavings || 0)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(readiness.readinessPercent || 0).toFixed(0)}% ready
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${eventColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, readiness.readinessPercent || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {readiness.cost && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600 mb-2">{readiness.cost.costBreakdown}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Today&apos;s Cost</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(readiness.cost.estimatedCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Inflation-Adjusted ({event.targetYear})</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(readiness.cost.inflationAdjustedCost)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Inflation rate used: {readiness.cost.inflationRate}% per year
                      </p>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className="flex items-start gap-2 mb-4">
                    {readiness.status === 'AHEAD' || readiness.status === 'ON_TRACK' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-gray-700">{readiness.message}</p>
                  </div>

                  {/* Monthly Needed */}
                  {readiness.monthlyNeeded > 0 && readiness.status !== 'AHEAD' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Monthly savings needed</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(readiness.monthlyNeeded)}/month
                        </span>
                      </div>
                    </div>
                  )}

                  {/* India-specific Tips */}
                  {eventTips && eventTips.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        India-Specific Tips
                      </h4>
                      <ul className="space-y-2">
                        {eventTips.slice(0, 3).map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No Life Events Planned</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add major life events you&apos;re planning for to see how prepared you are
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" />
            Add Life Event
          </button>
        </div>
      )}

      {/* Common Life Events Reference */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Common Life Events in India</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EventReference
            icon={Heart}
            name="Marriage"
            cost="₹10L - ₹50L+"
            inflation="8%"
            color="bg-pink-100 text-pink-600"
          />
          <EventReference
            icon={Baby}
            name="First Child"
            cost="₹3L first year"
            inflation="7%"
            color="bg-blue-100 text-blue-600"
          />
          <EventReference
            icon={Home}
            name="Home Purchase"
            cost="₹40L - ₹1.5Cr"
            inflation="6%"
            color="bg-emerald-100 text-emerald-600"
          />
          <EventReference
            icon={Users}
            name="Parents Care"
            cost="₹2L/year + ₹10L corpus"
            inflation="10%"
            color="bg-purple-100 text-purple-600"
          />
          <EventReference
            icon={GraduationCap}
            name="Child Education"
            cost="₹20L - ₹50L+"
            inflation="10%"
            color="bg-amber-100 text-amber-600"
          />
          <EventReference
            icon={Sunset}
            name="Retirement"
            cost="25-30x annual expenses"
            inflation="6%"
            color="bg-orange-100 text-orange-600"
          />
        </div>
      </div>

      {/* Planning Tips */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Smart Planning Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Start Early</p>
            <p className="text-gray-600 text-xs">
              Starting 5 years early vs 3 years can reduce your monthly savings requirement by 40%+
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Account for Inflation</p>
            <p className="text-gray-600 text-xs">
              Education & medical costs grow at 10%+ annually in India. Don&apos;t plan at today&apos;s prices.
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Don&apos;t Sacrifice Retirement</p>
            <p className="text-gray-600 text-xs">
              You can take a loan for education or home, but there&apos;s no loan for retirement.
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800 mb-1">Use Separate Accounts</p>
            <p className="text-gray-600 text-xs">
              Keep goal-specific savings separate. What&apos;s earmarked is less likely to be spent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Reference Component
function EventReference({ icon: Icon, name, cost, inflation, color }) {
  return (
    <div className="p-3 border border-gray-100 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-gray-900">{name}</span>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Est. Cost: {cost}</p>
        <p>Inflation: {inflation}/year</p>
      </div>
    </div>
  );
}
