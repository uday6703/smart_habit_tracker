import React, { useState, useEffect } from 'react';
import { analyticsAPI, intelligenceAPI } from '../services/api';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import HabitStackBuilder from '../components/HabitStackBuilder';

// Behavioral Intelligence Components
import HabitDnaCard from '../components/HabitDnaCard';
import FutureSelfSimulation from '../components/FutureSelfSimulation';
import FailureReplayTimeline from '../components/FailureReplayTimeline';
import MoodIntelligenceMap from '../components/MoodIntelligenceMap';
import LifeBalanceRadar from '../components/LifeBalanceRadar';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Activity, Flame, Heart, AlertCircle, Smile, RefreshCw, Zap, Sparkles, Check } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Wellness check-in state
  const [moodScore, setMoodScore] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [motivationLevel, setMotivationLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Refresh trigger count to reload child widgets
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.get();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefreshAll = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchAnalytics();
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await intelligenceAPI.logMood({
        moodScore,
        stressLevel,
        energyLevel,
        motivationLevel,
        notes
      });
      setSuccessMsg("Check-in logged successfully!");
      setNotes("");
      
      // Reset values slightly
      setMoodScore(3);
      setStressLevel(3);
      setEnergyLevel(3);
      setMotivationLevel(3);

      // Refresh all dashboards
      setRefreshTrigger(prev => prev + 1);
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to log mood", err);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-[#334155] p-3 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-slate-200">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-xs font-semibold mt-1" style={{ color: p.color || '#6366F1' }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xs text-slate-500 font-semibold">Crunching behavioral intelligence analytics...</p>
        </div>
      </div>
    );
  }

  const moodEmojis = [
    { score: 1, label: '😢', text: 'Awful' },
    { score: 2, label: '🙁', text: 'Bad' },
    { score: 3, label: '😐', text: 'Okay' },
    { score: 4, label: '🙂', text: 'Good' },
    { score: 5, label: '😁', text: 'Great' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
      <Navbar title="Behavioral Intelligence" />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Header Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Behavioral Intelligence</h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered narrative projections, DNA personality analysis, and trigger failure replays.</p>
          </div>
          <button
            onClick={handleRefreshAll}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <RefreshCw size={14} />
            Refresh Dashboards
          </button>
        </div>

        {/* Top Section: Daily Wellness Logger + DNA Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Daily Wellness Check-in Logger */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-full justify-between relative overflow-hidden">
            {successMsg && (
              <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-3 border border-emerald-500/20">
                  <Check size={28} />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{successMsg}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Your wellness parameters have compiled into the correlation matrix.</p>
              </div>
            )}

            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Smile className="text-indigo-400 animate-bounce" size={16} />
                Daily Wellness Check-in
              </h3>
              <p className="text-xs text-slate-500 mb-5">Log how you feel today to unlock emotional behavioral correlations</p>

              <form onSubmit={handleMoodSubmit} className="space-y-4">
                {/* Emojis Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">How is your mood today?</label>
                  <div className="flex justify-between gap-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/60">
                    {moodEmojis.map(item => (
                      <button
                        type="button"
                        key={item.score}
                        onClick={() => setMoodScore(item.score)}
                        className={`flex-1 py-1.5 text-lg rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center ${
                          moodScore === item.score 
                            ? 'bg-slate-800 border border-slate-700 shadow-md transform scale-105' 
                            : 'opacity-50 hover:opacity-80'
                        }`}
                        title={item.text}
                      >
                        <span>{item.label}</span>
                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid for Stress, Energy, Motivation */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Stress Level</label>
                    <select
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">1 - Calmer</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Extreme</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Energy Level</label>
                    <select
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">1 - Depleted</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Vibrant</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Motivation</label>
                    <select
                      value={motivationLevel}
                      onChange={(e) => setMotivationLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">1 - Sluggish</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Driven</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Journal Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Weekend triggers, stress skips, overload details..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 mt-2"
                >
                  {submitting ? 'Logging...' : 'Submit Daily Check-in'}
                </button>
              </form>
            </div>
          </div>

          {/* DNA Profile widget */}
          <div className="lg:col-span-3">
            <HabitDnaCard refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            title="Overall Consistency Rating" 
            value={`${data?.overallConsistencyScore || 0}%`} 
            icon={Activity}
            trend="Average active habit execution"
          />
          <MetricCard 
            title="Weighted Productivity" 
            value={`${data?.productivityScore || 0} / 100`} 
            icon={Flame}
            trend="Incorporates streaks & completions"
            glow={true}
          />
          <MetricCard 
            title="Weakest Routine" 
            value={data?.weakestHabitName || 'None'} 
            icon={AlertCircle}
            trend={`${data?.weakestHabitCompletionRate || 0}% completion rate`}
          />
          <MetricCard 
            title="Never Miss Twice Index" 
            value={`${data?.failureRecoveryIndex || 0}%`} 
            icon={Zap}
            trend="Failure recovery consistency"
          />
        </div>

        {/* Main Upgrades Grid: Future Projection and Life Balance Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Future Self Simulation */}
          <div className="lg:col-span-3">
            <FutureSelfSimulation refreshTrigger={refreshTrigger} />
          </div>
          {/* Life Balance Radar chart */}
          <div className="lg:col-span-2">
            <LifeBalanceRadar refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Third Upgrade Row: Mood intelligence and Failure replay timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Intelligence Map */}
          <div>
            <MoodIntelligenceMap refreshTrigger={refreshTrigger} />
          </div>
          {/* Failure Replay Timeline */}
          <div>
            <FailureReplayTimeline refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Habit Stacking Builder */}
        <HabitStackBuilder />

        {/* Standard performance charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Weekly Completions BarChart */}
          <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-96">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Weekly Activity Score</h3>
              <p className="text-xs text-slate-500 mt-0.5">Completions recorded over the last 7 days</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="url(#indigoGrad)" name="Completions" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Monthly Trend AreaChart */}
          <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-96">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Monthly Progress Flow</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily completion aggregates for the last 15 days</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="completedCount" stroke="#10B981" fill="url(#emeraldGrad)" name="Completions" />
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Category Distribution PieChart */}
          <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-96">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Category Shares</h3>
              <p className="text-xs text-slate-500 mt-0.5">Routines categorized by feature area</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              {data?.categoryDistribution?.length === 0 ? (
                <p className="text-xs text-slate-500">No active category habits found.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryDistribution || []}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="category"
                    >
                      {data?.categoryDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 4. Time of Day Efficiency BarChart */}
          <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-96">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Time of Day Map</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of completion logs based on time intervals</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.timeOfDayAnalysis || []} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis dataKey="period" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#violetGrad)" name="Log Count" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Mood Correlation Radar Chart (From legacy) */}
          <div className="glass-card rounded-2xl p-6 border border-[#334155]/60 flex flex-col h-96 lg:col-span-2">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Mood Correlation Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">How your mood influences habit completion counts (legacy check-ins)</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              {data?.moodCorrelation?.length === 0 ? (
                <p className="text-xs text-slate-500">No logs with mood tags loaded.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.moodCorrelation || []}>
                    <PolarGrid stroke="#334155" opacity={0.5} />
                    <PolarAngleAxis dataKey="mood" stroke="#94A3B8" fontSize={11} />
                    <PolarRadiusAxis stroke="#334155" angle={30} domain={[0, 'auto']} fontSize={9} />
                    <Radar name="Completions" dataKey="completedCount" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
        
      </main>
    </div>
  );
};

export default Analytics;
