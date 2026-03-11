import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxProvider } from './store/provider';
import { setAuthenticated, setOnboardingCompleted, setInitialized } from './store/slices/authSlice';
import api from './services/api';
import './index.css';

// Pages
import { Dashboard } from './pages/dashboard';
import { AuthPage } from './pages/auth';
import { Settings } from './pages/settings';
import { MutualFunds } from './pages/mutual-funds';
import { EventsCalculator } from './pages/events-calculator';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import { AIChat } from './pages/ai-chat';

function AppRoutes() {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch(setInitialized());
      return;
    }

    // Refresh access token using httpOnly refresh cookie, then fetch user
    api.post('/auth/refresh')
      .then(res => {
        localStorage.setItem('accessToken', res.data.data.accessToken);
        return api.get('/auth/me');
      })
      .then(res => {
        const user = res.data.data;
        dispatch(setAuthenticated({
          isAuthenticated: true,
          userId: user._id || user.id,
          phone: user.phone,
          profile: user.profile,
        }));
        dispatch(setOnboardingCompleted(user.profile?.onboardingCompleted || false));
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
      })
      .finally(() => {
        dispatch(setInitialized());
      });
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mutual-funds" element={<MutualFunds />} />
        <Route path="/events-calculator" element={<EventsCalculator />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ReduxProvider>
      <AppRoutes />
    </ReduxProvider>
  );
}

export default App;
