import { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { fetchAccounts } from '../../store/slices/networthSlice';
import { fetchTransactions, fetchMonthlySummary } from '../../store/slices/transactionSlice';
import { fetchSubscriptions } from '../../store/slices/subscriptionSlice';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { setOnboardingCompleted, setProfile } from '../../store/slices/authSlice';

const PERSONAS = [
  {
    id: 'salaried',
    name: 'Rohan Sharma',
    role: 'Salaried Professional',
    income: '₹1.2L/month',
    emoji: '💼',
    color: 'indigo',
    highlights: ['HDFC + SBI savings accounts', 'Stocks & Mutual Funds', 'Car loan + Credit card', '4 financial goals'],
  },
  {
    id: 'selfemployed',
    name: 'Priya Mehta',
    role: 'Freelancer / Business Owner',
    income: '₹2L/month',
    emoji: '🚀',
    color: 'violet',
    highlights: ['Current + savings accounts', 'Stocks & Real Estate', 'Home loan (₹48L)', 'Retirement & Education goals'],
  },
  {
    id: 'student',
    name: 'Arjun Nair',
    role: 'Student / Intern',
    income: '₹25K/month',
    emoji: '🎓',
    color: 'emerald',
    highlights: ['SBI student account', 'Starter stock portfolio', 'Education loan (₹8L)', 'Building first emergency fund'],
  },
  {
    id: 'sumit',
    name: 'Sumit Verma',
    role: 'Mid-level Engineer — Debt Recovery',
    income: '₹85K/month',
    emoji: '📈',
    color: 'rose',
    highlights: ['Started deeply in debt', 'Personal loan + credit card dues', 'Now turning net worth positive', 'Side income fueling recovery'],
  },
];

const colorMap = {
  indigo: { border: 'border-indigo-500', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500', badge: 'bg-indigo-500/20 text-indigo-300', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  violet: { border: 'border-violet-500', bg: 'bg-violet-500/10', ring: 'ring-violet-500', badge: 'bg-violet-500/20 text-violet-300', btn: 'bg-violet-600 hover:bg-violet-700' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  rose: { border: 'border-rose-500', bg: 'bg-rose-500/10', ring: 'ring-rose-500', badge: 'bg-rose-500/20 text-rose-300', btn: 'bg-rose-600 hover:bg-rose-700' },
};

const SampleDataModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('salaried');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/seed/demo-data', { persona: selected });

      // Reload all data into Redux
      const now = new Date();
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchTransactions({ limit: 100 })),
        dispatch(fetchMonthlySummary({ month: now.getMonth() + 1, year: now.getFullYear() })),
        dispatch(fetchSubscriptions()),
        dispatch(fetchGoals()),
      ]);

      const persona = PERSONAS.find(p => p.id === selected);
      dispatch(setProfile({ name: persona.name, onboardingCompleted: true }));
      dispatch(setOnboardingCompleted(true));

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sample data. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPersona = PERSONAS.find(p => p.id === selected);
  const colors = colorMap[selectedPersona.color];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal — sits above the 64px bottom nav on mobile */}
      <div className="relative w-full sm:max-w-lg bg-gray-900 rounded-t-3xl sm:rounded-2xl border border-gray-800 mx-0 sm:mx-4 shadow-2xl flex flex-col max-h-[calc(90vh-4rem)] sm:max-h-[90vh] mb-16 sm:mb-0">

        {/* Handle bar + Header — fixed */}
        <div className="p-6 pb-0 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5 sm:hidden" />
          <h2 className="text-xl font-bold text-white">Load sample data</h2>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            Pick a financial persona to instantly populate your dashboard with realistic data.
          </p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6">

        {/* Persona selector */}
        <div className="space-y-3 mb-5">
          {PERSONAS.map(persona => {
            const c = colorMap[persona.color];
            const isSelected = selected === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => setSelected(persona.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? `${c.border} ${c.bg} ring-1 ${c.ring}`
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{persona.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{persona.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>
                        {persona.income}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{persona.role}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? `${c.border} ${c.bg}` : 'border-gray-600'
                  }`}>
                    {isSelected && <div className={`w-2 h-2 rounded-full ${c.btn.split(' ')[0].replace('bg-', 'bg-')}`} />}
                  </div>
                </div>

                {/* Highlights — only show when selected */}
                {isSelected && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {persona.highlights.map((h, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-lg ${c.badge}`}>
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        </div>{/* end scrollable body */}

        {/* Fixed footer */}
        <div className="p-6 pt-4 flex-shrink-0 border-t border-gray-800">
          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
            <span className="text-amber-400 text-sm">⚠️</span>
            <p className="text-amber-300 text-xs leading-relaxed">
              This will <strong>replace</strong> any existing accounts, transactions, subscriptions and goals with sample data.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-40 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleLoad}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50 ${colors.btn}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                `Load ${selectedPersona.name}'s data`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleDataModal;
