import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/formatters';
import { Expense } from '@/types/expenses';

export function ExpenseSummaryCards({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const utilities = expenses.filter((e) => e.category === 'utilities').reduce((acc, curr) => acc + curr.amount, 0);
  const maintenance = expenses.filter((e) => e.category === 'maintenance').reduce((acc, curr) => acc + curr.amount, 0);
  const supplies = expenses.filter((e) => e.category === 'supplies').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{formatPKR(total)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Power & Utilities</span>
          <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">{formatPKR(utilities)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Maintenance</span>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">{formatPKR(maintenance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Housekeeping Supplies</span>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">{formatPKR(supplies)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
