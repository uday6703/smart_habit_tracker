import React, { useState, useEffect } from 'react';
import { intelligenceAPI } from '../services/api';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Activity, ShieldAlert, Sparkles, RefreshCw, Award, HeartCrack } from 'lucide-react';

const LifeBalanceRadar = ({ refreshTrigger }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchBalance = async (force = false) => {
    try {
      if (force) setRecalculating(true);
      else setLoading(true);
      const res = await intelligenceAPI.getLifeBalance(force);
      setBalance(res.data);
    } catch (err) {
      console.error("Failed to load life balance scores", err);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshTrigger]);

  const formatCategoryName = (key) => {
    const labels = {
      health: 'Health',
      fitness: 'Fitness',
      learning: 'Learning',
      productivity: 'Productivity',
      sleep: 'Sleep',
      mentalWellness: 'Mindfulness',
      discipline: 'Discipline',
      focus: 'Focus'
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs text-slate-400 font-medium">Assembling life balance scores...</p>
        </div>
      </div>
    );
  }

  if (!balance) return null;

  // Build chart data
  const chartData = Object.entries(balance.categoryScores || {}).map(([key, value]) => ({
    subject: formatCategoryName(key),
    score: Math.round(value * 10) / 10,
    fullMark: 100
  }));

  const CustomRadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-300">{payload[0].payload.subject}</p>
          <p className="text-xs font-semibold text-indigo-400 mt-0.5">
            Score: {payload[0].value} / 100
          </p>
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
            <Activity className="text-violet-400" size={16} />
            Life Balance Radar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Integrative mapping across 8 personal behavioral dimensions</p>
        </div>
        <button
          onClick={() => fetchBalance(true)}
          disabled={recalculating}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[10px] font-semibold"
        >
          <RefreshCw size={11} className={recalculating ? 'animate-spin' : ''} />
          {recalculating ? 'Rebalancing...' : 'Recalculate Radar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Radar Chart */}
        <div className="lg:col-span-3 flex items-center justify-center min-h-[220px]">
          {chartData.length === 0 ? (
            <p className="text-xs text-slate-500">No balance scores calculated yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" opacity={0.4} />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                <PolarRadiusAxis stroke="#334155" angle={30} domain={[0, 100]} fontSize={8} />
                <Radar name="Balance" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Highlights & AI Insights */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Strengths & Weaknesses badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3">
                <span className="text-[9px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <Award size={11} />
                  Strongest
                </span>
                <p className="text-xs font-extrabold text-white mt-1">
                  {balance.strongestCategory ? formatCategoryName(balance.strongestCategory) : 'None'}
                </p>
              </div>

              <div className="bg-rose-950/20 border border-rose-500/10 rounded-xl p-3">
                <span className="text-[9px] uppercase font-bold text-rose-400 flex items-center gap-1">
                  <HeartCrack size={11} />
                  Growth Area
                </span>
                <p className="text-xs font-extrabold text-white mt-1">
                  {balance.weakestCategory ? formatCategoryName(balance.weakestCategory) : 'None'}
                </p>
              </div>
            </div>

            {/* AI analysis */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-indigo-400 mb-2">
                <Sparkles size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Radar Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {balance.aiBalanceAnalysis || "Create more daily logs and complete habits in multiple categories to generate advanced balance analytics."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/40 text-[10px] text-slate-500 flex justify-between">
            <span>Dimensions scored automatically</span>
            <span>Target: 70%+ across all</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeBalanceRadar;
