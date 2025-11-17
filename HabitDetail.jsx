/**
 * Habit Detail Page - View detailed information about a specific habit
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  FireIcon,
  PauseIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  FireIcon as FireIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import MainLayout from '../layouts/MainLayout.jsx';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [habit, setHabit] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchHabit();
    fetchCheckIns();
  }, [id]);

  const fetchHabit = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/habits/${id}`);
      if (response.success) {
        setHabit(response.habit);
      } else {
        toast.error('Failed to load habit');
        navigate('/habits');
      }
    } catch (error) {
      console.error('Fetch habit error:', error);
      toast.error('Failed to load habit');
      navigate('/habits');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = async () => {
    try {
      const response = await api.get(`/checkins/habit/${id}`);
      if (response.success) {
        setCheckIns(response.checkIns || []);
      }
    } catch (error) {
      console.error('Fetch check-ins error:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await api.post('/checkins', {
        habitId: id,
        completed: true,
        date: new Date().toISOString(),
      });
      if (response.success) {
        toast.success(`Checked in! ${response.streak?.currentStreak || 0}-day streak! 🔥`);
        fetchHabit();
        fetchCheckIns();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handlePause = async () => {
    try {
      const response = await api.patch(`/habits/${id}/pause`);
      if (response.success) {
        toast.success(response.message);
        fetchHabit();
      }
    } catch (error) {
      toast.error('Failed to pause habit');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this habit?')) return;

    try {
      const response = await api.patch(`/habits/${id}/archive`);
      if (response.success) {
        toast.success('Habit archived');
        navigate('/habits');
      }
    } catch (error) {
      toast.error('Failed to archive habit');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading habit details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!habit) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Habit not found</p>
          <Link to="/habits" className="text-blue-600 hover:text-blue-700">
            Back to Habits
          </Link>
        </div>
      </MainLayout>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isCheckedIn = habit.completedDates?.includes(today);
  const habitColor = habit.color || '#3B82F6';
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/habits')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Habits
          </button>
        </div>

        {/* Habit Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-2 overflow-hidden"
          style={{ borderLeftColor: habitColor }}
        >
          <div className="p-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {habit.name}
                </h1>
                {habit.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{habit.description}</p>
                )}
                <div className="flex items-center space-x-2 flex-wrap">
                  <span
                    className="px-3 py-1 text-sm font-semibold rounded-full"
                    style={{
                      backgroundColor: `${habitColor}20`,
                      color: habitColor,
                    }}
                  >
                    {habit.category}
                  </span>
                  {habit.difficulty && (
                    <span className="px-3 py-1 text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                      {habit.difficulty}
                    </span>
                  )}
                  {habit.paused && (
                    <span className="px-3 py-1 text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                      Paused
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Streak Display */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FireIconSolid className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {habit.streak || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">day streak</div>
                  </div>
                </div>
                {habit.longestStreak > 0 && habit.longestStreak !== habit.streak && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {habit.longestStreak}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Habit Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Frequency</div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {habit.frequency?.type || 'daily'}
                    {habit.frequency?.type === 'weekly' && habit.frequency?.days && (
                      <span className="ml-2 text-sm font-normal">
                        ({habit.frequency.days.map(d => weekDays[d]).join(', ')})
                      </span>
                    )}
                    {habit.frequency?.type === 'monthly' && habit.frequency?.dates && (
                      <span className="ml-2 text-sm font-normal">
                        (Days: {habit.frequency.dates.join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {habit.frequency?.time && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {habit.frequency.time}
                    </div>
                  </div>
                </div>
              )}

              {habit.durationTarget > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {habit.durationTarget} minutes
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Completions</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {habit.totalCompletions || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn || habit.paused || checkingIn}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isCheckedIn
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                    : habit.paused
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                }`}
              >
                {isCheckedIn ? (
                  <span className="flex items-center justify-center">
                    <CheckCircleIconSolid className="h-5 w-5 mr-2" />
                    Checked In Today
                  </span>
                ) : checkingIn ? (
                  'Checking In...'
                ) : (
                  'Check In'
                )}
              </button>
              <button
                onClick={handlePause}
                className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                title={habit.paused ? 'Resume' : 'Pause'}
              >
                <PauseIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleArchive}
                className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                title="Archive"
              >
                <ArchiveBoxIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Check-ins */}
        {checkIns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Check-ins
            </h2>
            <div className="space-y-3">
              {checkIns.slice(0, 10).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(checkIn.date).toLocaleDateString()}
                      </div>
                      {checkIn.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {checkIn.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  {checkIn.completionPercentage && (
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {checkIn.completionPercentage}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HabitDetail;


