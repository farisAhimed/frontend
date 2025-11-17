import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { FireIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import MainLayout from '../layouts/MainLayout.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeStreak: 0,
    completionRate: 0,
    todayProgress: { completed: 0, total: 0 },
  });
  const [recentHabits, setRecentHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [habitsRes, analyticsRes] = await Promise.all([
        api.get('/habits/all'),
        api.get('/analytics/daily'),
      ]);

      if (habitsRes.success) {
        const habits = habitsRes.habits || [];
        const activeHabits = habits.filter(h => !h.archived && !h.paused);
        const totalStreak = activeHabits.reduce((sum, h) => sum + (h.streak || 0), 0);

        setStats({
          totalHabits: activeHabits.length,
          activeStreak: totalStreak,
          completionRate: analyticsRes.analytics?.completionRate || 0,
          todayProgress: {
            completed: analyticsRes.analytics?.completedHabits || 0,
            total: activeHabits.length,
          },
        });

        setRecentHabits(activeHabits.slice(0, 5));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const response = await api.post(`/habits/${habitId}/checkIn`);
      if (response.success) {
        toast.success(`Checked in! ${response.streak}-day streak! 🔥`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const progressPercentage = stats.todayProgress.total > 0
    ? (stats.todayProgress.completed / stats.todayProgress.total) * 100
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.dashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('dashboard.totalHabits')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalHabits}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900 rounded-md p-3">
                <FireIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('dashboard.activeStreak')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.activeStreak}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('dashboard.completionRate')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(stats.completionRate)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('dashboard.todayProgress')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.todayProgress.completed}/{stats.todayProgress.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.todayProgress')}
          </h2>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.todayProgress.completed} of {stats.todayProgress.total} habits completed today
          </p>
        </div>

        {/* Recent Habits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentActivity')}
            </h2>
            <Link
              to="/habits"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t('common.next')} →
            </Link>
          </div>
          {recentHabits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('habits.noHabits')}
              </p>
              <Link
                to="/habits/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('habits.createHabit')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHabits.map((habit) => {
                const today = new Date().toISOString().split('T')[0];
                const isCheckedIn = habit.completedDates?.includes(today);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h3>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
                          {habit.streak} {t('habits.streak')}
                        </span>
                        <span>{habit.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCheckIn(habit.id)}
                      disabled={isCheckedIn}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCheckedIn
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCheckedIn ? (
                        <span className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          {t('habits.checkedIn')}
                        </span>
                      ) : (
                        t('habits.checkIn')
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;







