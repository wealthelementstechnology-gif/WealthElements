import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">PeaK Finance</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <Link
            to="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl mb-1
              transition-colors duration-150
              ${isActive('/dashboard')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('nav.dashboard')}
          </Link>
        </nav>

        {/* Settings Link */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1">
          <LanguageSwitcher />
          <Link
            to="/settings"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl
              transition-colors duration-150
              ${isActive('/settings')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <Settings className="w-5 h-5" />
            {t('nav.settings')}
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PeaK Finance</span>
          </div>

          {/* Settings Icon */}
          <Link
            to="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>
    </>
  );
};

export default Sidebar;
