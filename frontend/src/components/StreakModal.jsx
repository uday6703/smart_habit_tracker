import React from 'react';
import { X, Flame, Trophy, CheckCircle2 } from 'lucide-react';

const StreakModal = ({ habitName, currentStreak, longestStreak, isNewBest, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`w-full max-w-sm glass-card rounded-3xl border shadow-2xl overflow-hidden relative ${
        isNewBest 
          ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent' 
          : 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/40 transition-all"
        >
          <X size={18} />
        </button>

        {/* Content Wrapper */}
        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Main Visual Icon */}
          <div className={`p-5 rounded-2xl mb-5 animate-bounce ${
            isNewBest 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isNewBest ? <Trophy size={48} /> : <Flame size={48} />}
          </div>

          {/* Achievement Title */}
          <h2 className={`text-2xl font-extrabold tracking-tight ${
            isNewBest ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isNewBest ? '🏆 New Personal Best!' : '🔥 Check-in Successful!'}
          </h2>

          {/* Habit Details */}
          <p className="text-slate-400 text-sm mt-2">
            You just completed: <span className="font-bold text-white block text-base mt-1">{habitName}</span>
          </p>

          {/* Streak Counter Dashboard */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 my-6 w-full flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Current Streak</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 leading-none">
                {currentStreak}
              </span>
              <span className="text-lg font-bold text-orange-400">day{currentStreak !== 1 ? 's' : ''}</span>
            </div>

            {/* Streak Grid Comparison */}
            <div className="flex gap-4 mt-4 pt-3 border-t border-slate-800/60 w-full justify-around text-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Today</p>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold justify-center mt-0.5">
                  <CheckCircle2 size={12} />
                  <span>Logged</span>
                </div>
              </div>
              <div className="border-r border-slate-800/60 h-6"></div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Best Streak</p>
                <p className="text-xs text-slate-300 font-bold mt-0.5">{longestStreak} day{longestStreak !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Action Close Button */}
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-[1.02] ${
              isNewBest
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:shadow-emerald-500/20'
            }`}
          >
            Awesome, Keep it Up!
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakModal;
