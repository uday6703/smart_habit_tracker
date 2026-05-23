import React, { useState, useEffect } from 'react';
import { X, Smile, Zap, Meh, Frown, AlertCircle } from 'lucide-react';

const LogModal = ({ habit, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [mood, setMood] = useState('HAPPY');
  const [notes, setNotes] = useState('');

  const moods = [
    { value: 'HAPPY', label: 'Happy', icon: Smile, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' },
    { value: 'ENERGETIC', label: 'Energetic', icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10' },
    { value: 'NEUTRAL', label: 'Neutral', icon: Meh, color: 'text-blue-400 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10' },
    { value: 'STRESSED', label: 'Stressed', icon: AlertCircle, color: 'text-orange-400 border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10' },
    { value: 'SAD', label: 'Sad', icon: Frown, color: 'text-pink-400 border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(habit.id, {
      completedDate: date,
      completedTime: time + ":00", // Append seconds for local time parsing in backend
      mood,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl border border-[#334155] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Log Completion</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl">
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Logging Habit</p>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{habit.name}</p>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">How did you feel?</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => {
                const Icon = m.icon;
                const isSelected = mood === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 scale-105 shadow-md shadow-indigo-500/10' 
                        : m.color
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[9px] mt-1 font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 font-sans">Notes (Optional)</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed morning run 5k, felt energized!"
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-3 border-t border-[#334155]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold shadow-lg hover:shadow-indigo-500/20 transition-all glow-btn"
            >
              Save Completion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogModal;
