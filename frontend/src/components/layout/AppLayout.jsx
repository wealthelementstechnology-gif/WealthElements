import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
