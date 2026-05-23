import React, { useState, useEffect } from 'react';
import { intelligenceAPI } from '../services/api';
import { Brain, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, Dna } from 'lucide-react';

const HabitDnaCard = ({ refreshTrigger }) => {
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchDna = async (force = false) => {
    try {
      if (force) setRecalculating(true);
      else setLoading(true);
      const res = await intelligenceAPI.getDna(force);
      setDna(res.data);
    } catch (err) {
      console.error("Failed to load DNA profile", err);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchDna();
  }, [refreshTrigger]);

  const getArchetypeColor = (type) => {
    switch (type) {
      case 'Consistency Master': return 'from-emerald-500 to-teal-600 shadow-emerald-500/25 text-emerald-300';
      case 'Night Builder': return 'from-indigo-500 to-purple-600 shadow-indigo-500/25 text-indigo-300';
      case 'Weekend Warrior': return 'from-amber-500 to-orange-600 shadow-amber-500/25 text-amber-300';
      case 'Fast Starter': return 'from-cyan-500 to-blue-600 shadow-cyan-500/25 text-cyan-300';
      case 'Recovery Struggler': return 'from-rose-500 to-pink-600 shadow-rose-500/25 text-rose-300';
      case 'Deep Focus Learner': return 'from-violet-500 to-fuchsia-600 shadow-violet-500/25 text-violet-300';
      default: return 'from-slate-500 to-slate-600 shadow-slate-500/25 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs text-slate-400 font-medium">Analyzing tracking logs DNA...</p>
        </div>
      </div>
    );
  }

  if (!dna) return null;

  const colorClasses = getArchetypeColor(dna.personalityType);

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-full relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 z-10">
        <div>
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Dna className="text-indigo-400" size={16} />
            Habit DNA Profile
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your tracking logs personality archetype</p>
        </div>
        <button
          onClick={() => fetchDna(true)}
          disabled={recalculating}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[10px] font-semibold"
        >
          <RefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Analyzing...' : 'Sync DNA'}
        </button>
      </div>

      <div className="flex-1 flex flex-col z-10">
        {/* Archetype Showcase */}
        <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorClasses} border border-white/10 shadow-lg mb-6 flex items-center gap-4`}>
          <div className="p-3.5 bg-slate-950/40 rounded-xl backdrop-blur-md border border-white/5 text-white">
            <Brain size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Your Archetype</span>
            <h4 className="text-lg font-black text-white tracking-tight leading-none mt-0.5">{dna.personalityType}</h4>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
              <ShieldCheck size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Key Strengths</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {dna.strengths}
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-rose-400 mb-2">
              <AlertTriangle size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Vulnerabilities</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {dna.weaknesses}
            </p>
          </div>
        </div>

        {/* AI Coaching Tips */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 flex gap-3 mt-auto">
          <div className="text-indigo-400 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Behavioral Coach Advice</h5>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">
              {dna.aiCoachingAdvice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDnaCard;
