import React from 'react';
import { RevenueReportData } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Layers, CreditCard, ShoppingBag } from 'lucide-react';

interface RevenueAnalyticsTabProps {
  data: RevenueReportData;
}

const COLORS = ['#10b981', '#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b'];

export function RevenueAnalyticsTab({ data }: RevenueAnalyticsTabProps) {
  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Revenue by Room Type */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Revenue Yield by Room Category
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total earnings per room type category</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue_by_room_type} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="room_type" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip formatter={(value: any) => [formatPKR(Number(value)), 'Revenue']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Payment Method Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Payment Method Settlement Ratio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cash vs Credit Card vs Online Bank Collections</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.payment_methods} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {data.payment_methods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatPKR(Number(value)), 'Amount']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            Daily Sales Log & Revenue Trend
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Room Sales (PKR)</th>
                <th className="p-3 text-right">Total Revenue (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.daily_sales.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{row.date}</td>
                  <td className="p-3 text-right font-mono text-slate-700">{formatPKR(row.room_revenue)}</td>
                  <td className="p-3 text-right font-mono text-emerald-700 font-bold">{formatPKR(row.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
