import React, { useState, useEffect } from 'react';
import { habitStackAPI, habitAPI } from '../services/api';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

const HabitStackBuilder = () => {
  const [habits, setHabits] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [cueHabitId, setCueHabitId] = useState('');
  const [targetHabitId, setTargetHabitId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const habitsRes = await habitAPI.getAll();
      const stacksRes = await habitStackAPI.getAll();
      setHabits(habitsRes.data);
      setStacks(stacksRes.data);
    } catch (err) {
      console.error('Error fetching habits or stacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStack = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!cueHabitId || !targetHabitId) {
      setError('Please select both cue and target habits.');
      return;
    }

    if (cueHabitId === targetHabitId) {
      setError('A habit cannot stack on itself.');
      return;
    }

    try {
      await habitStackAPI.create({
        cueHabitId: parseInt(cueHabitId),
        targetHabitId: parseInt(targetHabitId),
      });
      setSuccess('Habit stack created successfully!');
      setCueHabitId('');
      setTargetHabitId('');
      fetchData();
    } catch (err) {
      console.error('Failed to create stack:', err);
      const msg = err.response?.data?.error || 'Failed to create stack. Check for circular loops.';
      setError(msg);
    }
  };

  const handleDeleteStack = async (id) => {
    try {
      await habitStackAPI.delete(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete stack:', err);
    }
  };

  const getChains = () => {
    const adj = {};
    const inDegree = new Set();
    const allNodes = new Set();

    stacks.forEach((s) => {
      adj[s.cueHabitId] = { targetId: s.targetHabitId, cueName: s.cueHabitName, targetName: s.targetHabitName, stackId: s.id };
      inDegree.add(s.targetHabitId);
      allNodes.add(s.cueHabitId);
      allNodes.add(s.targetHabitId);
    });

    const heads = Array.from(allNodes).filter((n) => !inDegree.has(n));
    const chains = [];

    heads.forEach((head) => {
      const chain = [];
      let current = head;
      
      const headHabit = habits.find(h => h.id === head);
      if (headHabit) {
        chain.push({ id: head, name: headHabit.name });
      }

      while (adj[current]) {
        const edge = adj[current];
        chain.push({
          id: edge.targetId,
          name: edge.targetName,
          stackId: edge.stackId
        });
        current = edge.targetId;
      }
      if (chain.length > 1) {
        chains.push(chain);
      }
    });

    return chains;
  };

  const chains = getChains();

  const availableCues = habits.filter(
    (h) => !stacks.some((s) => s.cueHabitId === h.id)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
      <h3 className="text-lg font-semibold text-slate-100">Atomic Habit Stacking</h3>
      <p className="text-xs text-slate-400 mt-1">
        Link routines together: <strong>After [Cue Habit], I will do [Target Habit]</strong>.
      </p>

      <form onSubmit={handleCreateStack} className="mt-6 flex flex-col md:flex-row gap-4 items-end bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
        <div className="flex-1 flex flex-col gap-1 w-full">
          <label className="text-xs text-slate-400 font-medium">After completing this habit...</label>
          <select
            value={cueHabitId}
            onChange={(e) => setCueHabitId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-650 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Select Cue Routine</option>
            {availableCues.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center shrink-0 mb-3 text-slate-500">
          <ArrowRight className="w-5 h-5 hidden md:block" />
          <span className="md:hidden text-xs font-semibold uppercase tracking-wider text-slate-500">Then stack:</span>
        </div>

        <div className="flex-1 flex flex-col gap-1 w-full">
          <label className="text-xs text-slate-400 font-medium">...I will immediately perform:</label>
          <select
            value={targetHabitId}
            onChange={(e) => setTargetHabitId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-650 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Select Target Routine</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Stack
        </button>
      </form>

      {error && <p className="text-xs text-red-400 mt-2 font-medium">{error}</p>}
      {success && <p className="text-xs text-emerald-400 mt-2 font-medium">{success}</p>}

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">Current Habit Chains</h4>
        
        {loading ? (
          <div className="py-4 text-center text-slate-400 text-xs animate-pulse">Loading chains...</div>
        ) : chains.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No chains configured yet. Select routines above to build your first stack!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chains.map((chain, chainIdx) => (
              <div 
                key={chainIdx} 
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {chain.map((node, nodeIdx) => (
                    <React.Fragment key={nodeIdx}>
                      {nodeIdx > 0 && <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />}
                      <div className="bg-slate-900 border border-slate-750 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 shadow-sm flex items-center justify-between gap-2">
                        {node.name}
                        {nodeIdx > 0 && (
                          <button
                            onClick={() => handleDeleteStack(node.stackId)}
                            className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Unlink routine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitStackBuilder;
