/**
 * Create Habit Modal - Beautiful, comprehensive habit creation interface
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, ClockIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { HABIT_CATEGORIES, HABIT_DIFFICULTIES, DEFAULT_COLORS } from '../../config/constants.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const CreateHabitModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    frequency: {
      type: 'daily',
      days: [],
      dates: [],
      time: null
    },
    durationTarget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    difficulty: 'medium',
    color: DEFAULT_COLORS[0],
    timed: false
  });

  const totalSteps = 4;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        name: '',
        description: '',
        category: '',
        frequency: {
          type: 'daily',
          days: [],
          dates: [],
          time: null
        },
        durationTarget: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        difficulty: 'medium',
        color: DEFAULT_COLORS[0],
        timed: false
      });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        days: prev.frequency.days.includes(day)
          ? prev.frequency.days.filter(d => d !== day)
          : [...prev.frequency.days, day]
      }
    }));
  };

  const handleDateToggle = (date) => {
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        dates: prev.frequency.dates.includes(date)
          ? prev.frequency.dates.filter(d => d !== date)
          : [...prev.frequency.dates, date]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.frequency.type === 'weekly' && formData.frequency.days.length === 0) {
      toast.error('Please select at least one day for weekly habits');
      return;
    }
    
    // For daily habits, days selection is optional (empty = any day)

    if (formData.frequency.type === 'monthly' && formData.frequency.dates.length === 0) {
      toast.error('Please select at least one date for monthly habits');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API - convert dates to ISO strings
      const habitData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        // Clean up frequency - remove empty arrays, convert to null
        frequency: {
          ...formData.frequency,
          days: formData.frequency.days.length > 0 ? formData.frequency.days : null,
          dates: formData.frequency.dates.length > 0 ? formData.frequency.dates : null,
          time: formData.frequency.time || null
        }
      };

      const response = await api.post('/habits/create', habitData);
      console.log('Create habit response:', response); // Debug log
      if (response.success) {
        toast.success('Habit created successfully! 🎉');
        // Close modal first
        onClose();
        // Wait a bit to ensure the backend has saved the data, then refresh
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      }
    } catch (error) {
      console.error('Create habit error:', error);
      toast.error(error.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { value: 0, label: 'Sun', full: 'Sunday' },
    { value: 1, label: 'Mon', full: 'Monday' },
    { value: 2, label: 'Tue', full: 'Tuesday' },
    { value: 3, label: 'Wed', full: 'Wednesday' },
    { value: 4, label: 'Thu', full: 'Thursday' },
    { value: 5, label: 'Fri', full: 'Friday' },
    { value: 6, label: 'Sat', full: 'Saturday' }
  ];

  const monthDates = Array.from({ length: 31 }, (_, i) => i + 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Create New Habit</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Habit Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Drink 8 glasses of water"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Add a description to help you remember why this habit matters..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <TagIcon className="h-5 w-5 mr-2" />
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {HABIT_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleChange('category', category)}
                          className={`px-4 py-3 rounded-xl border font-medium transition-all transform hover:scale-105 shadow-sm ${
                            formData.category === category
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Color Tag
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleChange('color', color)}
                          className={`w-12 h-12 rounded-full border-2 transition-all transform hover:scale-110 ${
                            formData.color === color
                              ? 'border-gray-900 dark:border-white scale-110 shadow-md ring-2 ring-blue-500'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Frequency & Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <CalendarIcon className="h-5 w-5 inline mr-2" />
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['daily', 'weekly', 'monthly'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleChange('frequency.type', type)}
                          className={`px-4 py-3 rounded-xl border font-medium capitalize transition-all transform hover:scale-105 shadow-sm ${
                            formData.frequency.type === type
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Days Selection - For Daily and Weekly */}
                  {(formData.frequency.type === 'daily' || formData.frequency.type === 'weekly') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {formData.frequency.type === 'daily' 
                          ? 'Select Days (Optional - leave empty for every day)' 
                          : 'Select Days'}
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleDayToggle(day.value)}
                            className={`px-3 py-2 rounded-lg border font-medium transition-all shadow-sm ${
                              formData.frequency.days.includes(day.value)
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {formData.frequency.type === 'daily' && formData.frequency.days.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          No days selected = habit can be done any day
                        </p>
                      )}
                    </div>
                  )}

                  {/* Monthly Dates Selection */}
                  {formData.frequency.type === 'monthly' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Select Dates (1-31)
                      </label>
                      <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2">
                        {monthDates.map((date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => handleDateToggle(date)}
                            className={`px-3 py-2 rounded-lg border font-medium transition-all shadow-sm ${
                              formData.frequency.dates.includes(date)
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Specific Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={formData.frequency.time || ''}
                      onChange={(e) => handleChange('frequency.time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg shadow-sm"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Set a specific time for reminders (e.g., 6:00 AM for morning meditation)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duration Target (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.durationTarget}
                      onChange={(e) => handleChange('durationTarget', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 20 for 20 minutes"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg shadow-sm"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      How long should this habit take? (0 = no time limit)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {HABIT_DIFFICULTIES.map((difficulty) => (
                        <button
                          key={difficulty}
                          type="button"
                          onClick={() => handleChange('difficulty', difficulty)}
                          className={`px-4 py-3 rounded-xl border font-medium capitalize transition-all transform hover:scale-105 shadow-sm ${
                            formData.difficulty === difficulty
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          {difficulty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <input
                      type="checkbox"
                      id="timed"
                      checked={formData.timed}
                      onChange={(e) => handleChange('timed', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="timed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Pomodoro Timer
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        min={formData.startDate}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review Your Habit</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{formData.name}</span>
                      </div>
                      {formData.description && (
                        <div className="flex items-start">
                          <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Description:</span>
                          <span className="text-gray-700 dark:text-gray-300 flex-1">{formData.description}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                          {formData.category}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Frequency:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {formData.frequency.type}
                          {formData.frequency.type === 'weekly' && formData.frequency.days.length > 0 && (
                            <span className="ml-2 text-sm">
                              ({formData.frequency.days.map(d => weekDays.find(w => w.value === d)?.label).join(', ')})
                            </span>
                          )}
                          {formData.frequency.type === 'monthly' && formData.frequency.dates.length > 0 && (
                            <span className="ml-2 text-sm">
                              (Days: {formData.frequency.dates.join(', ')})
                            </span>
                          )}
                        </span>
                      </div>
                      {formData.frequency.time && (
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Time:</span>
                          <span className="text-gray-900 dark:text-white">{formData.frequency.time}</span>
                        </div>
                      )}
                      {formData.durationTarget > 0 && (
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="text-gray-900 dark:text-white">{formData.durationTarget} minutes</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium capitalize">
                          {formData.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i + 1 === currentStep
                        ? 'bg-blue-600 w-8'
                        : i + 1 < currentStep
                        ? 'bg-blue-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating...' : 'Create Habit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHabitModal;

