import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }) => {
  const colorSchemes = {
    indigo: 'bg-amber-50 text-orange-500 border-amber-100',
    emerald: 'bg-amber-50 text-amber-600 border-amber-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            {trend && <span className="text-amber-600 font-semibold">{trend}</span>}
            <span>{subtitle}</span>
          </p>
        )}
      </div>

      {Icon && (
        <div className={`p-3 rounded-2xl border ${colorSchemes[color] || colorSchemes.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
