import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import MainLayout from '../layouts/MainLayout.jsx';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endpoints = {
        daily: '/analytics/daily',
        weekly: '/analytics/weekly',
        monthly: '/analytics/monthly',
        categories: '/analytics/categories',
      };

      const [daily, weekly, monthly, categories] = await Promise.all([
        api.get(endpoints.daily),
        api.get(endpoints.weekly),
        api.get(endpoints.monthly),
        api.get(endpoints.categories),
      ]);

      console.log('Analytics data:', { daily, weekly, monthly, categories }); // Debug log

      if (daily.success) {
        console.log('Daily analytics:', daily.analytics);
        setDailyData(daily.analytics);
      } else {
        console.error('Daily analytics failed:', daily);
      }

      if (weekly.success) {
        console.log('Weekly analytics:', weekly.analytics);
        setWeeklyData(weekly.analytics);
      } else {
        console.error('Weekly analytics failed:', weekly);
      }

      if (monthly.success) {
        console.log('Monthly analytics:', monthly.analytics);
        setMonthlyData(monthly.analytics);
      } else {
        console.error('Monthly analytics failed:', monthly);
      }

      if (categories.success) {
        console.log('Category analytics:', categories.analytics);
        setCategoryData(categories.analytics);
      } else {
        console.error('Category analytics failed:', categories);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
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

  const weeklyChartData = weeklyData?.dailyData?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    completed: day.completed,
    total: day.total,
  })) || [];

  const monthlyChartData = monthlyData?.dailyData?.map((day) => ({
    day: day.day,
    completed: day.completed,
    total: day.total,
  })) || [];

  const categoryChartData = categoryData?.categories?.map((cat) => ({
    name: cat.category,
    value: cat.totalHabits,
    streak: cat.averageStreak,
  })) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('analytics.analytics')}
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['daily', 'weekly', 'monthly', 'categories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t(`analytics.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Daily Analytics */}
        {activeTab === 'daily' && dailyData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('analytics.daily')} - {new Date(dailyData.date).toLocaleDateString()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Habits</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {dailyData.totalHabits || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed Today</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {dailyData.completedHabits || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(dailyData.completionRate || 0)}%
                </p>
              </div>
            </div>
            
            {/* Habit List */}
            {dailyData.habits && dailyData.habits.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Habit Status
                </h3>
                <div className="space-y-2">
                  {dailyData.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        habit.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {habit.completed ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {habit.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {habit.category} • Streak: {habit.streak || 0} days
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weekly Analytics */}
        {activeTab === 'weekly' && weeklyData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('analytics.weekly')} - {new Date(weeklyData.weekStart).toLocaleDateString()} to {new Date(weeklyData.weekEnd).toLocaleDateString()}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3B82F6" name="Completed" />
                <Bar dataKey="total" fill="#E5E7EB" name="Total" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Habits</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {weeklyData.totalHabits || 0}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completions</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {weeklyData.totalCompletions || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Daily</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(weeklyData.averageDaily || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Analytics */}
        {activeTab === 'monthly' && monthlyData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {monthlyData.monthName} {monthlyData.year}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#3B82F6" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Habits</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {monthlyData.totalHabits || 0}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completions</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {monthlyData.totalCompletions || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Daily</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(monthlyData.averageDaily || 0)}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(monthlyData.completionRate || 0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Analytics */}
        {activeTab === 'categories' && categoryData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('analytics.categories')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {categoryData.categories.map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cat.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.totalHabits} habits • Avg streak: {cat.averageStreak}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;






