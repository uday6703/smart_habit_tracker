import React, { useState, useEffect } from 'react';
import { habitAPI } from '../services/api';
import Navbar from '../components/Navbar';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import LogModal from '../components/LogModal';
import HabitStackBuilder from '../components/HabitStackBuilder';
import StreakModal from '../components/StreakModal';
import { Plus, Search, Filter, Calendar, Zap, Flame, Trophy, X } from 'lucide-react';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals status
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabitForDetailedLog, setSelectedHabitForDetailedLog] = useState(null);
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState(null);

  const [stackCompletionMessage, setStackCompletionMessage] = useState('');

  // Streak toast notification state
  const [streakToast, setStreakToast] = useState(null);

  const fetchHabits = async () => {
    try {
      const response = await habitAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const triggerBrowserNotification = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  const showStreakToast = (data) => {
    const habitName = data.habitName || 'Habit';
    const currentStreak = data.currentStreak || 1;
    const longestStreak = data.longestStreak || currentStreak;
    const isNewBest = currentStreak >= longestStreak && currentStreak > 1;

    setStreakToast({
      habitName,
      currentStreak,
      longestStreak,
      isNewBest,
    });

    // Browser notification
    const streakMsg = isNewBest
      ? `🏆 New personal best! ${currentStreak}-day streak on "${habitName}"!`
      : `🔥 ${currentStreak}-day streak on "${habitName}"! Keep going!`;
    triggerBrowserNotification('Streak Updated!', streakMsg);

    // Auto-dismiss after 6 seconds
    setTimeout(() => setStreakToast(null), 6000);
  };

  const handleQuickLog = async (habitId) => {
    // Optimistic UI: instantly mark as completed
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, completedToday: true, currentStreak: (h.currentStreak || 0) + 1 } : h
    ));

    try {
      const res = await habitAPI.logCompletion(habitId, {
        completedDate: new Date().toISOString().split('T')[0],
        completedTime: new Date().toTimeString().split(' ')[0].substring(0, 8),
        mood: 'HAPPY',
        notes: 'Quick check-in'
      });

      // Show streak toast popup
      if (res.data) {
        showStreakToast(res.data);
      }

      if (res.data && res.data.nextSuggestedHabit) {
        const message = `Excellent! Next up in stack: ${res.data.nextSuggestedHabit}`;
        setStackCompletionMessage(message);
        setTimeout(() => setStackCompletionMessage(''), 8000);
      }

      fetchHabits();
    } catch (error) {
      console.error('Error quick logging completion:', error);
      // Revert optimistic update on failure
      fetchHabits();
    }
  };

  const handleDetailedLogSave = async (habitId, logData) => {
    try {
      const res = await habitAPI.logCompletion(habitId, logData);

      // Show streak toast popup
      if (res.data) {
        showStreakToast(res.data);
      }

      if (res.data && res.data.nextSuggestedHabit) {
        const message = `Excellent! Next up in stack: ${res.data.nextSuggestedHabit}`;
        setStackCompletionMessage(message);
        setTimeout(() => setStackCompletionMessage(''), 8000);
      }

      setSelectedHabitForDetailedLog(null);
      fetchHabits();
    } catch (error) {
      console.error('Error saving completion log:', error);
    }
  };

  const handleHabitSave = async (id, payload) => {
    try {
      if (id) {
        // Edit Mode
        await habitAPI.update(id, payload);
      } else {
        // Create Mode
        await habitAPI.create(payload);
      }
      setIsHabitModalOpen(false);
      setSelectedHabitForEdit(null);
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleHabitDelete = async (id) => {
    if (window.confirm('Warning: Deleting this habit will erase all completions and history logs. Proceed?')) {
      try {
        await habitAPI.delete(id);
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const categories = ['ALL', 'FITNESS', 'STUDY', 'HEALTH', 'MOOD', 'FINANCE', 'SOCIAL'];

  // Filter logic
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || habit.category.toUpperCase() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-slate-500 font-semibold">Gathering your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
      <Navbar title="My Habits" />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Streak Modal Celebration Popup */}
        {streakToast && (
          <StreakModal
            habitName={streakToast.habitName}
            currentStreak={streakToast.currentStreak}
            longestStreak={streakToast.longestStreak}
            isNewBest={streakToast.isNewBest}
            onClose={() => setStreakToast(null)}
          />
        )}

        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Routines Center</h1>
            <p className="text-slate-400 text-sm mt-1">Configure habit settings, schedule intervals, and trigger logs.</p>
          </div>
          {stackCompletionMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl animate-bounce flex items-center gap-2">
              <Zap size={14} className="animate-pulse" />
              <span>{stackCompletionMessage}</span>
            </div>
          )}
          <button
            onClick={() => {
              setSelectedHabitForEdit(null);
              setIsHabitModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all glow-btn"
          >
            <Plus size={16} />
            <span>Add Routine</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#1E293B] border border-[#334155]/60 p-4 rounded-2xl">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full bg-slate-900 border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Dropdown/Scroller */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1.5 flex items-center gap-1">
              <Filter size={14} />
              Category:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedCategory === cat 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

        </div>

        {/* Habits grid */}
        {filteredHabits.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center text-slate-500 border border-[#334155]/50">
            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-base font-bold text-slate-400">No matching habits found.</p>
            <p className="text-xs text-slate-500 mt-1">Refine your query filter or create a new routine to start logging.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onLogQuick={handleQuickLog}
                onLogDetailed={setSelectedHabitForDetailedLog}
                onEdit={(h) => {
                  setSelectedHabitForEdit(h);
                  setIsHabitModalOpen(true);
                }}
                onDelete={handleHabitDelete}
              />
            ))}
          </div>
        )}

        {/* Habit Stacking Section */}
        <div className="pt-4">
          <HabitStackBuilder />
        </div>


      </main>

      {/* Habit Form Modal (create / edit) */}
      {isHabitModalOpen && (
        <HabitModal
          habit={selectedHabitForEdit}
          onClose={() => {
            setIsHabitModalOpen(false);
            setSelectedHabitForEdit(null);
          }}
          onSave={handleHabitSave}
        />
      )}

      {/* Log detailed completion modal */}
      {selectedHabitForDetailedLog && (
        <LogModal
          habit={selectedHabitForDetailedLog}
          onClose={() => setSelectedHabitForDetailedLog(null)}
          onSave={handleDetailedLogSave}
        />
      )}

    </div>
  );
};

export default Habits;
