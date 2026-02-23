import { useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'mutual-funds', label: 'Mutual Funds', icon: TrendingUp, path: '/mutual-funds' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  active ? 'bg-gray-100' : ''
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
                />
              </div>
              <span className={`text-xs mt-0.5 ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
