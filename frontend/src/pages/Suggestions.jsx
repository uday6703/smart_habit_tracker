import React, { useState, useEffect } from 'react';
import { suggestionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Lightbulb, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionAPI.getAll();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await suggestionAPI.markAsRead(id);
      fetchSuggestions(); // Reload updated list
    } catch (error) {
      console.error('Error marking suggestion as read:', error);
    }
  };

  const getRuleDetails = (type) => {
    switch (type) {
      case 'CONSISTENCY_DROP':
        return { label: 'Consistency drop detected', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'STREAK_WARNING':
        return { label: 'Streak warning', icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'TIME_ANALYSIS':
        return { label: 'Time Optimization match', icon: Compass, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'OVERLOAD':
        return { label: 'Overload warning', icon: ShieldCheck, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'MOOD_CORRELATION':
        return { label: 'Mood association alert', icon: CheckCircle2, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
      default:
        return { label: 'Optimization suggestion', icon: Lightbulb, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-slate-500 font-semibold">Running suggestions algorithm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
      <Navbar title="AI Smart Suggestions" />
      
      <main className="flex-1 p-8 max-w-4xl w-full mx-auto space-y-8">
        
        {/* Header Greeting */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Smart Center</h1>
          <p className="text-slate-400 text-sm mt-1">Rule-based machine learning calculations derived from your completion logs, streaks, and mood tags.</p>
        </div>

        {/* Suggestion list */}
        {suggestions.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center text-slate-500 border border-[#334155]/50 flex flex-col items-center justify-center gap-3">
            <Lightbulb size={48} className="text-slate-700 animate-bounce" />
            <p className="text-base font-bold text-slate-400">Your AI queue is empty.</p>
            <p className="text-xs text-slate-500">Log habits consistently for a few days to enable pattern calculation models to trigger recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((sug) => {
              const { label, icon: Icon, color: cardStyles } = getRuleDetails(sug.type);
              return (
                <div
                  key={sug.id}
                  className={`glass-card rounded-2xl border p-6 transition-all relative ${
                    sug.isRead 
                      ? 'border-[#334155]/40 opacity-70' 
                      : 'border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl border ${cardStyles}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {label}
                        </span>
                        {!sug.isRead && (
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-200 mt-2 leading-relaxed">
                        {sug.content}
                      </p>
                      
                      <div className="mt-5 flex items-center justify-between border-t border-[#334155]/30 pt-4">
                        <span className="text-[10px] text-slate-500">
                          Generated on: {new Date(sug.createdAt).toLocaleDateString()}
                        </span>
                        {!sug.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(sug.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 hover:text-indigo-300 border border-[#334155] transition-all"
                          >
                            Dismiss Insight
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Suggestions;
