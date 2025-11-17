/**
 * Habits Page - Beautiful habit management with search, filter, and modern UI
 */

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api.js";
import toast from "react-hot-toast";
import {
  PlusIcon,
  FireIcon,
  PauseIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  FireIcon as FireIconSolid,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import MainLayout from "../layouts/MainLayout.jsx";
import CreateHabitModal from "../components/habits/CreateHabitModal.jsx";
import { HABIT_CATEGORIES } from "../config/constants.js";

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // recent, streak, name
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHabits();
  }, []);

  // Filter and sort habits
  useEffect(() => {
    let filtered = [...habits];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (habit) =>
          habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          habit.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((habit) => habit.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter((habit) => 
          (habit.status === "active" || (!habit.status && !habit.paused && !habit.archived)) && 
          !habit.paused && 
          !habit.archived
        );
      } else if (selectedStatus === "paused") {
        filtered = filtered.filter((habit) => habit.paused || habit.status === "paused");
      } else if (selectedStatus === "archived") {
        filtered = filtered.filter((habit) => habit.archived || habit.status === "archived");
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "streak":
          return (b.streak || 0) - (a.streak || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
    });

    setFilteredHabits(filtered);
  }, [habits, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/habits/all?archived=false");
      console.log('Fetched habits:', response); // Debug log
      if (response.success) {
        const habitsList = response.habits || [];
        console.log('Setting habits:', habitsList); // Debug log
        setHabits(habitsList);
      } else {
        console.error('Failed to fetch habits:', response);
        toast.error("Failed to load habits");
      }
    } catch (error) {
      console.error('Fetch habits error:', error);
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const response = await api.post(`/habits/${habitId}/checkIn`);
      if (response.success) {
        toast.success(`Checked in! ${response.streak}-day streak! 🔥`);
        fetchHabits();
      }
    } catch (error) {
      toast.error(error.message || "Failed to check in");
    }
  };

  const handlePause = async (habitId) => {
    try {
      const response = await api.patch(`/habits/${habitId}/pause`);
      if (response.success) {
        toast.success(response.message);
        fetchHabits();
      }
    } catch (error) {
      toast.error("Failed to pause habit");
    }
  };

  const handleArchive = async (habitId) => {
    if (!window.confirm("Are you sure you want to archive this habit?")) return;

    try {
      const response = await api.patch(`/habits/${habitId}/archive`);
      if (response.success) {
        toast.success("Habit archived");
        fetchHabits();
      }
    } catch (error) {
      toast.error("Failed to archive habit");
    }
  };

  const activeHabitsCount = habits.filter((h) => 
    (h.status === "active" || (!h.status && !h.paused && !h.archived)) && !h.paused && !h.archived
  ).length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your habits...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">My Habits</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Habit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-90">Active Habits</div>
              <div className="text-3xl font-bold">{activeHabitsCount}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-90">Total Streak</div>
              <div className="text-3xl font-bold flex items-center">
                <FireIconSolid className="h-6 w-6 mr-1" />
                {totalStreak}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-90">Total Habits</div>
              <div className="text-3xl font-bold">{habits.length}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              <option value="all">All Categories</option>
              {HABIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            >
              <option value="recent">Recent</option>
              <option value="streak">Streak (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {filteredHabits.length !== habits.length && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredHabits.length} of {habits.length} habits
          </div>
        )}

        {/* Habits Grid */}
        {filteredHabits.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {habits.length === 0 ? "No habits yet" : "No habits match your filters"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {habits.length === 0
                ? "Start building better habits today!"
                : "Try adjusting your search or filters"}
            </p>
            {habits.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Habit
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHabits.map((habit) => {
              const isCheckedIn = habit.completedDates?.includes(today);
              const habitColor = habit.color || "#3B82F6";
              
              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 overflow-hidden border-l-2"
                  style={{ borderLeftColor: habitColor }}
                >
                  {/* Habit Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {habit.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className="px-3 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: `${habitColor}20`,
                              color: habitColor,
                            }}
                          >
                            {habit.category}
                          </span>
                          {habit.paused && (
                            <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                              Paused
                            </span>
                          )}
                          {habit.difficulty && (
                            <span className="px-3 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                              {habit.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Streak Display */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                      <div className="flex items-center">
                        <FireIconSolid className="h-6 w-6 text-orange-500 mr-2" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {habit.streak || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">day streak</div>
                        </div>
                      </div>
                      {habit.longestStreak > 0 && habit.longestStreak !== habit.streak && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Best: {habit.longestStreak}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Frequency Info */}
                    {habit.frequency && (
                      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Frequency:</span>{" "}
                        <span className="capitalize">{habit.frequency.type || "daily"}</span>
                        {habit.frequency.time && (
                          <span className="ml-2">at {habit.frequency.time}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCheckIn(habit.id)}
                        disabled={isCheckedIn || habit.paused}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                          isCheckedIn
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed"
                            : habit.paused
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        }`}
                      >
                        {isCheckedIn ? (
                          <span className="flex items-center justify-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Checked In
                          </span>
                        ) : (
                          "Check In"
                        )}
                      </button>
                      <button
                        onClick={() => handlePause(habit.id)}
                        className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title={habit.paused ? "Resume" : "Pause"}
                      >
                        <PauseIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/habits/${habit.id}`)}
                        className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <SparklesIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          // Also refresh when modal closes (in case user closes without creating)
          setTimeout(() => fetchHabits(), 100);
        }}
        onSuccess={() => {
          // Refresh habits after successful creation
          fetchHabits();
        }}
      />
    </MainLayout>
  );
};

export default Habits;
