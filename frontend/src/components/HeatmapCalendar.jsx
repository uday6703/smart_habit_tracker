import React, { useState, useEffect } from 'react';
import { heatmapAPI } from '../services/api';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

const HeatmapCalendar = () => {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
  }, [currentDate]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const formatDateStr = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const response = await heatmapAPI.get(formatDateStr(startDate), formatDateStr(endDate));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getColorClass = (score, total) => {
    if (total === 0) return 'bg-slate-800 border-slate-700';
    if (score === 0) return 'bg-slate-850 border-slate-800 hover:bg-slate-800';
    if (score <= 30) return 'bg-emerald-950/60 border-emerald-900/20 text-emerald-300';
    if (score <= 60) return 'bg-emerald-800/80 border-emerald-700/20 text-emerald-200';
    if (score <= 85) return 'bg-emerald-600 border-emerald-500/20 text-emerald-100';
    return 'bg-emerald-400 border-emerald-300/25 text-slate-900 font-bold shadow-md shadow-emerald-400/20';
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ isEmpty: true, id: `empty-${i}` });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayData = data.find((d) => d.date === dateStr) || {
      date: dateStr,
      completionRate: 0,
      completedCount: 0,
      totalCount: 0,
      completedHabits: [],
      missedHabits: [],
      productivityScore: 0,
    };
    cells.push({ isEmpty: false, dayNum, data: dayData, id: dateStr });
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-xl relative overflow-visible max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            Habit Consistency Heatmap
            <span className="group relative cursor-pointer">
              <Info className="w-4 h-4 text-slate-400 hover:text-slate-200 transition-colors" />
              <div className="absolute left-6 top-0 hidden group-hover:block bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded p-2 w-64 z-50 shadow-lg">
                Calculates daily score based on completion counts, consistency rates, and perfect days.
              </div>
            </span>
          </h3>
          <p className="text-xs text-slate-400">Track and build your Atomic Habits streak chains</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 hover:border-slate-650"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-200 min-w-[100px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 hover:border-slate-650"
            disabled={new Date(year, month, 1) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="relative">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className="text-[10px] font-semibold text-slate-400">
                {day}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              if (cell.isEmpty) {
                return <div key={cell.id} className="aspect-square bg-transparent" />;
              }

              const { dayNum, data: dayData } = cell;
              return (
                <div
                  key={cell.id}
                  onMouseEnter={() => setHoveredDay(dayData)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all border ${getColorClass(
                    dayData.productivityScore,
                    dayData.totalCount
                  )}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-slate-850/95 border border-slate-700 text-slate-200 text-xs rounded-xl p-4 z-40 shadow-2xl backdrop-blur-md pointer-events-none transition-all flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-slate-750 pb-2">
                <span className="font-semibold text-sm text-slate-100">
                  {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                  Score: {hoveredDay.productivityScore}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Completion Rate:</span>
                <span className="text-slate-200 font-bold">{hoveredDay.completionRate}% ({hoveredDay.completedCount}/{hoveredDay.totalCount})</span>
              </div>
              {hoveredDay.completedHabits.length > 0 && (
                <div>
                  <span className="text-emerald-450 font-medium block">Completed:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredDay.completedHabits.map((h, i) => (
                      <span key={i} className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hoveredDay.missedHabits.length > 0 && (
                <div>
                  <span className="text-red-400 block font-medium">Missed:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredDay.missedHabits.map((h, i) => (
                      <span key={i} className="bg-red-950/20 text-red-355 border border-red-950/30 px-2 py-0.5 rounded text-[10px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hoveredDay.totalCount === 0 && (
                <div className="text-slate-400 text-center py-2">No habits scheduled for this day</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-400">
        <span>Less Consistent</span>
        <div className="w-3.5 h-3.5 rounded bg-slate-850 border border-slate-850" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-950/60 border border-emerald-900/20" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-800/80 border border-emerald-700/20" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-500/20" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-400 border border-emerald-350/20" />
        <span>Atomic Streak</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
