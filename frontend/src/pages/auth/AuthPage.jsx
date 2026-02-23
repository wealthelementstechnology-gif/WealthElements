import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setAuthenticated, setOnboardingCompleted } from '../../store/slices/authSlice';
import authService from '../../services/auth.service';

// ─── Main Auth Page ───────────────────────────────────────────────────────────
const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clearError = () => setError('');

  const finishAuth = (result) => {
    localStorage.setItem('accessToken', result.accessToken);
    const onboardingCompleted = result.user.profile?.onboardingCompleted || false;
    dispatch(setAuthenticated({
      isAuthenticated: true,
      userId: result.user.id,
      phone: result.user.phone,
      profile: result.user.profile,
    }));
    dispatch(setOnboardingCompleted(onboardingCompleted));
    navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    clearError();
    try {
      const result = isLogin
        ? await authService.login(phone, password)
        : await authService.register(phone, password);
      finishAuth(result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">{t('app.name')}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">

          <h1 className="text-2xl font-bold text-center mb-2">
            {isLogin ? t('auth.welcomeBack') : t('auth.welcome')}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4">
              <span className="text-gray-400 font-semibold">{t('auth.countryCode')}</span>
              <div className="w-px h-6 bg-gray-700" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); clearError(); }}
                placeholder={t('auth.mobilePlaceholder')}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-lg outline-none"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                placeholder="Password (min. 6 characters)"
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-lg outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 10 || password.length < 6}
              className="w-full py-4 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.pleaseWait') : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle login / register */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(v => !v); clearError(); }}
              className="text-emerald-400 font-medium hover:text-emerald-300"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
