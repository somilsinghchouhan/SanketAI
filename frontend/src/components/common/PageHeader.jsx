import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  badge,
  badgeType = 'default',
  breadcrumbs,
  actions,
  className = '',
}) {
  const badgeStyles = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`mb-6 flex flex-col gap-3 pb-4 border-b border-slate-200/90 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {breadcrumbs && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            {breadcrumbs}
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {badge && (
            <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeStyles[badgeType] || badgeStyles.default}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full items-center gap-2.5 sm:w-auto sm:shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
