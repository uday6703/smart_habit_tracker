import React, { useState, useEffect } from 'react';
import { dashboardAPI, habitAPI, suggestionAPI, tinyHabitAPI } from '../services/api';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import HabitCard from '../components/HabitCard';
import LogModal from '../components/LogModal';
import HabitModal from '../components/HabitModal';
import HeatmapCalendar from '../components/HeatmapCalendar';
import TinyHabitCard from '../components/TinyHabitCard';
import StreakModal from '../components/StreakModal';
import { 
  CheckSquare, 
  Flame, 
  Activity, 
  Award, 
  Lightbulb, 
  ArrowRight,
  Smile,
  Zap,
  Meh,
  Frown,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsRegenerating, setSuggestionsRegenerating] = useState(false);
  const [selectedHabitForDetailedLog, setSelectedHabitForDetailedLog] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [stackCompletionMessage, setStackCompletionMessage] = useState('');
  const [streakToast, setStreakToast] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await tinyHabitAPI.getAll();
      setRecommendations(res.data);
    } catch (error) {
      console.error('Error fetching tiny habit recommendations:', error);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchRecommendations()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
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
    // Optimistic UI update:
    // 1. Mark the habit completed today.
    // 2. Increment completedTodayCount by 1.
    // 3. Update the habit's current streak.
    setSummary(prev => {
      if (!prev) return prev;
      let alreadyCompleted = false;
      const updatedHabits = prev.todaysHabits.map(h => {
        if (h.id === habitId) {
          alreadyCompleted = h.completedToday;
          return {
            ...h,
            completedToday: true,
            currentStreak: (h.currentStreak || 0) + (h.completedToday ? 0 : 1)
          };
        }
        return h;
      });
      return {
        ...prev,
        todaysHabits: updatedHabits,
        completedTodayCount: prev.completedTodayCount + (alreadyCompleted ? 0 : 1)
      };
    });

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

      // Handle Habit Stacking cue suggestion
      if (res.data && res.data.nextSuggestedHabit) {
        const message = `Excellent! Next up in stack: ${res.data.nextSuggestedHabit}`;
        setStackCompletionMessage(message);
        triggerBrowserNotification("Atomic Habit Stack", message);
        setTimeout(() => setStackCompletionMessage(''), 8000);
      }

      await fetchDashboardData();
    } catch (error) {
      console.error('Error quick logging completion:', error);
      // Revert optimistic update on failure
      await fetchDashboardData();
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
        triggerBrowserNotification("Atomic Habit Stack", message);
        setTimeout(() => setStackCompletionMessage(''), 8000);
      }

      setSelectedHabitForDetailedLog(null);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error detailed logging completion:', error);
    }
  };

  const handleSuggestionRead = async (id) => {
    try {
      await suggestionAPI.markAsRead(id);
      setSummary(prev => ({
        ...prev,
        activeSuggestions: prev.activeSuggestions.filter(s => s.id !== id)
      }));
    } catch (error) {
      console.error('Error marking suggestion as read:', error);
    }
  };

  const handleRegenerateSuggestions = async () => {
    try {
      setSuggestionsRegenerating(true);
      const response = await suggestionAPI.regenerate();
      setSummary(prev => ({
        ...prev,
        activeSuggestions: response.data
      }));
    } catch (error) {
      console.error('Error regenerating AI suggestions:', error);
    } finally {
      setSuggestionsRegenerating(false);
    }
  };

  const handleHabitEditSave = async (id, payload) => {
    try {
      await habitAPI.update(id, payload);
      setEditingHabit(null);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleHabitDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit and all its logged history?')) {
      try {
        await habitAPI.delete(id);
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'HAPPY': return <Smile className="text-emerald-400" size={14} />;
      case 'ENERGETIC': return <Zap className="text-amber-400" size={14} />;
      case 'NEUTRAL': return <Meh className="text-blue-400" size={14} />;
      case 'STRESSED': return <AlertCircle className="text-orange-400" size={14} />;
      case 'SAD': return <Frown className="text-pink-400" size={14} />;
      default: return <Smile className="text-slate-400" size={14} />;
    }
  };

  // Request browser notifications permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-slate-500 font-semibold">Assembling your board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
      <Navbar title="Dashboard" />
      
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
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Howdy, Champ!</h1>
            <p className="text-slate-400 text-sm mt-1">Here is a snapshot of your habit execution parameters for today.</p>
          </div>
          {stackCompletionMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl animate-bounce flex items-center gap-2">
              <Zap size={14} className="animate-pulse" />
              <span>{stackCompletionMessage}</span>
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Active Habits" 
            value={summary?.totalHabits || 0} 
            icon={CheckSquare}
            trend="Active routines"
          />
          <MetricCard 
            title="Completed Today" 
            value={summary?.completedTodayCount || 0} 
            icon={Flame}
            trend="Logs locked in"
          />
          <MetricCard 
            title="Best Current Streak" 
            value={`${summary?.bestStreak || 0} days`} 
            icon={Award}
            trend="Longest stretch going"
          />
          <MetricCard 
            title="Consistency Index" 
            value={`${summary?.overallProductivityScore || 0}%`} 
            icon={Activity}
            trend="Weighted average score"
            glow={true}
          />
        </div>

        {/* Dynamic Heatmap Calendar */}
        <HeatmapCalendar />

        {/* Main Columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Today's habits (Takes 2 grid sizes) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Today's Habit Logsheet</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                  {summary?.todaysHabits?.length || 0} Scheduled
                </span>
              </h3>
              <Link to="/habits" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Manage routines</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {summary?.todaysHabits?.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-slate-500 border border-[#334155]/50">
                <CheckSquare size={36} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No habits scheduled for today.</p>
                <p className="text-xs text-slate-500 mt-1">Visit My Habits to add one or modify frequencies.</p>
                <Link to="/habits" className="mt-4 inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20">
                  Configure Habits
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {summary?.todaysHabits.map((habit) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit}
                    onLogQuick={handleQuickLog}
                    onLogDetailed={setSelectedHabitForDetailedLog}
                    onEdit={setEditingHabit}
                    onDelete={handleHabitDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: AI Suggestion center alerts & feeds */}
          <div className="space-y-8">
            
            {/* Tiny Habit recommendation prompt if available */}
            <TinyHabitCard recommendations={recommendations} onRecommendationProcessed={initData} />

            {/* AI Smart Tips */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Lightbulb className="text-amber-500" size={18} />
                  <span>AI Smart Insights</span>
                </h3>
                <button
                  onClick={handleRegenerateSuggestions}
                  disabled={suggestionsRegenerating}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-650 transition-all flex items-center gap-1 cursor-pointer"
                  title="Ask Gemini to recalculate recommendations"
                >
                  <RefreshCw size={12} className={suggestionsRegenerating ? "animate-spin" : ""} />
                  <span className="text-[10px] font-semibold">Refresh AI</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {summary?.activeSuggestions?.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                    <p>No new analysis recommendations yet.</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Logging consistency triggers insights!</p>
                  </div>
                ) : (
                  summary?.activeSuggestions.map((sug) => (
                    <div key={sug.id} className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 relative group">
                      <p className="text-xs text-slate-350 leading-relaxed pr-6">{sug.content}</p>
                      <button 
                        onClick={() => handleSuggestionRead(sug.id)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Dismiss Alert"
                      >
                        <X size={12} />
                      </button>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-2 inline-block">
                        {sug.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent activity timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Recent Check-ins</span>
              </h3>

              <div className="glass-card rounded-2xl p-5 border border-[#334155]/50 space-y-4">
                {summary?.recentActivities?.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-4">
                    <p>No activity logged recently.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {summary?.recentActivities.map((act, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                            {getMoodIcon(act.mood)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{act.habitName}</p>
                            <p className="text-[9px] text-slate-500">{act.completedDate} • {act.completedTime}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-[#334155]">
                          {act.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Detailed Log Modal */}
      {selectedHabitForDetailedLog && (
        <LogModal 
          habit={selectedHabitForDetailedLog}
          onClose={() => setSelectedHabitForDetailedLog(null)}
          onSave={handleDetailedLogSave}
        />
      )}

      {/* Habit Edit Modal */}
      {editingHabit && (
        <HabitModal 
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={handleHabitEditSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
