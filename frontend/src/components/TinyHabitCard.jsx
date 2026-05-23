import React from 'react';
import { tinyHabitAPI } from '../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';

const TinyHabitCard = ({ recommendations, onRecommendationProcessed }) => {
  if (!recommendations || recommendations.length === 0) return null;

  const handleAccept = async (id) => {
    try {
      await tinyHabitAPI.accept(id);
      if (onRecommendationProcessed) onRecommendationProcessed();
    } catch (err) {
      console.error('Failed to accept recommendation:', err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await tinyHabitAPI.dismiss(id);
      if (onRecommendationProcessed) onRecommendationProcessed();
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec) => (
        <div 
          key={rec.id} 
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 to-slate-850 p-6 shadow-xl"
        >
          <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Atomic Habit Suggestion
                </span>
              </div>
              
              <h4 className="mt-1 text-base font-semibold text-slate-100">
                Scale down to improve consistency
              </h4>
              
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                You've had lower consistency with <span className="font-semibold text-slate-200">"{rec.originalHabitName}"</span> lately. 
                According to Atomic Habits, it's better to scale down targets than to skip. Try starting smaller:
              </p>
              
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-xl p-3.5">
                <div className="text-center sm:text-left flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Original</span>
                  <span className="text-xs text-red-300 line-through mt-0.5">{rec.originalHabitName} ({rec.originalTargetCount}x)</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0" />
                
                <div className="text-center sm:text-left flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-400 font-medium">Tiny Recommendation</span>
                  <span className="text-xs text-emerald-300 font-semibold mt-0.5">{rec.suggestedName} ({rec.suggestedTargetCount}x)</span>
                </div>
              </div>
              
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleAccept(rec.id)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Adopt Tiny Routine
                </button>
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-650 transition-all cursor-pointer"
                >
                  Keep Original
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TinyHabitCard;
