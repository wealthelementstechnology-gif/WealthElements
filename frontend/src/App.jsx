import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReduxProvider } from './store/provider';
import './index.css';

// Pages
import { Dashboard } from './pages/dashboard';
import { AuthPage } from './pages/auth';
import { Settings } from './pages/settings';
import { MutualFunds } from './pages/mutual-funds';
import { EventsCalculator } from './pages/events-calculator';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import { AIChat } from './pages/ai-chat';

function App() {
  return (
    <ReduxProvider>
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Onboarding — shown once after first login */}
          <Route path="/onboarding" element={<OnboardingWizard />} />

          {/* Main App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mutual-funds" element={<MutualFunds />} />
          <Route path="/events-calculator" element={<EventsCalculator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-chat" element={<AIChat />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ReduxProvider>
  );
}

export default App;
