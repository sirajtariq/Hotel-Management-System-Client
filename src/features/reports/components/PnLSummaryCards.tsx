import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/formatters';
import { PnLSummary } from '@/types/reports';

export function PnLSummaryCards({ summary }: { summary: PnLSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatPKR(summary.totalRevenue)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">+18.5% YOY</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Expenses</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatPKR(summary.totalExpenses)}
          </div>
          <div className="text-[10px] text-slate-400">Fixed & Variable</div>
        </CardContent>
      </Card>
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Net Profit</span>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatPKR(summary.netProfit)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Net Operating Surplus</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profit Margin</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.profitMargin}%
          </div>
          <div className="text-[10px] text-slate-400">{summary.period}</div>
        </CardContent>
      </Card>
    </div>
  );
}
