import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const HabitModal = ({ habit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FITNESS');
  const [frequency, setFrequency] = useState('DAILY');
  const [frequencyValue, setFrequencyValue] = useState('');
  const [targetCount, setTargetCount] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Custom days of week selection state
  const [selectedDays, setSelectedDays] = useState({
    MON: false, TUE: false, WED: false, THU: false, FRI: false, SAT: false, SUN: false
  });

  const categories = [
    { value: 'FITNESS', label: 'Fitness & Sports' },
    { value: 'STUDY', label: 'Study & Learning' },
    { value: 'HEALTH', label: 'Health & Wellness' },
    { value: 'MOOD', label: 'Mindfulness & Mood' },
    { value: 'FINANCE', label: 'Finance & Saving' },
    { value: 'SOCIAL', label: 'Social & Family' }
  ];

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setCategory(habit.category || 'FITNESS');
      setFrequency(habit.frequency || 'DAILY');
      setTargetCount(habit.targetCount || 1);
      setIsActive(habit.isActive !== undefined ? habit.isActive : true);

      if (habit.frequency === 'CUSTOM' && habit.frequencyValue) {
        const days = habit.frequencyValue.split(',');
        const newDays = { MON: false, TUE: false, WED: false, THU: false, FRI: false, SAT: false, SUN: false };
        days.forEach(d => { if (newDays[d] !== undefined) newDays[d] = true; });
        setSelectedDays(newDays);
      }
    }
  }, [habit]);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let freqValue = '';
    if (frequency === 'CUSTOM') {
      freqValue = Object.keys(selectedDays).filter(d => selectedDays[d]).join(',');
    }

    const payload = {
      name,
      description,
      category,
      frequency,
      frequencyValue: freqValue,
      targetCount,
      isActive
    };

    onSave(habit ? habit.id : null, payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-lg glass-card rounded-2xl border border-[#334155] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-base font-bold text-white">
            {habit ? 'Modify Habit' : 'Create New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Habit Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Workout, Learn Java..."
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief description of your daily goal..."
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Grid Category & Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Daily Goal Count *</label>
              <input
                type="number"
                min="1"
                required
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Frequency *</label>
            <div className="grid grid-cols-3 gap-2">
              {['DAILY', 'WEEKLY', 'CUSTOM'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    frequency === f 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                      : 'border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional CUSTOM Days select */}
          {frequency === 'CUSTOM' && (
            <div className="p-3 bg-slate-900 rounded-xl border border-[#334155] animate-slide-down">
              <label className="text-xs font-semibold text-slate-400 block mb-2">Select Active Days</label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      selectedDays[day]
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active toggle when editing */}
          {habit && (
            <div className="flex items-center justify-between p-3.5 bg-slate-900/50 rounded-xl border border-[#334155]/50">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Active Tracking</h4>
                <p className="text-[10px] text-slate-500">Uncheck to temporarily pause this habit</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-[#334155] rounded focus:ring-indigo-500 bg-slate-900"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#334155]/30">
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
              {habit ? 'Update Habit' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
