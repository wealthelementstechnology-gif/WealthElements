import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout';
import DashboardTab from './tabs/DashboardTab';
import ExploreTab from './tabs/ExploreTab';
import SIPsTab from './tabs/SIPsTab';

const MutualFunds = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const MF_TABS = [
    { id: 'dashboard', label: t('mutualFunds.tabs.dashboard') },
    { id: 'explore',   label: t('mutualFunds.tabs.explore')   },
    { id: 'sips',      label: t('mutualFunds.tabs.sips')      },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'explore':   return <ExploreTab />;
      case 'sips':      return <SIPsTab />;
      default:          return <DashboardTab />;
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6">

        {/* Tab Navigation — same style as Home screen */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-hide">
            {MF_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTab()}
        </div>

      </div>
    </AppLayout>
  );
};

export default MutualFunds;
