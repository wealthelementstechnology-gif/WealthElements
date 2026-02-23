import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '../../components/layout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { authService } from '../../services';
import { logout } from '../../store/slices/authSlice';

const SettingItem = ({ icon: Icon, label, description, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors
      ${danger ? 'text-red-600' : 'text-gray-900'}
    `}
  >
    <div
      className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        ${danger ? 'bg-red-100' : 'bg-gray-100'}
      `}
    >
      <Icon className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-gray-600'}`} />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium">{label}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/auth');
  };

  const handleResetData = () => {
    authService.resetAllData();
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
        </div>

        {/* Account Section */}
        <Card className="mb-4" padding="p-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
            {t('settings.account')}
          </p>
          <SettingItem
            icon={User}
            label={t('settings.profile')}
            description={t('settings.profileDesc')}
            onClick={() => {}}
          />
          <SettingItem
            icon={Lock}
            label={t('settings.changePin')}
            description={t('settings.changePinDesc')}
            onClick={() => {}}
          />
          <SettingItem
            icon={Shield}
            label={t('settings.privacy')}
            description={t('settings.privacyDesc')}
            onClick={() => {}}
          />
        </Card>

        {/* Preferences Section */}
        <Card className="mb-4" padding="p-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
            {t('settings.preferences')}
          </p>
          <SettingItem
            icon={Bell}
            label={t('settings.notifications')}
            description={t('settings.notificationsDesc')}
            onClick={() => {}}
          />
        </Card>

        {/* Support Section */}
        <Card className="mb-4" padding="p-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
            {t('settings.support')}
          </p>
          <SettingItem
            icon={HelpCircle}
            label={t('settings.helpFaq')}
            description={t('settings.helpFaqDesc')}
            onClick={() => {}}
          />
        </Card>

        {/* Danger Zone */}
        <Card padding="p-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
            {t('settings.dangerZone')}
          </p>
          <SettingItem
            icon={LogOut}
            label={t('settings.logout')}
            onClick={() => setShowLogoutModal(true)}
          />
          <SettingItem
            icon={Trash2}
            label={t('settings.resetData')}
            description={t('settings.resetDataDesc')}
            onClick={() => setShowResetModal(true)}
            danger
          />
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 mt-8">
          {t('app.version')}
        </p>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('settings.logout')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.logoutConfirm')}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowLogoutModal(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="primary" fullWidth onClick={handleLogout}>
            {t('settings.logout')}
          </Button>
        </div>
      </Modal>

      {/* Reset Data Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={t('settings.resetData')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.resetConfirm')}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowResetModal(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="danger" fullWidth onClick={handleResetData}>
            {t('settings.deleteEverything')}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default Settings;
