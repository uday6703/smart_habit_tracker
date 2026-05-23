import React from 'react';
import { 
  Flame, 
  Check, 
  Trash2, 
  Edit, 
  Smile, 
  BookOpen, 
  Activity, 
  Heart, 
  DollarSign, 
  Users, 
  Calendar 
} from 'lucide-react';

const HabitCard = ({ habit, onLogQuick, onLogDetailed, onEdit, onDelete }) => {
  
  const getCategoryDetails = (category) => {
    switch (category.toUpperCase()) {
      case 'FITNESS':
        return { icon: Activity, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'STUDY':
        return { icon: BookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'HEALTH':
        return { icon: Heart, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'MOOD':
        return { icon: Smile, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
      case 'FINANCE':
        return { icon: DollarSign, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'SOCIAL':
        return { icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      default:
        return { icon: Calendar, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const { icon: CategoryIcon, color: catStyles } = getCategoryDetails(habit.category);

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
      habit.completedToday 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : 'hover:border-indigo-500/30'
    }`}>
      {/* Top Banner Category */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${catStyles}`}>
            <CategoryIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-snug tracking-tight">{habit.name}</h3>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 mt-1 inline-block">
              {habit.category}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit Habit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Habit"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="text-xs text-slate-400 mt-3.5 leading-relaxed line-clamp-2">
          {habit.description}
        </p>
      )}

      {/* Analytics Mini Stats */}
      <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#334155]/50">
        {/* Streak */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <Flame size={14} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Streak</p>
            <p className="text-xs font-bold text-slate-200">
              {habit.currentStreak}d <span className="text-[10px] text-slate-500 font-normal">(best: {habit.longestStreak}d)</span>
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Flame size={14} className="rotate-180" /> {/* visual placeholder for rate */}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Consistency</p>
            <p className="text-xs font-bold text-slate-200">{habit.completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Action Checkbox Area */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-[#334155]/30">
        <div className="text-[10px] text-slate-500">
          Frequency: <span className="font-semibold text-slate-400">{habit.frequency}</span>
          {habit.frequencyValue && <span className="ml-1">({habit.frequencyValue})</span>}
        </div>

        <div className="flex items-center gap-2">
          {habit.completedToday ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Check size={14} />
              <span>Completed</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => onLogQuick(habit.id)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1"
              >
                <Check size={12} />
                <span>Check-in</span>
              </button>
              <button
                onClick={() => onLogDetailed(habit)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-xs hover:text-white transition-colors"
                title="Log with details (Mood/Notes)"
              >
                Log +
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
