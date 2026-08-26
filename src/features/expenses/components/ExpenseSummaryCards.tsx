import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/formatters';
import { Expense } from '@/types/expenses';
import { Receipt, TrendingDown, Banknote, Building2 } from 'lucide-react';

export function ExpenseSummaryCards({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by Account Head
  const headTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const name = e.accountHeadName || e.category || 'General';
    headTotals[name] = (headTotals[name] || 0) + e.amount;
  });

  let topHeadName = 'None';
  let topHeadAmount = 0;
  Object.entries(headTotals).forEach(([name, amt]) => {
    if (amt > topHeadAmount) {
      topHeadAmount = amt;
      topHeadName = name;
    }
  });

  // Payment Mode Breakdown
  const cashTotal = expenses.filter((e) => (e.paymentMethod || 'CASH') === 'CASH').reduce((acc, curr) => acc + curr.amount, 0);
  const digitalTotal = expenses.filter((e) => (e.paymentMethod || 'CASH') !== 'CASH').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-sans">
      {/* Card 1: Total Expenses */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="text-xl font-extrabold text-rose-700 font-mono tabular-nums">{formatPKR(total)}</div>
            <p className="text-[10px] text-slate-400 font-medium">{expenses.length} records logged</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Top Spending Account Head */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1 max-w-[70%]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Account Head</span>
            <div className="text-sm font-extrabold text-slate-900 truncate" title={topHeadName}>
              {topHeadName}
            </div>
            <p className="text-xs font-mono font-bold text-amber-700">{formatPKR(topHeadAmount)}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Receipt className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Cash Drawer Outflow */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash Drawer Outflow</span>
            <div className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums">{formatPKR(cashTotal)}</div>
            <p className="text-[10px] text-emerald-600 font-semibold">Physical cash paid</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Banknote className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Bank & Digital Outflow */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank & Digital Paid</span>
            <div className="text-xl font-extrabold text-blue-700 font-mono tabular-nums">{formatPKR(digitalTotal)}</div>
            <p className="text-[10px] text-blue-600 font-semibold">Transfer / Card / Wallet</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
