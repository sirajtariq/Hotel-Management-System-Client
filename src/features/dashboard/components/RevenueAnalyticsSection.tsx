import React, { useState } from 'react';
import { TimeSeriesPoint } from '@/types/dashboard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { formatPKR } from '@/lib/formatters';
import { DollarSign, TrendingUp, BarChart3, LineChart as LineIcon } from 'lucide-react';

interface RevenueAnalyticsSectionProps {
  chartData: TimeSeriesPoint[];
  periodRevenue: number;
  revenueTrend: number;
  adr: number;
  revpar: number;
}

export function RevenueAnalyticsSection({
  chartData,
  periodRevenue,
  revenueTrend,
  adr,
  revpar,
}: RevenueAnalyticsSectionProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const peakDayRevenue = chartData.reduce((max, point) => Math.max(max, point.revenue), 0);
  const avgDailyRevenue = chartData.length > 0 ? periodRevenue / chartData.length : 0;

  return (
    <div className="space-y-6">
      {/* Financial Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Period Total Revenue
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatPKR(periodRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {revenueTrend >= 0 ? `+${revenueTrend}%` : `${revenueTrend}%`} vs prior period
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Average Daily Rate (ADR)
          </div>
          <div className="text-xl font-bold font-mono text-indigo-900 mt-1">
            {formatPKR(adr)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Per occupied room / night
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            RevPAR (Revenue Per Available Room)
          </div>
          <div className="text-xl font-bold font-mono text-purple-900 mt-1">
            {formatPKR(revpar)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Total inventory yield
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Peak Day Revenue
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
            {formatPKR(peakDayRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Avg Daily: {formatPKR(avgDailyRevenue)}
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Revenue & Financial Performance Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily room revenue, ADR, and RevPAR trajectory over selected period
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineIcon className="h-3.5 w-3.5" />
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Bar
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAdr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatPKR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Total Revenue (PKR)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="adr" name="ADR (PKR)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAdr)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatPKR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Daily Revenue (PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revpar" name="RevPAR (PKR)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
