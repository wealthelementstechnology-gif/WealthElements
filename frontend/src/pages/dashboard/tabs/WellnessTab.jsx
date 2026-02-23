import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  TrendingUp,
  Shield,
  Target,
  Wallet,
  AlertTriangle,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';

// Import wellness components
import {
  CashFlowClarity,
  EmergencyReadiness,
  GoalDiscipline,
  HealthScore,
  LifestyleInflation,
  RiskGuardrails,
  LifeEventReadiness,
  HygieneChecks,
} from '../../../components/financial-wellness';

// Wellness module definitions (built at render time to support i18n)
const getWellnessModules = (t) => [
  {
    id: 'health-score',
    name: t('wellness.healthScore'),
    description: t('wellness.overallWellness'),
    icon: Heart,
    color: 'bg-rose-500',
    component: HealthScore,
  },
  {
    id: 'cash-flow',
    name: t('wellness.cashFlow'),
    description: t('wellness.cashFlowDesc'),
    icon: Wallet,
    color: 'bg-blue-500',
    component: CashFlowClarity,
  },
  {
    id: 'emergency',
    name: t('wellness.emergencyFund'),
    description: t('wellness.emergencyFundDesc'),
    icon: Shield,
    color: 'bg-emerald-500',
    component: EmergencyReadiness,
  },
  {
    id: 'goals',
    name: t('wellness.goalDiscipline'),
    description: t('wellness.goalDisciplineDesc'),
    icon: Target,
    color: 'bg-indigo-500',
    component: GoalDiscipline,
  },
  {
    id: 'lifestyle',
    name: t('wellness.lifestyleInflation'),
    description: t('wellness.lifestyleInflationDesc'),
    icon: TrendingUp,
    color: 'bg-amber-500',
    component: LifestyleInflation,
  },
  {
    id: 'risks',
    name: t('wellness.riskGuardrails'),
    description: t('wellness.riskGuardrailsDesc'),
    icon: AlertTriangle,
    color: 'bg-orange-500',
    component: RiskGuardrails,
  },
  {
    id: 'life-events',
    name: t('wellness.lifeEvents'),
    description: t('wellness.lifeEventsDesc'),
    icon: Calendar,
    color: 'bg-purple-500',
    component: LifeEventReadiness,
  },
  {
    id: 'hygiene',
    name: t('wellness.trustHygiene'),
    description: t('wellness.trustHygieneDesc'),
    icon: Users,
    color: 'bg-teal-500',
    component: HygieneChecks,
  },
];

export default function WellnessTab() {
  const { t } = useTranslation();
  const [activeModule, setActiveModule] = useState(null);
  const { overallScore, overallStatus } = useSelector(state => state.healthScore);
  const { survivalMonths } = useSelector(state => state.emergencyFund);
  const { currentMonthSummary } = useSelector(state => state.cashFlow);
  const { risks } = useSelector(state => state.realityReport);

  const savingsRate = currentMonthSummary?.savingsRate ?? 0;
  const riskCount = (risks || []).filter(r => r.severity === 'critical' || r.severity === 'high').length;
  const scoreLabel = overallStatus === 'EXCELLENT' ? t('wellness.excellent') : overallStatus === 'GOOD' ? t('wellness.good') : overallStatus === 'FAIR' ? t('wellness.fair') : t('wellness.poor');
  const WELLNESS_MODULES = getWellnessModules(t);

  // If a module is selected, render it
  if (activeModule) {
    const module = WELLNESS_MODULES.find((m) => m.id === activeModule);
    const ModuleComponent = module?.component;

    return (
      <div className="space-y-4">
        {/* Back Navigation */}
        <button
          onClick={() => setActiveModule(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm font-medium">{t('nav.backToWellness')}</span>
        </button>

        {/* Module Content */}
        {ModuleComponent && <ModuleComponent />}
      </div>
    );
  }

  // Main wellness grid
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('wellness.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('wellness.subtitle')}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label={t('wellness.healthScore')}
          value={overallScore}
          subtext={scoreLabel}
          color={overallScore >= 80 ? 'text-emerald-600' : overallScore >= 60 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}
          bgColor={overallScore >= 80 ? 'bg-emerald-50' : overallScore >= 60 ? 'bg-green-50' : overallScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}
        />
        <QuickStat
          label={t('wellness.survivalMonths')}
          value={survivalMonths?.toFixed(1) ?? '0.0'}
          subtext={survivalMonths >= 6 ? t('wellness.targetMet') : t('wellness.buildTo6')}
          color={survivalMonths >= 6 ? 'text-emerald-600' : survivalMonths >= 3 ? 'text-amber-600' : 'text-red-600'}
          bgColor={survivalMonths >= 6 ? 'bg-emerald-50' : survivalMonths >= 3 ? 'bg-amber-50' : 'bg-red-50'}
        />
        <QuickStat
          label={t('wellness.savingsRate')}
          value={`${savingsRate.toFixed(0)}%`}
          subtext={savingsRate >= 20 ? t('wellness.above20') : t('wellness.target20')}
          color={savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 10 ? 'text-amber-600' : 'text-red-600'}
          bgColor={savingsRate >= 20 ? 'bg-emerald-50' : savingsRate >= 10 ? 'bg-amber-50' : 'bg-red-50'}
        />
        <QuickStat
          label={t('wellness.riskAlerts')}
          value={riskCount}
          subtext={riskCount === 0 ? t('wellness.allClear') : t('wellness.needAttention')}
          color={riskCount === 0 ? 'text-emerald-600' : 'text-red-600'}
          bgColor={riskCount === 0 ? 'bg-emerald-50' : 'bg-red-50'}
        />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {WELLNESS_MODULES.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onClick={() => setActiveModule(module.id)}
          />
        ))}
      </div>

      {/* Pro Tips Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
        <h3 className="font-semibold text-gray-900 mb-3">{t('wellness.tips.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800">{t('wellness.tips.trackDaily')}</p>
            <p className="text-gray-600 text-xs mt-1">
              {t('wellness.tips.trackDailyDesc')}
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800">{t('wellness.tips.automateSavings')}</p>
            <p className="text-gray-600 text-xs mt-1">
              {t('wellness.tips.automateSavingsDesc')}
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <p className="font-medium text-gray-800">{t('wellness.tips.reviewMonthly')}</p>
            <p className="text-gray-600 text-xs mt-1">
              {t('wellness.tips.reviewMonthlyDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ label, value, subtext, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
    </div>
  );
}

// Module Card Component
function ModuleCard({ module, onClick }) {
  const Icon = module.icon;

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 ${module.color} rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{module.name}</h3>
      <p className="text-xs text-gray-500">{module.description}</p>
    </button>
  );
}
