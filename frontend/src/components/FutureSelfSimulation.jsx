import React, { useState, useEffect } from 'react';
import { intelligenceAPI } from '../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Compass, Sparkles, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

const FutureSelfSimulation = ({ refreshTrigger }) => {
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState(90);

  const fetchProjections = async (force = false) => {
    try {
      if (force) setRecalculating(true);
      else setLoading(true);
      const res = await intelligenceAPI.getProjections(force);
      // Ensure sorted by days
      const sorted = (res.data || []).sort((a, b) => a.timeHorizonDays - b.timeHorizonDays);
      setProjections(sorted);
    } catch (err) {
      console.error("Failed to load future self projections", err);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchProjections();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs text-slate-400 font-medium">Simulating your future trajectories...</p>
        </div>
      </div>
    );
  }

  // Build chart data
  // We can estimate starting consistency based on day 30 projection
  // Since day 30 projection is currentConsistency * growthFactor, we can estimate starting as slightly below/above
  // Or simply plot a nice timeline starting from an assumed average or calculating it back.
  let chartData = [];
  let baseScore = 50;
  if (projections.length > 0) {
    const proj30 = projections.find(p => p.timeHorizonDays === 30);
    if (proj30) {
      // Approximate baseline
      baseScore = Math.max(10, Math.min(100, Math.round(proj30.projectedProductivityScore * 0.95)));
    }
    
    chartData = [
      { day: 'Day 0', score: baseScore, linear: baseScore },
      ...projections.map(p => {
        // Compute linear vs compounded to show the compound effect
        // Linear: grows 1% per day; Compounded: compounds
        const ratio = p.timeHorizonDays === 30 ? 1.02 : p.timeHorizonDays === 90 ? 1.08 : 1.15;
        const linearScore = Math.max(10, Math.min(100, Math.round(baseScore * (1 + (p.projectedProductivityScore - baseScore) * 0.7 / 100))));
        return {
          day: `Day ${p.timeHorizonDays}`,
          score: p.projectedProductivityScore,
          linear: Math.round(linearScore * 10) / 10
        };
      })
    ];
  }

  const activeProj = projections.find(p => p.timeHorizonDays === selectedHorizon) || projections[0];

  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-300">{payload[0].payload.day}</p>
          <p className="text-xs font-semibold text-emerald-400 mt-1">
            Compounded: {payload[0].value}%
          </p>
          {payload[1] && (
            <p className="text-xs font-semibold text-indigo-400 mt-0.5">
              Linear Trend: {payload[1].value}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="text-emerald-400 animate-pulse" size={16} />
            Future Self Simulation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Projected compounded productivity gains over time</p>
        </div>
        <button
          onClick={() => fetchProjections(true)}
          disabled={recalculating}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[10px] font-semibold"
        >
          <RefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {projections.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-xs text-slate-500">No projections available. Try completing some habits first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Simulation Graph */}
          <div className="lg:col-span-2 flex flex-col h-64 md:h-auto min-h-[220px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Compounding vs Linear Growth Curve</span>
            <div className="flex-1 min-h-0 bg-slate-900/20 rounded-xl p-2 border border-slate-800/40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="linearGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5} fill="url(#compGrad)" name="Compounded" />
                  <Area type="monotone" dataKey="linear" stroke="#6366F1" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#linearGrad)" name="Linear Trend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projection Narrative Panel */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Simulated Future Horizon</span>
            
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-4">
              {[30, 90, 180].map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedHorizon === h 
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>

            {/* Content Card */}
            {activeProj && (
              <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <TrendingUp size={12} />
                      Projected Productivity
                    </span>
                    <span className="text-lg font-black text-white">{activeProj.projectedProductivityScore}%</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Identity Shift</span>
                      <p className="text-xs text-slate-200 leading-relaxed mt-0.5">{activeProj.narrativeSummary}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Compounded Skills</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{activeProj.growthExplanations}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Calendar size={12} />
                  <span>Horizon simulation computed daily</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureSelfSimulation;
