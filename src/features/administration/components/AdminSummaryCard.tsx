import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSummaryCardProps {
  title: string;
  description: string;
  badgeText: string;
  to: string;
  icon: any;
  accentColor?: string; // 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose'
}

const ACCENT_STYLES: Record<string, { bg: string; iconBg: string; text: string; border: string }> = {
  indigo: { bg: 'hover:border-indigo-300', iconBg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-900', border: 'border-indigo-100' },
  emerald: { bg: 'hover:border-emerald-300', iconBg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-900', border: 'border-emerald-100' },
  amber: { bg: 'hover:border-amber-300', iconBg: 'bg-amber-50 text-amber-700', text: 'text-amber-900', border: 'border-amber-100' },
  blue: { bg: 'hover:border-blue-300', iconBg: 'bg-blue-50 text-blue-700', text: 'text-blue-900', border: 'border-blue-100' },
  purple: { bg: 'hover:border-purple-300', iconBg: 'bg-purple-50 text-purple-700', text: 'text-purple-900', border: 'border-purple-100' },
  rose: { bg: 'hover:border-rose-300', iconBg: 'bg-rose-50 text-rose-700', text: 'text-rose-900', border: 'border-rose-100' },
};

export function AdminSummaryCard({
  title,
  description,
  badgeText,
  to,
  icon: Icon,
  accentColor = 'indigo',
}: AdminSummaryCardProps) {
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.indigo;

  return (
    <NavLink
      to={to}
      className={cn(
        'group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4 font-sans',
        accent.bg
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center font-bold shadow-xs', accent.iconBg)}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {badgeText}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-600 group-hover:text-indigo-900">
        <span>Configure Module</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </NavLink>
  );
}
