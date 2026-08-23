import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricTheme = 'emerald' | 'blue' | 'indigo' | 'amber';

interface BiMetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  theme?: MetricTheme;
}

export function BiMetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs last week',
  icon: Icon,
  theme = 'indigo',
}: BiMetricCardProps) {
  const themeStyles = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      tagBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      tagBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
  }[theme];

  const renderTrendTag = () => {
    if (trend === undefined || trend === null) return null;
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border',
          isPositive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            : isNeutral
            ? 'bg-slate-50 text-slate-600 border-slate-200/80'
            : 'bg-rose-50 text-rose-700 border-rose-200/80'
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-emerald-600" />
        ) : isNeutral ? (
          <Minus className="h-3 w-3 text-slate-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-rose-600" />
        )}
        <span>{isPositive ? `+${trend}%` : `${trend}%`}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs transition-all hover:border-slate-300 flex flex-col justify-between min-h-[110px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('p-2 rounded-lg shrink-0', themeStyles.iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        {renderTrendTag()}
      </div>

      {subtitle && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate font-medium">{subtitle}</span>
          {trend !== undefined && <span className="text-[10px] text-slate-400 shrink-0">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
