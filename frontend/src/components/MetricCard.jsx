import React from 'react';

const MetricCard = ({ title, value, icon: Icon, trend, trendColor = 'text-indigo-400', glow = false }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 glass-card-hover ${glow ? 'pulse-glow border-indigo-500/30' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-slate-800 border border-[#334155] rounded-xl text-indigo-400 shadow-inner">
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
