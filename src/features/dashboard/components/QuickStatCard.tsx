import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickStatCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: string;
  isPositive?: boolean;
  icon: React.ElementType;
}

export function QuickStatCard({
  title,
  value,
  subtext,
  trend,
  isPositive = true,
  icon: Icon,
}: QuickStatCardProps) {
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <CardContent className="p-4 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value}
          </div>
          {(subtext || trend) && (
            <div className="flex items-center gap-1.5 text-[11px] mt-1">
              {trend && (
                <span
                  className={cn(
                    'font-semibold px-1 rounded',
                    isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  )}
                >
                  {trend}
                </span>
              )}
              {subtext && <span className="text-slate-400">{subtext}</span>}
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
