import React, { useState, useEffect } from 'react';
import { intelligenceAPI } from '../services/api';
import { AlertCircle, ShieldAlert, Sparkles, RefreshCw, CheckCircle, Zap } from 'lucide-react';

const FailureReplayTimeline = ({ refreshTrigger }) => {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchFailures = async (force = false) => {
    try {
      if (force) setRecalculating(true);
      else setLoading(true);
      const res = await intelligenceAPI.getFailures(force);
      setFailures(res.data || []);
    } catch (err) {
      console.error("Failed to load failure replay timeline", err);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, [refreshTrigger]);

  const getTriggerBadge = (trigger) => {
    switch (trigger) {
      case 'STRESS_INDUCED_BURNOUT':
        return {
          label: 'Stress Burnout',
          color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          dot: 'bg-rose-500'
        };
      case 'WEEKEND_SLUMP':
        return {
          label: 'Weekend Slump',
          color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          dot: 'bg-amber-500'
        };
      case 'CONSISTENCY_DECAY':
        return {
          label: 'Consistency Decay',
          color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
          dot: 'bg-violet-500'
        };
      case 'SCHEDULE_FRICTION':
        return {
          label: 'Schedule Friction',
          color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
          dot: 'bg-cyan-500'
        };
      default:
        return {
          label: 'Schedule Adjustment',
          color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
          dot: 'bg-slate-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs text-slate-400 font-medium">Replaying failure logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="text-rose-400" size={16} />
            Habit Failure Replay & Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Triggers and Atomic Habits solutions for habits below 80% consistency</p>
        </div>
        <button
          onClick={() => fetchFailures(true)}
          disabled={recalculating}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[10px] font-semibold"
        >
          <RefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Auditing...' : 'Audit Triggers'}
        </button>
      </div>

      {failures.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl min-h-[220px]">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-2 border border-emerald-500/20">
            <CheckCircle size={20} />
          </div>
          <p className="text-xs font-bold text-slate-200">No Weak Habits Detected</p>
          <p className="text-[10px] text-slate-500 text-center max-w-[250px] mt-1">
            All your active routines are maintaining a strong execution rate of 80% or higher. Keep it up!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 relative pl-6 border-l border-slate-800 ml-3 py-2">
          {failures.map((fail, idx) => {
            const badge = getTriggerBadge(fail.primaryTrigger);
            return (
              <div key={fail.habitId} className="relative group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-[#0F172A] z-10 flex items-center justify-center ${badge.dot}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping absolute"></div>
                </div>

                <div className="glass-card bg-slate-900/10 border border-slate-800/80 rounded-xl p-4.5 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/30">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-white tracking-tight">{fail.habitName}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase font-semibold">
                        {fail.category}
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="text-slate-500 shrink-0 mt-0.5">
                        <AlertCircle size={13} />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {fail.aiExplanation}
                      </p>
                    </div>

                    <div className="flex gap-2 bg-indigo-950/10 border border-indigo-500/10 rounded-lg p-3">
                      <div className="text-indigo-400 shrink-0 mt-0.5">
                        <Zap size={13} />
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide">Atomic Habits Remedy</h5>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">
                          {fail.recoveryAdvice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FailureReplayTimeline;
