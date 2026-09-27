import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default',
  accent = 'blue', // 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber'
  className = '',
}) {
  const accentIconStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const badgeStyles = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-md hover:border-slate-300 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${accentIconStyles[accent] || accentIconStyles.blue}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badge && (
          <span className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badgeStyles[badgeType] || badgeStyles.default}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-500 font-medium leading-relaxed truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
