import React from 'react';
import { PnLReportData } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface PnLReportTabProps {
  data: PnLReportData;
}

export function PnLReportTab({ data }: PnLReportTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* 4 Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Income</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">{formatPKR(data.gross_revenue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Rooms + Restaurant Sales</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total OPEX & Payroll</span>
          <div className="text-2xl font-bold text-rose-900 mt-1 font-sans">{formatPKR(data.total_expenses)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Expenses + Staff Salaries + Rent</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Operating Profit</span>
          <div className={`text-2xl font-bold mt-1 font-sans ${data.net_profit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
            {formatPKR(data.net_profit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bottom-line income</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profit Margin</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1 font-sans">{data.profit_margin}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Net Margin Yield</div>
        </div>
      </div>

      {/* Dual Area Chart: Revenue vs Expenses */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Income vs Operating Expenses Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily financial outflow vs inflow comparison</p>
          </div>
        </div>

        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chart_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pnlExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
              <Tooltip formatter={(value: any) => [formatPKR(Number(value)), '']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (PKR)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#pnlRev)" />
              <Area type="monotone" dataKey="expenses" name="Expenses (PKR)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#pnlExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accounting Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Detailed Accounting P&L Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Accounting Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.ledger.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{item.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'REVENUE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold font-mono ${item.type === 'REVENUE' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatPKR(item.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                <td className="p-3 text-slate-900" colSpan={2}>Net Operating Profit</td>
                <td className={`p-3 text-right font-mono text-sm ${data.net_profit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {formatPKR(data.net_profit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
