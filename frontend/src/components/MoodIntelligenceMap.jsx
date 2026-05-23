import React, { useState, useEffect } from 'react';
import { intelligenceAPI } from '../services/api';
import { Smile, Flame, ShieldAlert, Sparkles, Frown, Sparkle } from 'lucide-react';

const MoodIntelligenceMap = ({ refreshTrigger }) => {
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCorrelations = async () => {
    try {
      setLoading(true);
      const res = await intelligenceAPI.getMoodCorrelations();
      setCorrelations(res.data);
    } catch (err) {
      console.error("Failed to load mood intelligence correlations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelations();
  }, [refreshTrigger]);

  const getMoodEmoji = (score) => {
    if (score >= 4.5) return '😁';
    if (score >= 3.5) return '🙂';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '🙁';
    return '😢';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs text-slate-400 font-medium">Correlating mood check-ins...</p>
        </div>
      </div>
    );
  }

  if (!correlations) return null;

  // Destructure with fallbacks
  const {
    averageMoodWithCompletions = 0,
    averageMoodWithSkips = 0,
    averageStressWithCompletions = 0,
    averageStressWithSkips = 0,
    aiInsightSummary = "Keep logging daily check-ins to unlock behavioral intelligence correlations.",
    recentLogs = []
  } = correlations;

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Smile className="text-indigo-400" size={16} />
            Mood vs Habit Intelligence Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Correlation between emotional check-ins and completion records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left Side: Metrics Comparisons */}
        <div className="space-y-5">
          {/* Mood Correlation */}
          <div className="bg-slate-900/35 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3.5 flex items-center justify-between">
              <span>Avg Mood (1-5 Scale)</span>
              <span className="text-[10px] text-slate-500 font-medium">Higher is happier</span>
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>On Completion Days</span>
                  <span>{averageMoodWithCompletions ? averageMoodWithCompletions.toFixed(1) : '0.0'} {getMoodEmoji(averageMoodWithCompletions)}</span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(averageMoodWithCompletions / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-rose-400 mb-1">
                  <span>On Skipping Days</span>
                  <span>{averageMoodWithSkips ? averageMoodWithSkips.toFixed(1) : '0.0'} {getMoodEmoji(averageMoodWithSkips)}</span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-2">
                  <div 
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(averageMoodWithSkips / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stress Correlation */}
          <div className="bg-slate-900/35 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3.5 flex items-center justify-between">
              <span>Avg Stress (1-5 Scale)</span>
              <span className="text-[10px] text-slate-500 font-medium">Lower is calmer</span>
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>On Completion Days</span>
                  <span>{averageStressWithCompletions ? averageStressWithCompletions.toFixed(1) : '0.0'} 🧠</span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(averageStressWithCompletions / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-rose-400 mb-1">
                  <span>On Skipping Days</span>
                  <span>{averageStressWithSkips ? averageStressWithSkips.toFixed(1) : '0.0'} ⚡</span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-2">
                  <div 
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(averageStressWithSkips / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Insights & Daily Logs */}
        <div className="flex flex-col justify-between">
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4.5 mb-4">
            <div className="flex items-center gap-1.5 text-indigo-400 mb-2">
              <Sparkles size={14} className="animate-spin-slow" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Mood Insights</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aiInsightSummary}
            </p>
          </div>

          <div className="flex-1 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Recent Wellness Logs</span>
            <div className="flex-1 overflow-y-auto max-h-[140px] pr-1 space-y-2 border border-slate-800/40 rounded-xl p-2.5 bg-slate-900/10">
              {recentLogs.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4">No mood check-ins logged yet.</p>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="text-slate-300 font-bold">{log.date}</span>
                      {log.notes && <span className="text-[9px] text-slate-500 truncate max-w-[140px]">{log.notes}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span title="Mood">Mood: {log.moodScore}</span>
                      <span title="Stress" className="text-slate-400">Stress: {log.stressLevel}</span>
                      <span title="Energy" className="text-slate-400">Energy: {log.energyLevel}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodIntelligenceMap;
