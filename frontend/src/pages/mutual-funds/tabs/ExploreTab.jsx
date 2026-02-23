import { useTranslation } from 'react-i18next';
import { TrendingUp, BarChart2, Shuffle, Shield, LineChart, Landmark, ChevronRight, Calendar, Calculator, Activity } from 'lucide-react';

const QUICK_TOOLS = [
  {
    id: 'events',
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    onClick: () => window.open('/WealthElementsv25/8-events-calculator/8-events.html', '_blank'),
  },
  {
    id: 'calculators',
    icon: Calculator,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    onClick: () => {},
  },
  {
    id: 'snapshot',
    icon: Activity,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    onClick: () => {},
  },
];

const COLLECTIONS = [
  { id: 'high-return', key: 'highReturn', emoji: '🚀' },
  { id: 'tax-saving',  key: 'taxSaving',  emoji: '💰' },
  { id: 'sip-500',     key: 'sip500',     emoji: '📅' },
  { id: 'low-risk',    key: 'lowRisk',    emoji: '🛡️' },
  { id: 'index',       key: 'index',      emoji: '📊' },
  { id: 'short-term',  key: 'shortTerm',  emoji: '⚡' },
];

const FUND_TYPES = [
  { id: 'equity', icon: TrendingUp, iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    riskColor: 'text-red-500'    },
  { id: 'debt',   icon: Landmark,   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   riskColor: 'text-emerald-500'},
  { id: 'hybrid', icon: Shuffle,    iconBg: 'bg-purple-100',  iconColor: 'text-purple-600',  riskColor: 'text-amber-500'  },
  { id: 'elss',   icon: Shield,     iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', riskColor: 'text-red-500'    },
  { id: 'index',  icon: BarChart2,  iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600',  riskColor: 'text-amber-500'  },
  { id: 'liquid', icon: LineChart,  iconBg: 'bg-cyan-100',    iconColor: 'text-cyan-600',    riskColor: 'text-emerald-500'},
];

const ExploreTab = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('mutualFunds.explore.title')}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('mutualFunds.explore.subtitle')}</p>
      </div>

      {/* 8 Events — featured card */}
      <button
        onClick={() => window.open('/WealthElementsv25/8-events-calculator/8-events.html', '_blank')}
        style={{ background: 'linear-gradient(135deg, #2563eb, #4338ca)' }}
        className="w-full text-left rounded-2xl p-5 shadow-md hover:shadow-lg transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Calendar className="w-6 h-6" style={{ color: '#ffffff' }} />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            {t('mutualFunds.explore.featured')}
          </span>
        </div>
        <p className="font-bold text-lg leading-tight" style={{ color: '#ffffff' }}>{t('mutualFunds.explore.lifeEventsTitle')}</p>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {t('mutualFunds.explore.lifeEventsDesc')}
        </p>
        <div className="flex items-center gap-1 mt-4 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {t('mutualFunds.explore.startPlanning')}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Other Quick Tools */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.explore.quickTools')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_TOOLS.filter(tool => tool.id !== 'events').map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.onClick}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className={`w-10 h-10 ${tool.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{t(`mutualFunds.explore.tools.${tool.id}.title`)}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t(`mutualFunds.explore.tools.${tool.id}.subtitle`)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Collections */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.explore.popularCollections')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl mb-2 block">{col.emoji}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors mt-0.5" />
              </div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{t(`mutualFunds.explore.collections.${col.key}.label`)}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{t(`mutualFunds.explore.collections.${col.key}.desc`)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fund Types */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.explore.fundTypes')}</h2>
        <div className="space-y-3">
          {FUND_TYPES.map((fund) => {
            const Icon = fund.icon;
            return (
              <button
                key={fund.id}
                className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-start gap-4"
              >
                <div className={`w-10 h-10 ${fund.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${fund.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{t(`mutualFunds.explore.funds.${fund.id}.name`)}</p>
                    <span className={`text-xs font-medium ${fund.riskColor}`}>
                      {t('mutualFunds.explore.risk', { level: t(`mutualFunds.explore.funds.${fund.id}.risk`) })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(`mutualFunds.explore.funds.${fund.id}.desc`)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('mutualFunds.explore.recommendedHorizon')} <span className="font-medium text-gray-600">{t(`mutualFunds.explore.funds.${fund.id}.horizon`)}</span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Finvu nudge */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <p className="text-emerald-800 text-sm font-semibold mb-0.5">{t('mutualFunds.explore.connectTitle')}</p>
        <p className="text-emerald-700 text-xs leading-relaxed">
          {t('mutualFunds.explore.connectDesc')}
        </p>
      </div>
    </div>
  );
};

export default ExploreTab;
