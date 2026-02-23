import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setOnboardingCompleted, setProfile } from '../../store/slices/authSlice';
import profileService from '../../services/profile.service';

const OnboardingWizard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    dateOfBirth: '',
    city: '',
    employmentType: 'Salaried',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setData(d => ({ ...d, [field]: value }));

  const employmentTypes = [
    { value: 'Salaried', label: t('onboarding.about.salaried') },
    { value: 'Self-employed', label: t('onboarding.about.selfEmployed') },
    { value: 'Business', label: t('onboarding.about.business') },
  ];

  const handleFinish = async () => {
    setIsSaving(true);
    setError('');
    try {
      await profileService.updateProfile({
        name: data.name,
        dateOfBirth: data.dateOfBirth || undefined,
        city: data.city || undefined,
        employmentType: data.employmentType,
      });
      await profileService.updateOnboarding(1, true);
      dispatch(setProfile({ name: data.name, onboardingCompleted: true }));
      dispatch(setOnboardingCompleted(true));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWrong'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <p className="text-indigo-400 text-sm font-medium mb-1">{t('app.name')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{t('onboarding.about.title')}</h2>
            <p className="text-gray-400 text-sm">{t('onboarding.about.subtitle')}</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {t('onboarding.about.namePlaceholder')}
              </label>
              <input
                type="text"
                value={data.name}
                onChange={e => update('name', e.target.value)}
                placeholder={t('onboarding.about.nameExample')}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {t('onboarding.about.dob')}
              </label>
              <input
                type="date"
                value={data.dateOfBirth}
                onChange={e => update('dateOfBirth', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {t('onboarding.about.city')}
              </label>
              <input
                type="text"
                value={data.city}
                onChange={e => update('city', e.target.value)}
                placeholder={t('onboarding.about.cityExample')}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {t('onboarding.about.employmentType')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {employmentTypes.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update('employmentType', value)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      data.employmentType === value
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 pt-4 border-t border-gray-800">
        <button
          onClick={handleFinish}
          disabled={data.name.trim().length < 2 || isSaving}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
        >
          {isSaving ? t('onboarding.nav.saving') : t('onboarding.nav.finish')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
