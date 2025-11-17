import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout.jsx';
import { BellIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('notifications.notifications')}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t('notifications.noNotifications')}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Notifications will appear here when you receive reminders and updates
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;







